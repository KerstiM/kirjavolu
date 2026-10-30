<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { WIZARD_STEPS } from './useWizard'

defineProps<{ current: number }>()
defineEmits<{ go: [step: number] }>()
</script>

<template>
  <nav aria-label="Loomise sammud" class="progress">
    <ol>
      <li
        v-for="(step, index) in WIZARD_STEPS"
        :key="step.id"
        :class="{ 'is-done': index < current, 'is-current': index === current }"
      >
        <button
          type="button"
          class="progress__btn"
          :disabled="index >= current"
          :aria-current="index === current ? 'step' : undefined"
          @click="$emit('go', index)"
        >
          <span class="progress__dot" aria-hidden="true">
            <Check v-if="index < current" :size="14" :stroke-width="3" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="progress__label">{{ step.label }}</span>
        </button>
      </li>
      <li>
        <span class="progress__btn is-static">
          <span class="progress__dot" aria-hidden="true">{{ WIZARD_STEPS.length + 1 }}</span>
          <span class="progress__label">Eelvaade</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.progress ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
}
.progress li {
  flex: 1;
  min-width: 0;
  position: relative;
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 1.05rem;
    left: calc(50% + 1.1rem);
    right: calc(-50% + 1.1rem);
    height: 2px;
    background: var(--line);
  }
  &.is-done::after {
    background: var(--lavender-mid);
  }
}
.progress__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  padding: 0.2rem;
  border: 0;
  background: none;
  cursor: pointer;
  color: var(--ink-faint);
  font-size: 0.85rem;
  font-weight: 500;
  &:disabled,
  &.is-static {
    cursor: default;
  }
  .is-current & {
    color: var(--ink);
    font-weight: 600;
  }
  .is-done & {
    color: var(--lavender-ink);
  }
}
.progress__dot {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  border: 2px solid var(--line-strong);
  background: var(--surface);
  font-weight: 700;
  font-size: 0.85rem;
  .is-current & {
    border-color: var(--lavender);
    background: var(--lavender);
    color: #fff;
    box-shadow: 0 0 0 4px var(--lavender-soft);
  }
  .is-done & {
    border-color: var(--lavender);
    background: var(--lavender-soft);
    color: var(--lavender-ink);
  }
}
.progress__label {
  text-align: center;
  white-space: nowrap;
}
@media (max-width: 560px) {
  .progress__label {
    font-size: 0.72rem;
  }
}
</style>
