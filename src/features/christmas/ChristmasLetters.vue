<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, PartyPopper, Printer, RotateCcw, Sparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import Mascot from '../../components/brand/Mascot.vue'
import { CHRISTMAS_ROOT, DESIGN_KEY } from '../../components/brand/design'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import PrintableItem from '../preview/PrintableItem.vue'
import ItemEditorDialog from '../preview/ItemEditorDialog.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import { nameCase, namesInCase } from '../../domain/text/estonian'
import type { GeneratedItem } from '../../domain/models'
import {
  AI_SERIES_GENERATOR,
  FIX_ERROR_TEXTS,
  LETTER_LENGTH_OPTIONS,
  LETTERS_ERROR_TEXTS,
  LettersRequestError,
  readDecember,
  readLength,
  requestLetterFix,
  requestPassLetters,
  writeLength,
  type LetterLength,
  type LettersError,
} from '../pass/passLetters'
import { checkPass, formatValidUntil, isActive, loadPass, purchaseStatus, type SeasonPass } from '../pass/seasonPass'
import { SELLER } from '../legal/seller'
import { track } from '../../app/analytics'
import PremiumOffer from './PremiumOffer.vue'
import RecentCreations from '../home/RecentCreations.vue'
import JourneySteps from './JourneySteps.vue'
import { finishWriting, startWriting, takePending, takeWriting } from './pending'

/**
 * /joulukirjad/<id>: the free letters are ready to read, edit and print, and below them the
 * way to make them more personal. For one child the personal letters replace the free ones in
 * the same creation, so there is only ever one set to print; siblings' linked letters stay, and
 * each child's personal series becomes a creation of its own beside them. Stripe returns here after paying
 * (?session_id=…); the payment counts only once the server has asked Stripe about it.
 */
provide(DESIGN_KEY, 'new')
const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const creations = useCreationsStore()
const children = useChildrenStore()

const content = computed(() => creations.byId(props.id))
const personal = computed(() => content.value?.generator.id === AI_SERIES_GENERATOR)
// The children as they are now in this browser, so what the parent added since counts too.
const family = computed(() => (content.value?.request.children ?? []).map((snapshot) => children.byId(snapshot.id) ?? snapshot))
const isFamily = computed(() => family.value.length > 1)
// For siblings one child at a time: whose letters are shown and whose are made personal.
const childId = ref(family.value[0]?.id ?? '')
const child = computed(() => family.value.find((member) => member.id === childId.value) ?? family.value[0])
const showAll = ref(false)
const ownItems = computed(() =>
  (content.value?.items ?? []).filter((item) => !isFamily.value || !item.childId || item.childId === child.value?.id),
)
const shown = computed(() => (showAll.value ? ownItems.value : ownItems.value.slice(0, 3)))
function pick(id: string): void {
  childId.value = id
  showAll.value = false
}
/** A sibling's personal series, written from these linked letters (the newest, if more). */
function personalFor(id: string) {
  const since = content.value?.createdAt ?? ''
  return creations.creations.find(
    (creation) => creation.generator.id === AI_SERIES_GENERATOR && creation.request.children[0]?.id === id && creation.createdAt >= since,
  )
}
const printLink = computed(() => `/looming/${props.id}`)
// Stripe comes back to the page the purchase started on (this one, or the earlier /ud2 path).
const returnTo = computed(() => route.path)

const pass = ref<SeasonPass | null>(loadPass())
const justBought = ref(false)
const passActive = computed(() => !!pass.value && isActive(pass.value))
// The length picked last time for this child; medium the first time.
const length = ref<LetterLength>(child.value ? readLength(child.value.id) : 'medium')
const lengthHint = computed(() => LETTER_LENGTH_OPTIONS.find((option) => option.value === length.value)?.hint)

