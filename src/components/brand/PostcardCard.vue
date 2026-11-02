<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { Check } from 'lucide-vue-next'
import { postcardLook } from './design'

/**
 * A choice drawn as a postcard with an airmail edge. With `to` it is a link (home page),
 * otherwise a radio button that can be selected (wizard).
 */
const props = withDefaults(
  defineProps<{
    title: string
    tagline?: string
    description?: string
    icon: Component
    index: number
    to?: RouteLocationRaw
    selected?: boolean
    badge?: string
  }>(),
  { tagline: '', description: '', to: undefined, selected: false, badge: '' },
)
defineEmits<{ select: [] }>()

const look = computed(() => postcardLook(props.index))
const style = computed(() => ({
  '--tilt': `${look.value.tilt}deg`,
  '--edge-a': look.value.edge[0],
  '--edge-b': look.value.edge[1],
  '--tint': look.value.tint,
  '--card-ink': look.value.ink,
}))
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :role="to ? undefined : 'radio'"
    :aria-checked="to ? undefined : selected"
    class="postcard"
    :class="{ 'is-selected': selected }"
    :style="style"
    @click="!to && $emit('select')"
  >
    <span class="postcard__edge" aria-hidden="true" />
    <span class="postcard__body">
      <span class="postcard__text">
        <span class="postcard__title">{{ title }}</span>
        <span v-if="tagline" class="postcard__tagline">{{ tagline }}</span>
      </span>
      <span class="postcard__icon" aria-hidden="true">
        <Check v-if="selected" :size="20" :stroke-width="3" />
        <component :is="icon" v-else :size="20" :stroke-width="1.8" />
      </span>
    </span>
    <span v-if="description" class="postcard__desc">{{ description }}</span>
    <span v-if="badge" class="postcard__badge">{{ badge }}</span>
  </component>
</template>

<style scoped lang="scss">
.postcard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  height: 100%;
  padding: 0.9rem 1.1rem 1.1rem;
  border: 2px solid #f0e2cf;
  border-radius: 16px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transform: rotate(var(--tilt));
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  &:hover {
    transform: rotate(0) translateY(-4px);
    box-shadow: 0 10px 0 -4px var(--tint), var(--shadow);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
  &.is-selected {
    transform: rotate(0) translateY(-4px);
    border-color: var(--card-ink);
    box-shadow: 0 6px 0 var(--card-ink);
  }
}
.postcard__edge {
  height: 7px;
  border-radius: 4px;
  background: repeating-linear-gradient(90deg, var(--edge-a) 0 12px, #fff 12px 18px, var(--edge-b) 18px 30px, #fff 30px 36px);
}
.postcard__body {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}
.postcard__text {
  display: flex;
  flex-direction: column;
}
.postcard__title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
}
.postcard__tagline {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.postcard__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--tint);
  color: var(--card-ink);
  transition: background 0.2s ease, color 0.2s ease;
  .is-selected & {
    background: var(--card-ink);
    color: #fff;
  }
}
.postcard__desc {
  padding-top: 0.6rem;
  border-top: 1.5px dashed #f0e2cf;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
// "Sobib hästi" sits on the card like a rubber stamp.
.postcard__badge {
  position: absolute;
  right: 0.8rem;
  bottom: -0.7rem;
  padding: 0.1rem 0.55rem;
  border: 2px solid var(--card-ink);
  border-radius: 6px;
  background: #fff;
  color: var(--card-ink);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transform: rotate(-4deg);
}
</style>
