<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { designPath, NEW_DESIGN_ROOT } from '../brand/design'

// The terms and the privacy notice open in the design the visitor is looking at.
const route = useRoute()
const design = computed(() => (route.path.startsWith(NEW_DESIGN_ROOT) ? 'new' : 'current'))
</script>

<template>
  <footer class="app-footer">
    <div class="container app-footer__inner">
      <p>
        <strong>Kirjavõlu</strong> · Väikesed maagilised hetked sinu lapsele.
      </p>
      <p class="muted">
        Tekstid tulevad käsitsi kirjutatud mallidest. AI-kirjad ja -lood kirjutab tehisaru ainult siis, kui ise
        valid. Lapsed ja loomingud jäävad sinu seadmesse.
      </p>
      <nav class="app-footer__links" aria-label="Tingimused">
        <RouterLink :to="designPath(design, '/tingimused')">Müügitingimused</RouterLink>
        <RouterLink :to="designPath(design, '/privaatsus')">Privaatsus</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  margin-top: 3rem;
  border-top: 1px solid var(--line);
  background: var(--bg-deep);
  font-size: 0.9rem;
}
.app-footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2rem;
  padding-block: 1.5rem;
  p {
    margin: 0;
  }
}
.app-footer__links {
  display: flex;
  gap: 1.25rem;
  a {
    color: var(--ink-soft);
  }
}
</style>
