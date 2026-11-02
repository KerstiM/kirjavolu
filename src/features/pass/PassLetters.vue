<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, UserPlus } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import QuickChildDialog from '../children/QuickChildDialog.vue'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import { nameCase } from '../../domain/text/estonian'
import { NEW_DESIGN_ROOT } from '../../components/brand/design'
import type { ChildProfileDraft } from '../../domain/models'
import { track } from '../../app/analytics'
import { LETTERS_ERROR_TEXTS, LettersRequestError, requestPassLetters } from './passLetters'
import type { SeasonPass } from './seasonPass'

/**
 * The step after buying: pick a child and the elf writes all 24 December letters with the
 * AI. One series uses one generation of the pass; the letters open in the preview.
 */
const props = defineProps<{ pass: SeasonPass }>()
const emit = defineEmits<{ spent: [pass: SeasonPass] }>()
const router = useRouter()
const children = useChildrenStore()
const creations = useCreationsStore()

const childId = ref(children.children[0]?.id ?? '')
watch(
  () => children.children.length,
  () => {
    if (!children.children.some((child) => child.id === childId.value)) childId.value = children.children[0]?.id ?? ''
  },
)
const child = computed(() => children.children.find((candidate) => candidate.id === childId.value))
const options = computed(() => children.children.map((candidate) => ({ value: candidate.id, label: candidate.name })))

const adding = ref(false)
function addChild(draft: ChildProfileDraft): void {
  childId.value = children.add(draft).id
  track('child_added', { from: 'pass' })
  adding.value = false
}

const busy = ref(false)
const error = ref('')

async function write(): Promise<void> {
  if (!child.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const { content, pass } = await requestPassLetters(props.pass.code, child.value)
    creations.add(content)
    emit('spent', pass)
    await router.push({ path: `${NEW_DESIGN_ROOT}/looming/${content.id}`, query: { uus: '1' } })
  } catch (failure) {
    error.value = LETTERS_ERROR_TEXTS[failure instanceof LettersRequestError ? failure.reason : 'failed']
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="pass-letters" aria-labelledby="pass-letters-title">
    <h2 id="pass-letters-title"><Sparkles :size="22" aria-hidden="true" /> Järgmine samm: AI-kirjad</h2>
    <p class="pass-letters__lead">
      Päkapikk Tuduja kirjutab sinu lapsele kõik 24 detsembrikirja, 1. kuni 24. detsembrini, tema huvide põhjal. Üks
      lapse kirjasari kasutab ühe loomiskorra.
    </p>

    <template v-if="options.length">
      <SegmentedControl v-if="options.length > 1" v-model="childId" name="pass-letters-child" label="Kellele?" :options="options" />
      <BaseButton size="lg" :disabled="busy || !child" @click="write">
        <Sparkles aria-hidden="true" />
        <template v-if="busy">Päkapikk kirjutab 24 kirja…</template>
        <template v-else-if="child">Loo {{ nameCase(child, 'genitive') }} jaoks AI-kirjad</template>
      </BaseButton>
      <p v-if="busy" class="pass-letters__wait">See võtab paar minutit. Hoia leht lahti.</p>
      <button v-else type="button" class="pass-letters__add" @click="adding = true">
        <UserPlus :size="16" aria-hidden="true" /> Lisa veel üks laps
      </button>
    </template>
    <BaseButton v-else size="lg" @click="adding = true"><UserPlus aria-hidden="true" /> Lisa laps, kellele kirjad tulevad</BaseButton>

    <p class="pass-letters__privacy">
      Kirjade kirjutamiseks saadetakse tehisarule (Anthropic Claude) ainult lapse eesnimi, vanus, lugemisoskus ja huvid.
      Neid ei salvestata. Kirjad jäävad sinu brauserisse.
    </p>
    <p v-if="error" class="pass-letters__error" role="alert">{{ error }}</p>
    <p class="visually-hidden" role="status" aria-live="polite">{{ busy ? 'Päkapikk kirjutab…' : '' }}</p>

    <QuickChildDialog v-if="adding" @save="addChild" @close="adding = false" />
  </section>
</template>

<style scoped lang="scss">
.pass-letters {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 14px;
  background: var(--lavender-soft);
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.3rem;
    color: var(--lavender-ink);
  }
  p {
    margin: 0;
  }
}
.pass-letters__lead {
  color: var(--ink-soft);
}
.pass-letters__wait {
  font-weight: 600;
}
.pass-letters__add {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--lavender-ink);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.pass-letters__privacy {
  font-size: 0.82rem;
  color: var(--ink-faint);
}
.pass-letters__error {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
}
</style>
