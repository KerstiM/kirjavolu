<script setup lang="ts">
/**
 * Where the parent is in the Christmas letters: who for, the free letters, and (if they want)
 * the personal ones. The third step is named as optional, so it never reads like a toll gate.
 */
defineProps<{ current: 1 | 2 | 3 }>()
const STEPS = ['Kellele?', 'Tasuta kirjad', 'Soovi korral isiklikumaks'] as const
</script>

<template>
  <ol class="journey" aria-label="Jõulukirjade sammud">
    <li v-for="(step, index) in STEPS" :key="step" :class="{ 'is-current': index + 1 === current, 'is-done': index + 1 < current }" :aria-current="index + 1 === current ? 'step' : undefined">
      <span class="journey__dot" aria-hidden="true">{{ index + 1 }}</span>{{ step }}
    </li>
  </ol>
</template>

<style scoped lang="scss">
.journey {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ink-faint);
  font-size: 0.85rem;
  li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .is-current {
    color: var(--lavender-ink);
    font-weight: 600;
  }
  .is-done {
    color: var(--ink-soft);
  }
}
.journey__dot {
  display: grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--lavender-soft);
  font-size: 0.75rem;
  font-weight: 700;
  .is-current & {
    background: var(--lavender);
    color: #fff;
  }
}
</style>
