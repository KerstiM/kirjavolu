<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Printer } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import Mascot from '../../components/brand/Mascot.vue'
import { DESIGN_KEY, NEW_DESIGN_ROOT } from '../../components/brand/design'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import PrintableItem from '../preview/PrintableItem.vue'
import { nameCase } from '../../domain/text/estonian'
import { AI_SERIES_GENERATOR, LETTERS_ERROR_TEXTS, LettersRequestError, readDecember, requestPassLetters } from '../pass/passLetters'
import { loadPass, purchaseStatus, type SeasonPass } from '../pass/seasonPass'
import Ud2Personal from './Ud2Personal.vue'
import { takePending } from './pending'

/**
 * /ud2/kirjad/<id>: the free letters are ready, and beside them the way to make them
 * personal. The personal letters replace the free ones in the same creation, so there is
 * only ever one set to print. Stripe returns here after paying (?session_id=…).
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

const pass = ref<SeasonPass | null>(loadPass())

// --- writing the personal letters, with something to look at while it takes ---
const writing = ref(false)
const error = ref('')
const seconds = ref(0)
const LINES = [
  'Päkapikk loeb, mida sa kirjutasid…',
  'Esimesed kirjad on pooleli…',
  'Päkapikk paneb detsembri plaanid õigetele päevadele…',
  'Veel natuke, kirju on 24…',
  'Viimased kirjad saavad allkirja…',
]
const line = computed(() => LINES[Math.min(LINES.length - 1, Math.floor(seconds.value / 18))])
let timer: ReturnType<typeof setInterval> | undefined

async function write(): Promise<void> {
  const current = content.value
  const writer = child.value
  if (!current || !writer || !pass.value || writing.value) return
  writing.value = true
  error.value = ''
  seconds.value = 0
  timer = setInterval(() => seconds.value++, 1000)
  try {
    const result = await requestPassLetters(pass.value.code, writer, readDecember(writer.id))
    creations.applyChoices(props.id, result.content)
    pass.value = result.pass
    showAll.value = false
  } catch (failure) {
    error.value = LETTERS_ERROR_TEXTS[failure instanceof LettersRequestError ? failure.reason : 'failed']
  } finally {
    clearInterval(timer)
    writing.value = false
  }
}

// --- back from Stripe ------------------------------------------------------
const checking = ref(false)
const purchaseError = ref('')
let retry: ReturnType<typeof setTimeout> | undefined

async function checkPurchase(sessionId: string, attempt = 0): Promise<void> {
  checking.value = true
  try {
    const result = await purchaseStatus(sessionId)
    if (result.status === 'paid') {
      pass.value = result.pass
      checking.value = false
      await router.replace({ query: {} })
      if (takePending(props.id)) void write()
      return
    }
    if (result.status === 'processing' && attempt < 12) {
      retry = setTimeout(() => checkPurchase(sessionId, attempt + 1), 5000)
      return
    }
    checking.value = false
    purchaseError.value =
      result.status === 'processing'
        ? 'Makse on teel. Värskenda lehte hetke pärast.'
        : 'Makse jäi pooleli ja raha ei võetud. Võid uuesti proovida.'
  } catch {
    checking.value = false
    purchaseError.value = 'Makset ei õnnestunud kontrollida. Kui raha võeti, on kood Stripe’i kviitungil.'
  }
}

onMounted(() => {
  const sessionId = route.query.session_id
  if (typeof sessionId === 'string' && sessionId) void checkPurchase(sessionId)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(retry)
})
</script>

<template>
  <div class="design-new ud2">
    <div v-if="!content" class="container section">
      <p>Neid kirju selles brauseris ei ole.</p>
      <BaseButton to="/ud2">Tee uued kirjad</BaseButton>
    </div>

    <div v-else class="container section letters">
      <header class="letters__head">
        <div>
          <h1 v-if="child">{{ personal ? `${nameCase(child, 'genitive')} isiklikud kirjad on valmis` : `${nameCase(child, 'genitive')} 24 jõulukirja on valmis` }}</h1>
          <p class="letters__lead">
            {{ personal ? 'Päkapikk kirjutas need just tema jaoks. Iga kirja saad enne printimist muuta.' : 'Prindi need kohe tasuta või tee allpool päriselt tema kohta.' }}
          </p>
        </div>
        <BaseButton :to="`${NEW_DESIGN_ROOT}/looming/${content.id}`" size="lg">
          <Printer aria-hidden="true" /> Prindi
        </BaseButton>
      </header>

      <p v-if="checking" class="letters__status" role="status">Kontrollin makset…</p>
      <p v-if="purchaseError" class="letters__error" role="alert">{{ purchaseError }}</p>

      <section v-if="writing" class="writing" aria-live="polite">
        <Mascot mood="think" :size="88" />
        <div>
          <p class="writing__line">{{ line }}</p>
          <p class="writing__time">Umbes poolteist minutit · {{ seconds }} s</p>
        </div>
      </section>
      <p v-if="error" class="letters__error" role="alert">{{ error }}</p>

      <Ud2Personal
        v-if="!personal && !writing && child"
        :child="child"
        :creation-id="content.id"
        :pass="pass"
        :busy="writing || checking"
        @write="write"
        @pass="(next) => (pass = next)"
      />

      <div class="letters__list">
        <PrintableItem v-for="item in shown" :key="item.id" :item="item" readonly />
      </div>
      <BaseButton v-if="!showAll && content.items.length > 3" variant="secondary" @click="showAll = true">
        Näita kõiki {{ content.items.length }} kirja
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.letters {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 52rem;
}
.letters__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  h1 {
    margin: 0;
    font-size: clamp(1.6rem, 4.5vw, 2.3rem);
    text-wrap: balance;
  }
}
.letters__lead {
  margin: 0.4rem 0 0;
  color: var(--ink-soft);
}
.letters__status {
  margin: 0;
}
.letters__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
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
}
.letters__list {
  display: grid;
  gap: 1rem;
  :deep(.paper) {
    min-height: 0;
  }
}
</style>
