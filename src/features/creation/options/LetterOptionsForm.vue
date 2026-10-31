<script setup lang="ts">
import { computed } from 'vue'
import type { ChildProfile, LetterOptions, OccasionId } from '../../../domain/models'
import PersonaEditor from './PersonaEditor.vue'
import FamilyEventsEditor from './FamilyEventsEditor.vue'
import ChallengesEditor from './ChallengesEditor.vue'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'

const props = defineProps<{ children: ChildProfile[]; occasionId: OccasionId }>()
const model = defineModel<LetterOptions>({ required: true })

const family = computed(() => props.children.length > 1)
const linked = computed(() => family.value && (model.value.mode ?? 'linked') === 'linked')
const series = computed(() => model.value.count > 1)

const countOptions = [
  { value: 1 as const, label: '1 kiri' },
  { value: 3 as const, label: '3 kirja' },
  { value: 7 as const, label: '7 kirja' },
  { value: 24 as const, label: '24 kirja' },
]

/**
 * One choice for how the letters belong together. A linked family series always
 * carries the serial story, told to every child from their own helper's side.
 */
type Shape = 'linked' | 'shared' | 'shared-story' | 'single' | 'single-story'
const shapeOptions = computed<{ value: Shape; label: string }[]>(() => {
  if (!family.value) {
    return [
      { value: 'single', label: 'Iseseisvad kirjad' },
      { value: 'single-story', label: 'Järjejutt' },
    ]
  }
  const options: { value: Shape; label: string }[] = [
    { value: 'linked', label: 'Igaühele oma, omavahel seotud' },
    { value: 'shared', label: 'Üks ühine kiri kõigile' },
  ]
  if (series.value) options.push({ value: 'shared-story', label: 'Ühine järjejutt' })
  return options
})
const shape = computed<Shape>({
  get: () => {
    if (!family.value) return model.value.connected ? 'single-story' : 'single'
    if (linked.value) return 'linked'
    return model.value.connected && series.value ? 'shared-story' : 'shared'
  },
  set: (value) => {
    model.value.mode = value === 'linked' ? 'linked' : 'shared'
    model.value.connected = value === 'linked' || value.endsWith('-story')
  },
})
const shapeHint = computed(() => {
  if (shape.value === 'linked') {
    return 'Iga laps saab oma kirjad samast päkapikumaailmast: abilised tunnevad üksteist, ühised sündmused juhtuvad kõigi kirjades samal päeval ja vanem laps teeb aeg-ajalt midagi nooremale. Järjejutus kadunud tähest kuuleb iga laps lugu oma päkapiku käest.'
  }
  if (shape.value.endsWith('-story')) return 'Järjejutus otsitakse kirjast kirja kadunud tähte. Vahepeal on ka iseseisvaid lugusid.'
  return ''
})
const showShape = computed(() => family.value || series.value)

const extrasInUse = computed(
  () => (model.value.events?.length ?? 0) > 0 || (model.value.challenges?.length ?? 0) > 0 || !!model.value.sundaySweets,
)
</script>

<template>
  <div class="options-grid">
    <SegmentedControl v-model="model.count" name="letter-count" label="Kirjade arv" :options="countOptions" />
    <FormField id="letter-date" label="Esimese kirja kuupäev" hint="Sarja puhul saab iga järgmine kiri järgmise päeva kuupäeva.">
      <template #default="{ describedBy }">
        <input id="letter-date" v-model="model.startDate" class="input" type="date" :aria-describedby="describedBy" />
      </template>
    </FormField>
    <div v-if="showShape" class="options-grid__wide">
      <SegmentedControl v-model="shape" name="letter-shape" label="Kirjade seos" :options="shapeOptions" :hint="shapeHint" />
    </div>
    <div v-if="linked" class="options-grid__wide">
      <PersonaEditor v-model="model.personas" :children="children" :occasion-id="occasionId" />
    </div>
    <FormField v-else id="letter-sender" label="Saatja nimi" hint="Näiteks Päkapikk Tuduja või Hambahaldjas Helk.">
      <template #default="{ describedBy }">
        <input id="letter-sender" v-model="model.sender" class="input" type="text" :aria-describedby="describedBy" />
      </template>
    </FormField>

    <details v-if="series" class="extras options-grid__wide" :open="extrasInUse">
      <summary class="extras__summary">
        Lisavõimalused <span class="extras__what">pere sündmused, pühapäeva komm, lapse väljakutsed</span>
      </summary>
      <div class="extras__body">
        <FamilyEventsEditor
          v-model:events="model.events"
          v-model:sunday-sweets="model.sundaySweets"
          :children="children"
          :start-date="model.startDate"
          :count="model.count"
        />
        <ChallengesEditor v-model="model.challenges" :children="children" :start-date="model.startDate" :count="model.count" />
      </div>
    </details>
  </div>
</template>

<style scoped lang="scss">
.extras {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
}
.extras__summary {
  cursor: pointer;
  padding: 0.8rem 1rem;
  font-weight: 600;
}
.extras__what {
  margin-left: 0.4rem;
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.extras__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1rem 1rem;
}
</style>
