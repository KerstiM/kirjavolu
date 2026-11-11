<script setup lang="ts">
import { Smartphone } from 'lucide-vue-next'
import OpenInBrowser from './OpenInBrowser.vue'

/**
 * Shown at the top of every page inside Instagram's or Facebook's browser, so a parent
 * moves to the real browser before making letters: they would stay behind here.
 */
</script>

<template>
  <aside class="inapp no-print" aria-labelledby="inapp-title" role="region">
    <div class="container inapp__inner">
      <Smartphone class="inapp__icon" aria-hidden="true" />
      <div class="inapp__text">
        <h2 id="inapp-title" class="inapp__title">Ava Kirjavõlu oma telefoni brauseris</h2>
        <p>Instagrami sees ei saa kirju printida ega PDF-ina salvestada, ja siin loodud kirjad jäävad ainult siia.</p>
        <OpenInBrowser />
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.inapp {
  background: var(--gold-soft);
  border-bottom: 1px solid #f0d9a3;
}
.inapp__inner {
  display: flex;
  gap: 0.75rem;
  padding-block: 0.9rem;
}
.inapp__icon {
  flex-shrink: 0;
  margin-top: 0.15rem;
  color: #8a5f10;
}
.inapp__text p {
  margin: 0.2rem 0 0.6rem;
  font-size: 0.92rem;
  color: var(--ink-soft);
}
.inapp__title {
  margin: 0;
  font-size: 1.05rem;
}
</style>
