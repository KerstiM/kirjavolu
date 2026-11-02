<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { FlaskConical } from 'lucide-vue-next'

/** The strip above a new-design test view, with a link back to the current page. */
defineProps<{ text: string; link: string; to: RouteLocationRaw }>()
</script>

<template>
  <p class="test-bar no-print">
    <FlaskConical :size="16" aria-hidden="true" />
    <span>{{ text }}</span>
    <RouterLink :to="to">{{ link }}</RouterLink>
  </p>
</template>

<style scoped lang="scss">
.test-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem 0.6rem;
  margin: 0;
  padding: 0.5rem 1rem;
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  font-size: 0.85rem;
  font-weight: 500;
  a {
    color: inherit;
    font-weight: 600;
  }
}
</style>
