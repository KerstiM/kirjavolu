<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: Component
    selected: boolean
    /** "radio" for single choice, "checkbox" for multi choice. */
    role?: 'radio' | 'checkbox'
    tone?: 'lavender' | 'coral' | 'sage' | 'gold'
    badge?: string
  }>(),
  { description: '', icon: undefined, role: 'radio', tone: 'lavender', badge: '' },
)

defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="choice"
    :class="[`choice--${tone}`, { 'is-selected': selected }]"
    :role="role"
    :aria-checked="selected"
    @click="$emit('select')"
  >
    <span v-if="icon" class="choice__icon" aria-hidden="true">
      <component :is="icon" :size="22" :stroke-width="1.8" />
    </span>
    <span class="choice__text">
      <span class="choice__title">
        {{ title }}
        <span v-if="badge" class="choice__badge">{{ badge }}</span>
      </span>
      <span v-if="description" class="choice__desc">{{ description }}</span>
      <slot />
    </span>
    <span class="choice__check" aria-hidden="true"><Check :size="14" :stroke-width="3" /></span>
  </button>
</template>

<style scoped lang="scss">
.choice {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  width: 100%;
  padding: 1rem 1.1rem;
  text-align: left;
  background: var(--surface);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--line-strong);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  &.is-selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
}

.choice--lavender {
  --accent: var(--lavender);
  --accent-soft: var(--lavender-soft);
}
.choice--coral {
  --accent: var(--coral);
  --accent-soft: var(--coral-soft);
}
.choice--sage {
  --accent: var(--sage);
  --accent-soft: var(--sage-soft);
}
.choice--gold {
  --accent: #d9a441;
  --accent-soft: var(--gold-soft);
}

.choice__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
  .choice--gold & {
    color: #9a6b12;
  }
  .choice--coral & {
    color: var(--coral-ink);
  }
  .choice--sage & {
    color: var(--sage-ink);
  }
  .choice--lavender & {
    color: var(--lavender-ink);
  }
}

.choice__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  padding-right: 1.4rem;
}
.choice__title {
  font-weight: 600;
  line-height: 1.3;
}
.choice__badge {
  display: inline-block;
  margin-left: 0.35rem;
  padding: 0.05rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 999px;
  background: var(--gold-soft);
  color: #7a5410;
  vertical-align: middle;
}
.choice__desc {
  font-size: 0.9rem;
  color: var(--ink-soft);
  line-height: 1.45;
}

.choice__check {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  border: 1.5px solid var(--line-strong);
  color: transparent;
  transition: all 0.15s ease;
  .is-selected & {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
}
</style>
