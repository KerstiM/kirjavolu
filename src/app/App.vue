<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

const route = useRoute()
</script>

<template>
  <a href="#main" class="skip-link no-print">Liigu sisu juurde</a>
  <AppHeader />
  <main id="main" tabindex="-1" class="app-main">
    <!--
      A time-based CSS animation instead of <Transition>: Transition swaps classes in
      animation-frame callbacks, which background tabs and offscreen print views may
      never run – the page would then stay invisible.
    -->
    <RouterView v-slot="{ Component }">
      <component :is="Component" :key="route.path" class="page-view" />
    </RouterView>
  </main>
  <AppFooter />
</template>

<style scoped lang="scss">
.app-main {
  min-height: calc(100vh - 10rem);
  outline: none;
}
.skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  z-index: 100;
  padding: 0.6rem 1rem;
  background: var(--ink);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  &:focus {
    top: 1rem;
  }
}
</style>
