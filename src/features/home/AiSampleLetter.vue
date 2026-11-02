<script setup lang="ts">
import { computed, ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import type { GeneratedItem } from '../../domain/models'
import { SAMPLE_CHILD } from '../../data/demo/sample'
import { nameCase } from '../../domain/text/estonian'
import BaseButton from '../../components/ui/BaseButton.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import PrintableItem from '../preview/PrintableItem.vue'
import { useChildrenStore } from '../children/childrenStore'
import { requestSampleLetter, SAMPLE_ERROR_TEXTS, SampleLetterError } from './aiSample'

/**
 * "Proovi AI-kirja": one letter written by the AI for the family's own child, free and
 * without an account. With no profiles yet, the sample child gets the letter.
 */
const store = useChildrenStore()
const candidates = computed(() => (store.children.length ? store.children : [SAMPLE_CHILD]))
const childId = ref(candidates.value[0]?.id ?? '')
const child = computed(() => candidates.value.find((candidate) => candidate.id === childId.value) ?? candidates.value[0])
const options = computed(() => candidates.value.map((candidate) => ({ value: candidate.id, label: candidate.name })))

const busy = ref(false)
const letter = ref<GeneratedItem | null>(null)
const error = ref('')

async function write(): Promise<void> {
  if (!child.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    letter.value = await requestSampleLetter(child.value)
  } catch (failure) {
    error.value = SAMPLE_ERROR_TEXTS[failure instanceof SampleLetterError ? failure.reason : 'failed']
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="ai-sample" aria-labelledby="ai-sample-title">
    <h2 id="ai-sample-title"><Sparkles :size="22" aria-hidden="true" /> Proovi AI-kirja</h2>
    <p class="ai-sample__lead">
      Päkapikk kirjutab sinu lapsele 1. detsembri kirja, mis on päriselt tema jaoks: tema huvide põhjal ja iga kord
      uus. Proovimiseks pole kontot vaja.
    </p>

    <SegmentedControl v-if="options.length > 1" v-model="childId" name="ai-sample-child" label="Kellele?" :options="options" />

    <BaseButton size="lg" :disabled="busy" @click="write">
      <Sparkles aria-hidden="true" />
      <template v-if="busy">Päkapikk kirjutab…</template>
      <template v-else-if="letter">Kirjuta uus kiri</template>
      <template v-else-if="child">Kirjuta {{ nameCase(child, 'genitive') }} jaoks kiri</template>
    </BaseButton>
    <p class="ai-sample__privacy">
      Kirja kirjutamiseks saadetakse tehisarule (Anthropic Claude) ainult lapse eesnimi, vanus, lugemisoskus ja huvid.
      Neid ei salvestata.
    </p>

    <p v-if="error" class="ai-sample__error" role="alert">{{ error }}</p>
    <p class="visually-hidden" role="status" aria-live="polite">{{ busy ? 'Päkapikk kirjutab…' : letter ? 'Kiri on valmis.' : '' }}</p>
    <div v-if="letter" class="ai-sample__letter">
      <PrintableItem :item="letter" readonly />
    </div>
  </section>
</template>

<style scoped lang="scss">
.ai-sample {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  border: 2px dashed var(--lavender-mid);
  border-radius: 14px;
  background: #fff;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.35rem;
    color: var(--lavender-ink);
  }
}
.ai-sample__lead {
  margin: 0;
  color: var(--ink-soft);
}
.ai-sample__privacy {
  margin: 0;
  font-size: 0.82rem;
  color: var(--ink-faint);
}
.ai-sample__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
}
.ai-sample__letter {
  align-self: stretch;
  :deep(.paper) {
    min-height: 20rem;
  }
}
</style>
