<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', to: undefined, disabled: false },
)

const classes = computed(() => ['btn', `btn--${props.variant}`, `btn--${props.size}`])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <button v-else :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1.5px solid transparent;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  max-width: 100%;
  white-space: nowrap;
  text-align: center;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  // A long label wraps on a narrow screen instead of widening the page.
  @media (max-width: 520px) {
    white-space: normal;
  }
  :deep(svg) {
    width: 1.1em;
    height: 1.1em;
    flex-shrink: 0;
  }
}

.btn--sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.875rem;
}
.btn--md {
  padding: 0.65rem 1.25rem;
}
.btn--lg {
  padding: 0.85rem 1.6rem;
  font-size: 1.05rem;
}

.btn--primary {
  background: var(--lavender);
  color: #fff;
  box-shadow: 0 6px 16px rgba(107, 90, 168, 0.25);
  &:hover:not(:disabled) {
    background: var(--lavender-ink);
  }
}
.btn--secondary {
  background: var(--surface);
  color: var(--ink);
  border-color: var(--line-strong);
  &:hover:not(:disabled) {
    border-color: var(--lavender);
    color: var(--lavender-ink);
  }
}
.btn--ghost {
  background: transparent;
  color: var(--ink-soft);
  &:hover:not(:disabled) {
    background: var(--lavender-soft);
    color: var(--lavender-ink);
  }
}
.btn--danger {
  background: transparent;
  color: var(--danger);
  border-color: rgba(179, 38, 30, 0.3);
  &:hover:not(:disabled) {
    background: #fdecea;
  }
}
</style>
