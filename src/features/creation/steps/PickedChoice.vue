<script setup lang="ts">
import { computed, type Component } from 'vue'
import BaseButton from '../../../components/ui/BaseButton.vue'

/**
 * A choice already made (on the home page or earlier in the wizard), shown as one line
 * instead of the whole list again. It looks like the selected postcard or stamp it stands
 * for: the same airmail edge, colours and display face. "Muuda" opens the list.
 */
const props = defineProps<{
  icon: Component
  title: string
  detail: string
  /** The card's ink (border, icon) and airmail edge colours. */
  ink: string
  edge: [string, string]
  changeLabel: string
}>()
const emit = defineEmits<{ change: [] }>()

const style = computed(() => ({ '--card-ink': props.ink, '--edge-a': props.edge[0], '--edge-b': props.edge[1] }))
</script>

<template>
  <div class="picked" :style="style">
    <span class="picked__edge" aria-hidden="true" />
    <div class="picked__body">
      <span class="picked__icon" aria-hidden="true"><component :is="icon" :size="20" :stroke-width="1.8" /></span>
      <span class="picked__text">
        <span class="picked__title">{{ title }}</span>
        <span class="picked__detail">{{ detail }}</span>
      </span>
      <BaseButton variant="secondary" size="sm" :aria-label="changeLabel" @click="emit('change')">Muuda</BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.picked {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.8rem 1.1rem 1rem;
  border: 2px solid var(--card-ink);
  border-radius: 16px;
  background: #fff;
}
.picked__edge {
  height: 7px;
  border-radius: 4px;
  background: repeating-linear-gradient(90deg, var(--edge-a) 0 12px, #fff 12px 18px, var(--edge-b) 18px 30px, #fff 30px 36px);
}
.picked__body {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.picked__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--card-ink);
  color: #fff;
}
.picked__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.picked__title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
}
.picked__detail {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
</style>
