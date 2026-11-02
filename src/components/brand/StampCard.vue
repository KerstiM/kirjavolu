<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { Check } from 'lucide-vue-next'
import { STAMP_TILTS } from './design'

/**
 * A choice drawn as a postage stamp with a perforated edge. With `to` it is a link
 * (home page), otherwise a radio button that can be selected (wizard).
 */
const props = withDefaults(
  defineProps<{
    name: string
    when?: string
    icon: Component
    color: string
    index: number
    to?: RouteLocationRaw
    selected?: boolean
    /** Small label in the corner, e.g. "Praegu" or "Hea valik". */
    badge?: string
  }>(),
  { when: '', to: undefined, selected: false, badge: '' },
)
defineEmits<{ select: [] }>()

const style = computed(() => ({
  '--tilt': `${STAMP_TILTS[props.index % STAMP_TILTS.length]}deg`,
  '--stamp': props.color,
}))
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :role="to ? undefined : 'radio'"
    :aria-checked="to ? undefined : selected"
    class="stamp"
    :class="{ 'is-selected': selected }"
    :style="style"
    @click="!to && $emit('select')"
  >
    <span class="stamp__paper">
      <span class="stamp__face">
        <span v-if="badge" class="stamp__badge">{{ badge }}</span>
        <component :is="icon" :size="28" :stroke-width="1.7" aria-hidden="true" />
        <span class="stamp__name">{{ name }}</span>
        <span v-if="when" class="stamp__when">{{ when }}</span>
      </span>
    </span>
    <span v-if="selected" class="stamp__check" aria-hidden="true"><Check :size="16" :stroke-width="3" /></span>
  </component>
</template>

<style scoped lang="scss">
// The perforation is a mask on the paper, so the check mark sits outside it on the button.
.stamp {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transform: rotate(var(--tilt));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  &:hover {
    transform: rotate(0) scale(1.06);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 4px;
  }
  &.is-selected {
    transform: rotate(0) scale(1.08);
  }
}
.stamp__paper {
  display: block;
  padding: 6px;
  background: #fff;
  // Perforated edge: holes only in the white border, the coloured face stays whole.
  mask:
    linear-gradient(#000 0 0) content-box,
    radial-gradient(circle 4px at 4px 4px, transparent 98%, #000) -4px -4px / 11px 11px;
}
.stamp__face {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  aspect-ratio: 9 / 10;
  padding: 0.6rem 0.5rem;
  background: var(--stamp);
  text-align: center;
}
.is-selected .stamp__face {
  box-shadow: inset 0 0 0 3px rgb(255 255 255 / 0.85);
}
.stamp__name {
  max-width: 100%;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.15;
}
.stamp__when {
  font-size: 0.75rem;
  opacity: 0.85;
}
.stamp__badge {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: #fff;
  color: var(--stamp);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.stamp__check {
  position: absolute;
  top: -0.55rem;
  left: -0.55rem;
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
}
</style>
