<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import type { GeneratedItem } from '../../domain/models'
import { SAMPLE_CHILD as child, sampleRequest } from '../../data/demo/sample'
import { useGenerator } from '../../composables/useGenerator'
import BaseButton from '../../components/ui/BaseButton.vue'
import PrintableItem from '../preview/PrintableItem.vue'
import { track } from '../../app/analytics'

/**
 * "Vaata näidet": the first letter of a sample 24-letter Christmas series, written
 * on the spot for a sample child. Nothing is saved and no data has to be entered.
 */
const generator = useGenerator()
const letter = ref<GeneratedItem | null>(null)

onMounted(async () => {
  track('sample_shown', {})
  const content = await generator.generate(sampleRequest())
  letter.value = content.items[0] ?? null
})
</script>

<template>
  <div class="container section demo">
    <header class="demo__head">
      <span class="eyebrow">Näide</span>
      <h1>{{ child.name }} saab 1. detsembril sellise kirja</h1>
      <p class="demo__lead">
        {{ child.name }} on {{ child.age }}-aastane ja talle meeldivad mõistatused, koomiksid ja riisipuder. Päkapikk
        kirjutab talle 24 õhtut järjest – iga kiri on terviklik lugu ja järjejutt kadunud tähest seob need kokku.
      </p>
    </header>

    <div class="demo__letter">
      <PrintableItem v-if="letter" :item="letter" readonly />
      <p v-else class="demo__loading" role="status">Päkapikk kirjutab…</p>
    </div>

    <div class="demo__next">
      <h2>Sinu lapse kirjad räägivad tema huvidest</h2>
      <p>Lisa nimi ja vanus ning näed kohe kõiki 24 kirja. Konto pole vaja, andmed jäävad sinu brauserisse.</p>
      <BaseButton :to="{ path: '/loo', query: { puhk: 'christmas', tyyp: 'letter' } }" size="lg">
        Loo oma lapsele 24 kirja <ArrowRight aria-hidden="true" />
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo {
  max-width: 760px;
}
.demo__head h1 {
  font-size: clamp(1.7rem, 4.5vw, 2.4rem);
  margin-bottom: 0.75rem;
}
.demo__lead {
  color: var(--ink-soft);
  margin-bottom: 1.75rem;
}
.demo__letter :deep(.paper) {
  min-height: 24rem;
}
.demo__loading {
  color: var(--ink-soft);
}
.demo__next {
  margin-top: 2rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius);
  background: var(--gold-soft);
  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.4rem;
  }
  p {
    margin: 0 0 1rem;
    color: var(--ink-soft);
  }
}
</style>
