<script setup lang="ts">
import PanelSection from '../../components/ui/PanelSection.vue'

/**
 * Beside the print choices: where the personal letters will be offered once the Jõulupass is on
 * sale (see PassOfferCard). A section like the others, closed, but gray and with nothing to press.
 */
</script>

<template>
  <PanelSection class="soon" title="Muuda kirjad veel isiklikumaks" summary="Varsti · päkapikk kirjutab sinu sõnadega">
    <p class="soon__badge">Varsti</p>
    <p class="soon__text">Päkapikk kirjutab kirjad ümber just sinu lapse jaoks: pereliikmed, huvid ja jõuluplaanid sinu enda sõnadega.</p>
  </PanelSection>
</template>

<style scoped lang="scss">
.soon {
  background: #f6f2ec;
  border-color: #e6ded3;
  color: var(--ink-soft);
  :deep(.panel-section__toggle) {
    color: var(--ink-soft);
  }
}
.soon__badge {
  display: inline-block;
  margin: 0 0 0.5rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: #e6ded3;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.soon__text {
  margin: 0;
}
</style>
