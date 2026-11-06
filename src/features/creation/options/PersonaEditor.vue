<script setup lang="ts">
import { computed } from 'vue'
import type { ChildProfile, ElfPersona, OccasionId } from '../../../domain/models'
import { suggestPersonas } from '../../../data/templates/personas'
import { ageBand } from '../../../domain/generators/audience'

/**
 * Helper character per child in a linked series. Suggestions come from the
 * child's interests; the parent can rename them freely.
 */
const props = defineProps<{
  children: ChildProfile[]
  occasionId: OccasionId
  /** One child's fields only (the preview panel's child block), without the heading and the hint. */
  only?: string
}>()
const model = defineModel<Record<string, ElfPersona> | undefined>({ required: true })

const suggested = computed(() => suggestPersonas(props.children, props.occasionId, (c) => ageBand(c) === 'toddler'))
const shown = computed(() => (props.only ? props.children.filter((child) => child.id === props.only) : props.children))
const word = computed(() => (props.occasionId === 'christmas' ? 'päkapikk' : 'abiline'))
const capitalised = computed(() => (props.occasionId === 'christmas' ? 'Päkapiku' : 'Abilise'))

function value(childId: string): ElfPersona {
  return { ...(suggested.value[childId] as ElfPersona), ...model.value?.[childId] }
}

function update(childId: string, field: keyof ElfPersona, text: string): void {
  model.value = { ...model.value, [childId]: { ...value(childId), [field]: text } }
}
</script>

<template>
  <fieldset class="personas">
    <legend v-if="!only">Iga lapse {{ word }}</legend>
    <p v-if="!only" class="personas__hint">
      Nimed ja tiitlid on pakutud lapse huvide järgi. Abilised tunnevad üksteist ja mainivad õdede-vendade abilisi.
    </p>
    <div v-for="child in shown" :key="child.id" class="persona" :class="{ 'persona--only': only }">
      <span v-if="!only" class="persona__child">{{ child.name }}</span>
      <label class="persona__field" :class="{ 'persona__field--labelled': only }">
        <span v-if="only" class="persona__label">{{ capitalised }} nimi</span>
        <span v-else class="visually-hidden">{{ child.name }}: nimi</span>
        <input class="input" type="text" :value="value(child.id).name" :placeholder="only ? `${capitalised} nimi` : 'Nimi'" @input="update(child.id, 'name', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="persona__field" :class="{ 'persona__field--labelled': only }">
        <span v-if="only" class="persona__label">Hüüdnimi või tiitel</span>
        <span v-else class="visually-hidden">{{ child.name }}: tiitel</span>
        <input class="input" type="text" :value="value(child.id).title" :placeholder="only ? 'Hüüdnimi või tiitel' : 'Tiitel'" @input="update(child.id, 'title', ($event.target as HTMLInputElement).value)" />
      </label>
      <p class="persona__origin">{{ value(child.id).origin }}</p>
    </div>
  </fieldset>
</template>

<style scoped lang="scss">
.personas {
  // Sized by the room it has (the wizard page or the narrow preview panel), not the screen.
  container: personas / inline-size;
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  legend {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.35rem;
    padding: 0;
  }
}
.personas__hint {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.persona {
  display: grid;
  grid-template-columns: 6rem 1fr 1fr;
  gap: 0.25rem 0.6rem;
  align-items: center;
  margin-bottom: 0.65rem;
}
.persona__child {
  font-weight: 600;
}
.persona__origin {
  grid-column: 2 / -1;
  margin: 0;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.persona__field--labelled {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.persona__label {
  font-size: 0.85rem;
  font-weight: 600;
}
.persona--only {
  grid-template-columns: 1fr 1fr;
  .persona__origin {
    grid-column: 1 / -1;
  }
}
@container personas (max-width: 560px) {
  .persona {
    grid-template-columns: 1fr 1fr;
  }
  .persona__child,
  .persona__origin {
    grid-column: 1 / -1;
  }
}
</style>
