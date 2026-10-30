<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{ title: string; text?: string; icon?: Component }>()
</script>

<template>
  <div class="empty">
    <span v-if="icon" class="empty__icon" aria-hidden="true">
      <component :is="icon" :size="28" :stroke-width="1.6" />
    </span>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="text" class="empty__text">{{ text }}</p>
    <div class="empty__actions"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  border: 1.5px dashed var(--line-strong);
  border-radius: var(--radius);
  background: var(--surface-2);
}
.empty__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  margin-bottom: 1rem;
}
.empty__title {
  font-size: 1.2rem;
  margin-bottom: 0.35rem;
}
.empty__text {
  color: var(--ink-soft);
  max-width: 34rem;
}
.empty__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
