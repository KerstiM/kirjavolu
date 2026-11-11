<script setup lang="ts">
import { PASS_PAGE } from '../../features/pass/seasonPass'
import { PASS_ENABLED } from '../../features/pass/availability'
import { FEEDBACK_MAILTO } from '../../features/feedback/feedback'
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
        <!-- Nothing is sold while the pass is off, so neither link is needed. -->
        <template v-if="PASS_ENABLED">
          <RouterLink :to="PASS_PAGE">Mul on Jõulupassi kood</RouterLink>
          <RouterLink to="/tingimused">Müügitingimused</RouterLink>
        </template>
        <RouterLink to="/privaatsus">Privaatsus</RouterLink>
        <a :href="FEEDBACK_MAILTO">Anna tagasisidet</a>
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
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  a {
    color: var(--ink-soft);
  }
}
</style>
