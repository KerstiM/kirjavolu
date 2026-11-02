<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import type { GeneratedItem } from '../../domain/models'
import { SAMPLE_CHILD as child, sampleRequest } from '../../data/demo/sample'
import { useGenerator } from '../../composables/useGenerator'
import BaseButton from '../../components/ui/BaseButton.vue'
import PrintableItem from '../preview/PrintableItem.vue'
import { track } from '../../app/analytics'
import Mascot from '../../components/brand/Mascot.vue'
import TestBar from '../../components/brand/TestBar.vue'
import AiSampleLetter from './AiSampleLetter.vue'
import PassPurchase from '../pass/PassPurchase.vue'
import { DESIGN_KEY, designPath, type Design } from '../../components/brand/design'

/**
 * "Vaata näidet": the first letter of a sample 24-letter Christmas series, written
 * on the spot for a sample child. Nothing is saved and no data has to be entered.
 * "new" at /uus-disain/naide: the letter lies on the cream desk with an airmail edge, and
 * the AI writes a sample letter for the family's own child, and the Jõulupass can be bought.
 */
const props = withDefaults(defineProps<{ design?: Design }>(), { design: 'current' })
provide(DESIGN_KEY, props.design)
const generator = useGenerator()
const letter = ref<GeneratedItem | null>(null)

onMounted(async () => {
  track('sample_shown', {})
  const content = await generator.generate(sampleRequest())
  letter.value = content.items[0] ?? null
})
</script>

<template>
  <div :class="{ 'demo-page--new design-new': design === 'new' }">
  <TestBar v-if="design === 'new'" text="Testvaade: näide uues disainis." link="Vaata praegust" to="/naide" />
  <div class="container section demo">
    <header class="demo__head">
      <span class="eyebrow demo__tag">Näide</span>
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

    <AiSampleLetter v-if="design === 'new'" />
    <PassPurchase v-if="design === 'new'" />

    <div class="demo__next">
      <Mascot v-if="design === 'new'" mood="wave" :size="84" class="demo__mascot" />
      <div>
        <h2>Sinu lapse kirjad räägivad tema huvidest</h2>
        <p>Lisa nimi ja vanus ning näed kohe kõiki 24 kirja. Konto pole vaja, andmed jäävad sinu brauserisse.</p>
        <BaseButton :to="{ path: designPath(design, '/loo'), query: { puhk: 'christmas', tyyp: 'letter' } }" size="lg">
          Loo oma lapsele 24 kirja <ArrowRight aria-hidden="true" />
        </BaseButton>
      </div>
    </div>
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

// --- new design ---------------------------------------------------------------
.demo-page--new {
  .demo__tag {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    background: #fbe3db;
    color: var(--coral-ink);
    letter-spacing: normal;
    text-transform: none;
    transform: rotate(-2deg);
  }
  .demo__head h1 {
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  // The letter arrives as airmail: striped edge, tilted on the desk.
  .demo__letter {
    padding: 10px;
    border-radius: 6px;
    background: repeating-linear-gradient(-45deg, #e8836b 0 14px, #fffdf8 14px 22px, #7c6bb8 22px 36px, #fffdf8 36px 44px);
    box-shadow: var(--shadow);
    transform: rotate(-0.8deg);
    :deep(.paper) {
      box-shadow: none;
    }
  }
  .demo__next {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border: 2px solid #f0e2cf;
    border-radius: 14px;
    background: #fffdf8;
    @media (max-width: 520px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  .demo__mascot {
    flex-shrink: 0;
  }
}
</style>
