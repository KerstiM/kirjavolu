<script setup lang="ts">
import type { Component } from 'vue'
import BaseButton from '../../../components/ui/BaseButton.vue'

/**
 * A choice already made (on the home page or earlier in the wizard), shown as one line
 * instead of the whole list again. "Muuda" opens the list.
 */
defineProps<{ icon: Component; title: string; detail: string; color?: string; changeLabel: string }>()
const emit = defineEmits<{ change: [] }>()
</script>

<template>
  <div class="picked">
    <span class="picked__icon" :style="color ? { background: color } : undefined" aria-hidden="true">
      <component :is="icon" :size="20" />
    </span>
    <span class="picked__text">
      <strong>{{ title }}</strong>
      <span>{{ detail }}</span>
    </span>
    <BaseButton variant="secondary" size="sm" :aria-label="changeLabel" @click="emit('change')">Muuda</BaseButton>
  </div>
</template>

<style scoped lang="scss">
.picked {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  border: 2px solid var(--lavender);
  border-radius: 14px;
  background: #fff;
}
.picked__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--lavender);
  color: #fff;
}
.picked__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  span {
    color: var(--ink-soft);
    font-size: 0.9rem;
  }
}
</style>
