<script setup lang="ts">
import { ref, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

/**
 * A panel section the parent opens and closes on its own. The body is only hidden, never
 * removed, so closing a section keeps every choice made inside it.
 */
const props = defineProps<{
  title: string
  /** What is chosen, shown while the section is closed. */
  summary?: string
  open?: boolean
}>()

const isOpen = ref(!!props.open)
const uid = useId()
</script>

<template>
  <section class="panel-section no-print">
    <h3 class="panel-section__title">
      <button type="button" class="panel-section__toggle" :aria-expanded="isOpen" :aria-controls="`${uid}-body`" @click="isOpen = !isOpen">
        <span class="panel-section__text">
          <span>{{ title }}</span>
          <span v-if="summary && !isOpen" class="panel-section__summary">{{ summary }}</span>
        </span>
        <ChevronDown aria-hidden="true" :size="18" class="panel-section__chevron" :class="{ 'is-open': isOpen }" />
      </button>
    </h3>
    <div v-show="isOpen" :id="`${uid}-body`" class="panel-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.panel-section {
  margin-bottom: 0.75rem;
  padding: 0 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.panel-section__title {
  margin: 0;
  font-size: 1.05rem;
}
.panel-section__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.5rem 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
}
.panel-section__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-wrap: anywhere;
}
.panel-section__summary {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--ink-soft);
}
.panel-section__chevron {
  flex: none;
  &.is-open {
    transform: rotate(180deg);
  }
}
.panel-section__body {
  padding-bottom: 1rem;
}
</style>