// --- editing one letter right here --------------------------------------------
const editing = ref<GeneratedItem | null>(null)
// A personal letter can also be rewritten by the elf as the parent asks: one of the pass's fixes.
const aiNote = computed(() =>
  pass.value && new Date(pass.value.validUntil) > new Date()
    ? `Kulub 1 päkapiku muudatus, alles on ${pass.value.fixesLeft ?? 30}.`
    : 'Päkapikult muudatust paludes kulub Jõulupassist üks muudatus. Sisesta selleks oma kood lehel „Jõulupass“.',
)
async function fixWithAi(wish: string): Promise<Pick<GeneratedItem, 'heading' | 'body' | 'signature'>> {
  const current = content.value
  const writer = child.value
  const code = pass.value?.code
  const index = current?.items.findIndex((item) => item.id === editing.value?.id) ?? -1
  if (!current || !writer || !code || index < 0) throw new Error(FIX_ERROR_TEXTS.failed)
  try {
    const result = await requestLetterFix(code, writer, current.items, index, wish)
    pass.value = result.pass
    return result.letter
  } catch (failure) {
    throw new Error(FIX_ERROR_TEXTS[failure instanceof LettersRequestError ? failure.reason : 'failed'])
  }
}
function saveEdit(patch: Pick<GeneratedItem, 'label' | 'heading' | 'body' | 'signature'>): void {
  if (editing.value) creations.editItem(props.id, editing.value.id, patch)
  editing.value = null
}

// --- writing the personal letters ----------------------------------------------
// No made-up stages or percentages: the server answers once, when all 24 are written.
const writing = ref(false)
const error = ref('')
const failedReason = ref<LettersError | null>(null)
const seconds = ref(0)
const elapsed = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`)
let timer: ReturnType<typeof setInterval> | undefined

// Closing the page while the server writes would lose the letters, so the browser asks first.
function holdPage(event: BeforeUnloadEvent): void {
  event.preventDefault()
}

/**
 * A request that failed on the way (or a page closed while writing) may still have used a
 * series on the server. Asking the server for the count tells which it was.
 */
async function lostSeries(code: string, before: number): Promise<boolean> {
  try {
    const now = await checkPass(code)
    pass.value = now
    return now.generationsLeft < before
  } catch {
    return false
  }
}
const lostText = `Jõulupassist kulus üks kirjasari, aga kirjad ei jõudnud kohale. Kirjuta ${SELLER.email}, anname selle tagasi.`

async function write(): Promise<void> {
  const current = content.value
  const writer = child.value
  const code = pass.value?.code
  if (!current || !writer || !pass.value || !code || writing.value) return
  const before = pass.value.generationsLeft
  writeLength(writer.id, length.value)
  writing.value = true
  error.value = ''
  failedReason.value = null
  seconds.value = 0
  timer = setInterval(() => seconds.value++, 1000)
  startWriting(props.id, before)
  window.addEventListener('beforeunload', holdPage)
  try {
    const result = await requestPassLetters(code, writer, readDecember(writer.id), length.value)
    if (isFamily.value) creations.add(result.content)
    else creations.applyChoices(props.id, result.content)
    pass.value = result.pass
    showAll.value = false
    track('premium_generated', { type: 'letter', items: result.content.items.length })
  } catch (failure) {
    const reason = failure instanceof LettersRequestError ? failure.reason : 'failed'
    failedReason.value = reason
    track('premium_failed', { reason })
    error.value = reason === 'failed' && (await lostSeries(code, before)) ? lostText : LETTERS_ERROR_TEXTS[reason]
  } finally {
    clearInterval(timer)
    window.removeEventListener('beforeunload', holdPage)
    finishWriting()
    writing.value = false
  }
}
/** "Kirjuta kõik uuesti": a whole new personal series, e.g. longer; it uses one more series. */
function writeAgain(): void {
  const edited = content.value?.items.some((item) => item.edited)
  if (edited && !window.confirm('Uued kirjad tulevad praeguste asemele ja sinu muudatused kaovad. Kas jätkata?')) return
  void write()
}
const canRetry = computed(() => !!failedReason.value && ['failed', 'busy', 'too_many'].includes(failedReason.value))

// --- back from Stripe ------------------------------------------------------
// Back from Stripe: the offer stays hidden from the first render until the payment is known.
const checking = ref(typeof route.query.session_id === 'string' && route.query.session_id !== '')
const purchaseError = ref('')
let retry: ReturnType<typeof setTimeout> | undefined

async function checkPurchase(sessionId: string, attempt = 0): Promise<void> {
  checking.value = true
  try {
    const result = await purchaseStatus(sessionId)
    if (result.status === 'paid') {
      pass.value = result.pass
      justBought.value = true
      track('purchase', { product: 'season-pass' })
      // The code is saved; a reload should not ask Stripe again.
      await router.replace({ query: {} })
      // Writing starts before the offer could show again, so the buyer never sees a second "Osta".
      const pending = takePending(props.id)
      if (pending?.child && family.value.some((member) => member.id === pending.child)) childId.value = pending.child
      if (pending && !personal.value) void write()
      checking.value = false
      return
    }
    if (result.status === 'processing' && attempt < 12) {
      retry = setTimeout(() => checkPurchase(sessionId, attempt + 1), 5000)
      return
    }
    checking.value = false
    purchaseError.value =
      result.status === 'processing'
        ? 'Makse on teel. Värskenda lehte hetke pärast, siis jätkame siit.'
        : 'Makse jäi pooleli ja raha ei võetud. Võid allpool uuesti proovida.'
  } catch {
    checking.value = false
    purchaseError.value = `Makset ei õnnestunud kontrollida. Kui raha võeti, on Jõulupassi kood Stripe'i kviitungil. Värskenda lehte hetke pärast või kirjuta ${SELLER.email}.`
  }
}

