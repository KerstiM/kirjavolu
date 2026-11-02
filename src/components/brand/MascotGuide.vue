<script setup lang="ts">
import Mascot from './Mascot.vue'
import type { MascotMood } from './mascot'

/** The mascot with a speech bubble; a new line pops in as the bubble changes. */
defineProps<{ mood: MascotMood; text: string; emphasis?: string }>()
</script>

<template>
  <div class="guide">
    <Mascot :key="mood" :mood="mood" :size="76" class="guide__mascot" />
    <p :key="text + (emphasis ?? '')" class="guide__bubble">
      {{ text }}<template v-if="emphasis">{{ ' ' }}<strong class="guide__em">{{ emphasis }}</strong></template>
    </p>
  </div>
</template>

<style scoped lang="scss">
.guide {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}
.guide__mascot {
  animation: peek 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.guide__bubble {
  position: relative;
  margin: 0 0 1.4rem;
  padding: 0.7rem 1.1rem;
  max-width: 34rem;
  border: 2px solid var(--line-strong);
  border-radius: 18px 18px 18px 4px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.4;
  transform-origin: 0 100%;
  animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  // The tail points at the mascot: an outline triangle with a smaller filled one inside,
  // whose right edge covers the bubble's border so the two join.
  &::before,
  &::after {
    content: '';
    position: absolute;
    clip-path: polygon(100% 0, 0 100%, 100% 100%);
  }
  &::before {
    left: -16px;
    bottom: 6px;
    width: 16px;
    height: 16px;
    background: var(--line-strong);
  }
  &::after {
    left: -11px;
    bottom: 8px;
    width: 13px;
    height: 12px;
    background: var(--surface);
  }
}
.guide__em {
  color: var(--coral-ink);
}
@keyframes peek {
  from {
    transform: translateY(14px) rotate(-6deg);
    opacity: 0;
  }
}
@keyframes pop {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
}
@media print {
  .guide {
    display: none;
  }
}
</style>
