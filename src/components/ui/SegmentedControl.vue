<script setup lang="ts" generic="T extends string | number | boolean">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  label: string
  /** A disabled option stays visible, so it is plain that it exists; the hint says why it is off. */
  options: { value: T; label: string; disabled?: boolean; reason?: string }[]
  name: string
  hint?: string
}>()

const model = defineModel<T>({ required: true })

/** Why an option is off: a bubble on hover (mouse) or on tapping the "?" (touch). */
const openKey = ref<string | null>(null)
const close = () => (openKey.value = null)
onMounted(() => document.addEventListener('click', close))
onBeforeUnmount(() => document.removeEventListener('click', close))
const toggle = (key: string) => (openKey.value = openKey.value === key ? null : key)
</script>

<template>
  <fieldset class="segmented">
    <legend class="segmented__legend">{{ label }}</legend>
    <div class="segmented__options">
      <span v-for="option in options" :key="String(option.value)" class="segmented__item">
        <label class="segmented__option" :class="{ 'is-active': model === option.value, 'is-disabled': option.disabled }">
          <input
            v-model="model"
            type="radio"
            class="visually-hidden"
            :name="name"
            :value="option.value"
            :disabled="option.disabled"
          />
          <span>{{ option.label }}</span>
        </label>
        <template v-if="option.disabled && option.reason">
          <button
            type="button"
            class="segmented__info"
            :aria-label="`Miks „${option.label}“ pole valitav?`"
            :aria-expanded="openKey === String(option.value)"
            @click.stop="toggle(String(option.value))"
          >?</button>
          <span class="segmented__tip" :class="{ 'is-open': openKey === String(option.value) }" role="note">{{ option.reason }}</span>
        </template>
      </span>
    </div>
    <p v-if="hint" class="segmented__hint">{{ hint }}</p>
  </fieldset>
</template>

<style scoped lang="scss">
.segmented {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.segmented__legend {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.45rem;
  padding: 0;
}
.segmented__options {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.segmented__item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.segmented__info {
  display: none;
  width: 1.4rem;
  height: 1.4rem;
  padding: 0;
  border: 1.5px solid var(--line-strong);
  border-radius: 50%;
  background: var(--surface);
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  @media (hover: none) {
    display: inline-block;
  }
}
.segmented__tip {
  display: none;
  position: absolute;
  z-index: 5;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--line-strong);
  border-radius: 0.75rem;
  background: var(--surface);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.12);
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--ink-soft);
  &.is-open {
    display: block;
  }
}
@media (hover: hover) {
  .segmented__item:hover .segmented__tip {
    display: block;
  }
}
.segmented__option {
  position: relative;
  padding: 0.5rem 0.95rem;
  border: 1.5px solid var(--line-strong);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--lavender);
  }
  &.is-active {
    background: var(--lavender-soft);
    border-color: var(--lavender);
    color: var(--lavender-ink);
    font-weight: 600;
  }
  &.is-disabled {
    border-style: dashed;
    color: var(--ink-faint);
    cursor: not-allowed;
    &:hover {
      border-color: var(--line-strong);
    }
  }
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.segmented__hint {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
</style>
