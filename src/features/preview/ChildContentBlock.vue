<script setup lang="ts">
/** One child's content choices, folded away until the parent wants to change that child's letters. */
defineProps<{ name: string; summary: string }>()
</script>

<template>
  <details class="child-block">
    <summary class="child-block__summary">
      <span class="child-block__name">{{ name }}</span>
      <span class="child-block__line">{{ summary }}</span>
    </summary>
    <div class="child-block__body" role="group" :aria-label="name">
      <slot />
    </div>
  </details>
</template>

<style scoped lang="scss">
.child-block {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  &[open] {
    border-color: var(--lavender-mid);
  }
}
.child-block__summary {
  display: flex;
  flex-direction: column;
  min-height: 2.75rem;
  padding: 0.5rem 0.9rem;
  justify-content: center;
  cursor: pointer;
  overflow-wrap: anywhere;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.child-block__name {
  font-weight: 600;
}
.child-block__line {
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.child-block__body {
  display: grid;
  gap: 1rem;
  padding: 0.25rem 0.9rem 1rem;
}
</style>
