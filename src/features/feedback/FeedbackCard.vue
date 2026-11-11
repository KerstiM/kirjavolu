<script setup lang="ts">
import PanelSection from '../../components/ui/PanelSection.vue'
import { FEEDBACK_MAILTO } from './feedback'

/**
 * Under the print choices, once the letters are ready: how did they go down? Opens an e-mail.
 * Closed like the other sections; only the support box beside it stays open.
 */
</script>

<template>
  <PanelSection title="Kuidas kirjad meeldisid?" summary="Anna tagasisidet e-kirjaga">
    <p class="feedback__text">Kirjuta paar rida – mis lapsele meeldis, mis jäi puudu.</p>
    <a class="feedback__link" :href="FEEDBACK_MAILTO">Anna tagasisidet</a>
  </PanelSection>
</template>

<style scoped lang="scss">
.feedback__text {
  margin: 0 0 0.6rem;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.feedback__link {
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