// --- a page closed while the letters were being written ------------------------
const interrupted = ref('')
async function checkInterrupted(): Promise<void> {
  const left = takeWriting(props.id)
  if (left === null || personal.value) return
  const code = pass.value?.code
  interrupted.value =
    code && (await lostSeries(code, left))
      ? `Eelmine kirjutamine jäi pooleli, sest leht suleti või laaditi uuesti. ${lostText}`
      : 'Eelmine kirjutamine jäi pooleli, sest leht suleti või laaditi uuesti. Loomiskord jäi alles, võid uuesti proovida.'
}

onMounted(() => {
  const sessionId = route.query.session_id
  if (typeof sessionId === 'string' && sessionId) void checkPurchase(sessionId)
  else void checkInterrupted()
  // Coming from the preview's offer: straight to it.
  if (route.hash === '#isiklikumaks') document.getElementById('isiklikumaks')?.scrollIntoView?.()
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(retry)
  window.removeEventListener('beforeunload', holdPage)
})
</script>

<template>
  <div class="design-new christmas">
    <div v-if="!content" class="container section letters">
      <h1>Neid kirju selles brauseris ei ole</h1>
      <p class="letters__lead">Kirjad hoitakse brauseris, kus need tehti. Teises seadmes või brauseris saad teha uued.</p>
      <BaseButton :to="CHRISTMAS_ROOT">Tee uued kirjad</BaseButton>
    </div>

    <div v-else class="container section letters">
      <JourneySteps :current="personal ? 3 : 2" />
      <header class="letters__head">
        <div>
          <h1 v-if="isFamily">{{ namesInCase(family, 'genitive') }} jõulukirjad on valmis</h1>
          <h1 v-else-if="child">{{ personal ? `${nameCase(child, 'genitive')} isiklikud kirjad on valmis` : `${nameCase(child, 'genitive')} 24 jõulukirja on valmis` }}</h1>
          <p class="letters__lead">
            {{
              personal
                ? 'Päkapikk kirjutas need just tema jaoks. Iga kirja saad enne printimist muuta.'
                : isFamily
                  ? 'Seotud kirjad: sama päkapikumaailm, igal lapsel oma 24 kirja ja vahel ühine ülesanne. Tasuta.'
                  : 'Need on sinu omad ja tasuta: loe läbi, muuda ja prindi. Kirjad jäävad sinu brauserisse.'
            }}
          </p>
        </div>
        <div class="letters__actions">
          <BaseButton :to="printLink" size="lg">
            <Printer aria-hidden="true" /> Prindi või salvesta PDF
          </BaseButton>
          <a v-if="!personal && !writing" href="#isiklikumaks" class="letters__more">
            Tee kirjad isiklikumaks <ArrowDown :size="16" aria-hidden="true" />
          </a>
        </div>
      </header>

      <p v-if="checking" class="letters__status" role="status">Kontrollin Stripe'ilt makset…</p>
      <p v-if="purchaseError" class="letters__error" role="alert">{{ purchaseError }}</p>
      <p v-if="interrupted" class="letters__error" role="alert">{{ interrupted }}</p>

      <section v-if="justBought && pass" class="bought" aria-labelledby="bought-title">
        <h2 id="bought-title"><PartyPopper :size="20" aria-hidden="true" /> Aitäh! Jõulupass on sinu</h2>
        <p>
          Kood <strong class="bought__code">{{ pass.code }}</strong> on salvestatud sellesse brauserisse ja on ka Stripe'i
          kviitungil. Sellega saad passi kasutada teises seadmes. Kirjasarju alles {{ pass.generationsLeft }}, kehtib kuni
          {{ formatValidUntil(pass) }}.
        </p>
      </section>

      <section v-if="writing" class="writing" aria-live="polite">
        <Mascot mood="think" :size="80" />
        <div>
          <p class="writing__line">Päkapikk kirjutab {{ child ? nameCase(child, 'allative') : '' }} 24 isiklikku kirja</p>
          <p class="writing__time">
            Tavaliselt võtab see poolteist kuni kolm minutit, pikemate kirjadega kauem. Hoia see leht lahti, kirjad
            ilmuvad siia kõik korraga. Möödunud {{ elapsed }}
          </p>
        </div>
      </section>
      <div v-if="error" class="letters__error" role="alert">
        <p>{{ error }}</p>
        <BaseButton v-if="canRetry && pass" variant="secondary" size="sm" @click="write"><RotateCcw aria-hidden="true" /> Proovi uuesti</BaseButton>
      </div>

      <div v-if="isFamily" class="kids" role="tablist" aria-label="Kelle kirjad">
        <button
          v-for="member in family"
          :key="member.id"
          type="button"
          role="tab"
          class="kid"
          :class="{ 'is-active': member.id === child?.id }"
          :aria-selected="member.id === child?.id"
          :disabled="writing"
          @click="pick(member.id)"
        >
          {{ member.name }}<span class="kid__mark"> · {{ personalFor(member.id) ? 'isiklikud valmis' : 'tasuta kirjad' }}</span>
        </button>
      </div>

      <p v-if="isFamily && !writing && !personal" class="kids__hint">
        Isiklikud kirjad kirjutatakse igale lapsele eraldi: vali sakk ja vajuta allpool nuppu. Iga laps kulutab Jõulupassist ühe kirjasarja.
      </p>
      <p v-if="writing" class="letters__status">Allpool on praegused tasuta kirjad. Uued isiklikud kirjad ilmuvad, kui need on valmis.</p>

      <div class="letters__list" :class="{ 'is-writing': writing }" :inert="writing">
        <PrintableItem v-for="item in shown" :key="item.id" :item="item" no-variants @edit="editing = item" />
      </div>
      <BaseButton v-if="!showAll && ownItems.length > 3" variant="secondary" @click="showAll = true">
        Näita kõiki {{ ownItems.length }} kirja<template v-if="isFamily && child"> ({{ child.name }})</template>
      </BaseButton>

      <section v-if="isFamily && child && personalFor(child.id) && !writing" class="again" aria-labelledby="done-title">
        <h2 id="done-title">{{ nameCase(child, 'genitive') }} isiklikud kirjad on valmis</h2>
        <p>Need on eraldi loomingus; tasuta pere kirjad jäävad alles. Seal saad neid muuta, uuesti kirjutada ja printida.</p>
        <BaseButton :to="`${CHRISTMAS_ROOT}/${personalFor(child.id)!.id}`">Ava {{ nameCase(child, 'genitive') }} isiklikud kirjad</BaseButton>
      </section>

      <section v-if="personal && !writing && child" class="again" aria-labelledby="again-title">
        <h2 id="again-title">Pole päris see, mida ootasid?</h2>
        <p>
          Iga kirja saad muuta nupuga „Muuda“. Seal saab ka päkapikult paluda, et ta kirjutaks just selle kirja ümber
          (näiteks „tee pikemaks“ või „lisa vanaema Liisi“).
        </p>
        <template v-if="passActive && pass">
          <SegmentedControl v-model="length" name="again-length" label="Kirjade pikkus" :options="LETTER_LENGTH_OPTIONS" :hint="lengthHint" />
          <BaseButton variant="secondary" @click="writeAgain"><Sparkles aria-hidden="true" /> Kirjuta kõik uuesti</BaseButton>
          <p class="again__note">Kasutab ühe kirjasarja, alles on {{ pass.generationsLeft }}. Uued kirjad tulevad nende asemele.</p>
        </template>
      </section>

      <PremiumOffer
        v-if="!personal && !writing && !checking && child && !(isFamily && personalFor(child.id))"
        :key="child.id"
        v-model:length="length"
        :child="child"
        :creation-id="content.id"
        :items="ownItems.length"
        :family="isFamily"
        :pass="pass"
        :busy="writing || checking"
        :return-to="returnTo"
        @write="write"
        @pass="(next) => (pass = next)"
      />

      <RecentCreations v-if="!writing" inline heading="Kõik minu kirjad" />
    </div>

    <ItemEditorDialog
      v-if="editing"
      :item="editing"
      :title="editing.label"
      no-variants
      :ai-fix="personal ? fixWithAi : undefined"
      :ai-note="personal ? aiNote : undefined"
      @save="saveEdit"
      @close="editing = null"
    />
  </div>
