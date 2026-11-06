<script setup lang="ts">
import CompanionFigure from '../../components/brand/companion/CompanionFigure.vue'
import { COMPANIONS, type CompanionId } from '../../components/brand/companion/companions'

/** Which character sits under the long letters, or none. The pose is not chosen: each letter gets its own. */
defineProps<{ name: string }>()
const model = defineModel<CompanionId | null>({ required: true })
const options: { value: CompanionId | null; label: string }[] = [
  { value: null, label: 'Ilma tegelaseta' },
  ...COMPANIONS.map((c) => ({ value: c.id, label: c.name })),
]
</script>

<template>
  <fieldset class="companion-picker">
    <legend class="companion-picker__legend">Tegelane kirja all</legend>
    <div class="companion-picker__options">
      <label
        v-for="option in options"
        :key="String(option.value)"
        class="companion-picker__option"
        :class="{ 'is-active': model === option.value }"
      >
        <input
          v-model="model"
          type="radio"
          class="visually-hidden"
          :name="name"
          :value="option.value"
        />
        <CompanionFigure v-if="option.value" :id="option.value" :pose="0" :size="56" />
        <span v-else class="companion-picker__none" aria-hidden="true">–</span>
        <span>{{ option.label }}</span>
      </label>
    </div>
    <p class="companion-picker__hint">
      Tegelane ilmub pika kirja alla paremale, igal kirjal erineva poosi ja hüüatusega.
    </p>
  </fieldset>
</template>

<style scoped lang="scss">
.companion-picker {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.companion-picker__legend {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.45rem;
  padding: 0;
}
.companion-picker__options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.4rem;
}
.companion-picker__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
  padding: 0.4rem 0.25rem 0.5rem;
  border: 1.5px solid var(--line-strong);
  border-radius: 14px;
  background: var(--surface);
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
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
.companion-picker__none {
  display: grid;
  place-items: center;
  height: 70px;
  font-size: 1.6rem;
  color: var(--ink-faint);
}
.companion-picker__hint {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
</style>
