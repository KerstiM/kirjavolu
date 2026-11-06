<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import BrandMark from './BrandMark.vue'
import BaseButton from '../ui/BaseButton.vue'
import { newCreationRequests } from '../../features/creation/newCreation'
import { useCreationsStore } from '../../features/preview/creationsStore'
import { currentPromo } from '../../features/home/seasonal'
import { isActive, loadPass, PASS_CHANGED, PASS_PAGE } from '../../features/pass/seasonPass'
import { PASS_ENABLED } from '../../features/pass/availability'

const route = useRoute()
// Everything already made stays one click away, whichever page the parent is on.
const creations = useCreationsStore()
// In season the menu has a short way to the seasonal journey (now the Christmas letters).
const promo = currentPromo()
// A family with a Jõulupass sees what is left; without one the link would only be an ad.
const pass = ref(PASS_ENABLED ? loadPass() : null)
const refreshPass = () => (pass.value = loadPass())
onMounted(() => window.addEventListener(PASS_CHANGED, refreshPass))
onBeforeUnmount(() => window.removeEventListener(PASS_CHANGED, refreshPass))
const passLeft = computed(() => (pass.value && isActive(pass.value) ? pass.value.generationsLeft : null))

// The link does nothing while the wizard is already open, so ask it to start over.
function startOver(): void {
  if (route.name === 'create' || route.name === 'create-new') newCreationRequests.value++
}
</script>

<template>
  <header class="app-header" :class="{ 'app-header--long': promo && pass }">
    <div class="container app-header__inner">
      <RouterLink to="/" class="brand" exact-active-class="is-active" aria-label="Kirjavõlu avaleht">
        <BrandMark />
        <span class="brand__name">Kirjavõlu</span>
      </RouterLink>
      <nav aria-label="Peamenüü" class="nav">
        <RouterLink v-if="promo" :to="promo.to" class="nav__link nav__link--season" active-class="is-active">{{ promo.menu }}</RouterLink>
        <RouterLink v-if="creations.creations.length" to="/minu" class="nav__link" active-class="is-active">Minu kirjad</RouterLink>
        <RouterLink to="/lapsed" class="nav__link" active-class="is-active">Lapsed</RouterLink>
        <RouterLink
          v-if="pass"
          :to="PASS_PAGE"
          class="nav__link nav__link--pass"
          active-class="is-active"
          :aria-label="passLeft !== null ? `Jõulupass, kirjasarju või lugusid alles ${passLeft}` : undefined"
        >
          Jõulupass<span v-if="passLeft !== null" class="nav__count" aria-hidden="true">{{ passLeft }}</span>
        </RouterLink>
        <BaseButton to="/loo" size="sm" class="nav__cta" @click="startOver">
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
// On the home page the name is the "you are here" mark, since the menu has no Avaleht link.
.brand.is-active .brand__name {
  color: var(--lavender-ink);
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
.nav__link--season {
  color: var(--coral-ink);
}
.nav__link--pass {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--coral-ink);
}
.nav__count {
  min-width: 1.4rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--coral-soft);
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 520px) {
  .brand__name {
    font-size: 1.15rem;
  }
  .nav__link {
    padding: 0.4rem 0.55rem;
    font-size: 0.92rem;
  }
}
// "Loo uus" keeps only its plus on a phone, so the menu stays one line.
@media (max-width: 640px) {
  .nav__cta-text {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
}
// With both the season and the pass in the menu, the logo alone stands for the name and the
// links sit closer, so a 360 px phone still has one line.
@media (max-width: 460px) {
  .app-header--long {
    .brand__name {
      display: none;
    }
    .nav {
      gap: 0;
    }
    .nav__link {
      padding-inline: 0.4rem;
      font-size: 0.88rem;
    }
    .nav__cta {
      margin-left: 0.2rem;
    }
  }
}
</style>
