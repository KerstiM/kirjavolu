<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, PartyPopper, Printer, RotateCcw } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import Mascot from '../../components/brand/Mascot.vue'
import { CHRISTMAS_ROOT, DESIGN_KEY } from '../../components/brand/design'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import PrintableItem from '../preview/PrintableItem.vue'
import ItemEditorDialog from '../preview/ItemEditorDialog.vue'
import { nameCase } from '../../domain/text/estonian'
import type { GeneratedItem } from '../../domain/models'
import { AI_SERIES_GENERATOR, LETTERS_ERROR_TEXTS, LettersRequestError, readDecember, requestPassLetters, type LettersError } from '../pass/passLetters'
import { checkPass, formatValidUntil, loadPass, purchaseStatus, type SeasonPass } from '../pass/seasonPass'
import { SELLER } from '../legal/seller'
import { track } from '../../app/analytics'
import PremiumOffer from './PremiumOffer.vue'
import JourneySteps from './JourneySteps.vue'
import { finishWriting, startWriting, takePending, takeWriting } from './pending'

/**
 * /joulukirjad/<id>: the free letters are ready to read, edit and print, and below them the
 * way to make them more personal. The personal letters replace the free ones in the same
 * creation, so there is only ever one set to print. Stripe returns here after paying
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
const child = computed(() => {
  const snapshot = content.value?.request.children[0]
  return snapshot ? (children.byId(snapshot.id) ?? snapshot) : undefined
})
const showAll = ref(false)
const shown = computed(() => (showAll.value ? content.value?.items : content.value?.items.slice(0, 3)) ?? [])
const printLink = computed(() => `/looming/${props.id}`)
// Stripe comes back to the page the purchase started on (this one, or the earlier /ud2 path).
const returnTo = computed(() => route.path)

const pass = ref<SeasonPass | null>(loadPass())
const justBought = ref(false)

// --- editing one letter right here --------------------------------------------
const editing = ref<GeneratedItem | null>(null)
function saveEdit(patch: Pick<GeneratedItem, 'heading' | 'body' | 'signature'>): void {
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
  writing.value = true
  error.value = ''
  failedReason.value = null
  seconds.value = 0
  timer = setInterval(() => seconds.value++, 1000)
  startWriting(props.id, before)
  window.addEventListener('beforeunload', holdPage)
  try {
    const result = await requestPassLetters(code, writer, readDecember(writer.id))
    creations.applyChoices(props.id, result.content)
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
      if (takePending(props.id) && !personal.value) void write()
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
          <h1 v-if="child">{{ personal ? `${nameCase(child, 'genitive')} isiklikud kirjad on valmis` : `${nameCase(child, 'genitive')} 24 jõulukirja on valmis` }}</h1>
          <p class="letters__lead">
            {{
              personal
                ? 'Päkapikk kirjutas need just tema jaoks. Iga kirja saad enne printimist muuta.'
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
            Tavaliselt võtab see paar minutit. Hoia see leht lahti, kirjad ilmuvad siia kõik korraga. Möödunud {{ elapsed }}
          </p>
        </div>
      </section>
      <div v-if="error" class="letters__error" role="alert">
        <p>{{ error }}</p>
        <BaseButton v-if="canRetry && pass" variant="secondary" size="sm" @click="write"><RotateCcw aria-hidden="true" /> Proovi uuesti</BaseButton>
      </div>

      <div class="letters__list">
        <PrintableItem v-for="item in shown" :key="item.id" :item="item" no-variants @edit="editing = item" />
      </div>
      <BaseButton v-if="!showAll && content.items.length > 3" variant="secondary" @click="showAll = true">
        Näita kõiki {{ content.items.length }} kirja
      </BaseButton>

      <PremiumOffer
        v-if="!personal && !writing && !checking && child"
        :child="child"
        :creation-id="content.id"
        :items="content.items.length"
        :pass="pass"
        :busy="writing || checking"
        :return-to="returnTo"
        @write="write"
        @pass="(next) => (pass = next)"
      />
    </div>

    <ItemEditorDialog
      v-if="editing"
      :item="editing"
      :title="editing.label"
      no-variants
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
.letters__list {
  display: grid;
  gap: 1rem;
  :deep(.paper) {
    min-height: 0;
  }
}
</style>
