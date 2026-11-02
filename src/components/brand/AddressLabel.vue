<script setup lang="ts">
/**
 * A child to pick, drawn as an address label: the name is handwritten on the address line,
 * and a picked child gets a "Kellele" postmark stamped over the corner.
 */
defineProps<{ name: string; details: string; selected: boolean; index: number }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="selected"
    class="label"
    :class="{ 'is-selected': selected }"
    :style="{ '--tilt': `${[-1, 0.8, -0.5, 1.2][index % 4]}deg` }"
    @click="$emit('select')"
  >
    <span class="label__to">Kellele:</span>
    <span class="label__name">{{ name }}</span>
    <span class="label__details">{{ details }}</span>
    <span class="label__postmark" aria-hidden="true">
      <svg viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" />
        <circle cx="30" cy="30" r="18" />
        <path d="M21 30 l6 6 12 -13" class="label__tick" />
      </svg>
    </span>
  </button>
</template>

<style scoped lang="scss">
.label {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0.9rem 1.2rem 0.8rem;
  border: 2px solid #f0e2cf;
  border-radius: 10px;
  background: #fffdf8;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transform: rotate(var(--tilt));
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: rotate(0) translateY(-3px);
    box-shadow: var(--shadow);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
  &.is-selected {
    transform: rotate(0) translateY(-3px);
    border-color: var(--lavender);
    box-shadow: 0 5px 0 var(--lavender-ink);
  }
}
.label__to {
  color: var(--ink-faint);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.label__name {
  // Written on the address line, like on the envelope.
  align-self: stretch;
  margin-bottom: 0.35rem;
  padding-right: 3.5rem;
  border-bottom: 2px dashed #ead8bf;
  font-family: var(--font-print);
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.4;
}
.label__details {
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.label__postmark {
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  width: 3.2rem;
  opacity: 0;
  transform: rotate(-18deg) scale(1.6);
  transition:
    opacity 0.15s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  svg {
    display: block;
    fill: none;
    stroke: var(--lavender);
    stroke-width: 2.5;
  }
  .is-selected & {
    opacity: 0.9;
    transform: rotate(-18deg) scale(1);
  }
}
.label__tick {
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
