<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import BrandMark from './BrandMark.vue'
import BaseButton from '../ui/BaseButton.vue'
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <RouterLink to="/" class="brand" aria-label="Kirjavõlu avaleht">
        <BrandMark />
        <span class="brand__name">Kirjavõlu</span>
      </RouterLink>
      <nav aria-label="Peamenüü" class="nav">
        <RouterLink to="/" class="nav__link nav__link--home" exact-active-class="is-active">Avaleht</RouterLink>
        <RouterLink to="/lapsed" class="nav__link" active-class="is-active">Lapsed</RouterLink>
        <BaseButton to="/loo" size="sm" class="nav__cta">
          <Plus aria-hidden="true" />
          <span class="nav__cta-text">Loo uus</span>
        </BaseButton>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(251, 247, 241, 0.85);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--line);
}
.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 4rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--ink);
}
.brand__name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.nav__link {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  color: var(--ink-soft);
  text-decoration: none;
  font-weight: 500;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  &:hover {
    color: var(--ink);
    background: var(--bg-deep);
  }
  &.is-active {
    color: var(--lavender-ink);
    background: var(--lavender-soft);
  }
}
.nav__cta {
  margin-left: 0.4rem;
}
@media (max-width: 520px) {
  .brand__name {
    font-size: 1.15rem;
  }
  .nav__link {
    padding: 0.4rem 0.55rem;
    font-size: 0.92rem;
  }
  // The brand already links home; keep the bar within phone width.
  .nav__link--home {
    display: none;
  }
}
@media (max-width: 380px) {
  .nav__cta-text {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
}
</style>