</template>

<style scoped lang="scss">
.letters {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 52rem;
  h1 {
    margin: 0;
    font-size: clamp(1.6rem, 4.5vw, 2.3rem);
    text-wrap: balance;
  }
  > :deep(.journey) {
    justify-content: flex-start;
  }
}
.letters__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.letters__lead {
  margin: 0.4rem 0 0;
  color: var(--ink-soft);
}
.letters__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 560px) {
    align-self: stretch;
    :deep(.btn) {
      justify-content: center;
    }
  }
}
.letters__more {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--coral-ink);
  font-weight: 600;
  font-size: 0.95rem;
}
.letters__status {
  margin: 0;
}
.letters__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
  p {
    margin: 0;
  }
}
.bought {
  padding: 1rem 1.25rem;
  border-radius: 16px;
  background: var(--sage-soft);
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.35rem;
    font-size: 1.2rem;
  }
  p {
    margin: 0;
  }
}
.bought__code {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.05em;
}
.writing {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: var(--lavender-soft);
  p {
    margin: 0;
  }
}
.writing__line {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--lavender-ink);
}
.writing__time {
  color: var(--ink-soft);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}
.kids {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.kid {
  min-height: 2.75rem;
  padding: 0.45rem 1rem;
  border: 2px solid var(--lavender-mid);
  border-radius: 999px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  &.is-active {
    border-color: var(--lavender);
    background: var(--lavender-soft);
    color: var(--lavender-ink);
    font-weight: 600;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.kids__hint {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
.letters__list.is-writing {
  opacity: 0.45;
  filter: grayscale(0.6);
}
.kid__mark {
  font-weight: 400;
  font-size: 0.85rem;
}
.again {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid #f0e2cf;
  border-radius: 16px;
  background: #fff;
  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  p {
    margin: 0;
    color: var(--ink-soft);
  }
}
.again__note {
  font-size: 0.9rem;
}
.letters__list {
  display: grid;
  gap: 1rem;
  :deep(.paper) {
    min-height: 0;
  }
}
</style>
