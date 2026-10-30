<script setup lang="ts" generic="T extends string | number | boolean">
defineProps<{
  label: string
  options: { value: T; label: string }[]
  name: string
  hint?: string
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <fieldset class="segmented">
    <legend class="segmented__legend">{{ label }}</legend>
    <div class="segmented__options">
      <label
        v-for="option in options"
        :key="String(option.value)"
        class="segmented__option"
        :class="{ 'is-active': model === option.value }"
      >
        <input
          v-model="model"
          type="radio"
          class="visually-hidden"
          :name="name"
          :value="option.value"
        />
        <span>{{ option.label }}</span>
      </label>
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
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
