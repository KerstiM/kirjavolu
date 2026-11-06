<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChildProfile, LetterOptions, OccasionId } from '../../../domain/models'
import PersonaEditor from './PersonaEditor.vue'
import FamilyEventsEditor from './FamilyEventsEditor.vue'
import ChallengesEditor from './ChallengesEditor.vue'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { christmasLettersUntilEve, MAX_LETTERS, MIN_SERIES } from '../../../domain/validation'
import DateInput from '../../../components/ui/DateInput.vue'

const props = defineProps<{ children: ChildProfile[]; occasionId: OccasionId }>()
const model = defineModel<LetterOptions>({ required: true })

const family = computed(() => props.children.length > 1)
const linked = computed(() => family.value && (model.value.mode ?? 'linked') === 'linked')
const series = computed(() => model.value.count > 1)

/**
 * The usual counts as short buttons (the legend says what they count), and "Muu" for another
 * number – so the choice fits one row even in the narrow preview panel. Christmas letters are
 * one letter or a whole story of 7 to 24 days that ends by Christmas Eve: shorter series could
 * not tell a story to its end, so they are not offered.
 */
const christmas = computed(() => props.occasionId === 'christmas')
const quickCounts = computed<number[]>(() => (christmas.value ? [1, MIN_SERIES, MAX_LETTERS] : [1, 4, 7, 24]))
const minOther = computed(() => (christmas.value ? MIN_SERIES : 1))
const maxCount = computed(() => (christmas.value ? christmasLettersUntilEve(model.value.startDate) : MAX_LETTERS))
const countOptions = computed(() => [
  ...quickCounts.value.map((value) => ({ value, label: String(value), disabled: value > 1 && value > maxCount.value })),
  { value: 'other' as const, label: 'Muu', disabled: christmas.value && maxCount.value < MIN_SERIES },
])
const otherOpen = ref(!quickCounts.value.includes(model.value.count))
const countChoice = computed<number | 'other'>({
  get: () => (otherOpen.value ? 'other' : model.value.count),
  set: (value) => {
    otherOpen.value = value === 'other'
    if (value !== 'other') model.value.count = value
  },
})
function setOtherCount(event: Event): void {
  const value = Math.round(Number((event.target as HTMLInputElement).value))
  if (Number.isFinite(value)) model.value.count = Math.min(maxCount.value, Math.max(minOther.value, value))
}
const countHint = computed(() => {
  if (!christmas.value) return ''
  if (maxCount.value < MIN_SERIES) return 'Jõululaupäevani on sarja jaoks liiga vähe päevi: saad teha ühe kirja.'
  if (maxCount.value < MAX_LETTERS) return `Kirjad lõpevad jõululaupäeval: sellest kuupäevast mahub kuni ${maxCount.value} kirja.`
  return 'Üks kiri või terve lugu 7–24 päevaks.'
})

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
  const options: { value: Shape; label: string }[] = [{ value: 'linked', label: 'Igaühele oma, omavahel seotud' }]
  // One letter for all children is put together from short parts, so Christmas letters offer it
  // no more; a creation made with it keeps the choice until it is changed.
  if (!christmas.value || !linked.value) options.push({ value: 'shared', label: 'Üks ühine kiri kõigile' })
  if (series.value && (!christmas.value || shape.value === 'shared-story')) options.push({ value: 'shared-story', label: 'Ühine järjejutt' })
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
    return 'Iga laps saab oma kirjad samast päkapikumaailmast: abilised tunnevad üksteist, ühised sündmused juhtuvad kõigi kirjades samal päeval ja mõnel päeval kutsutakse õdesid-vendi midagi koos tegema. Järjejutus kadunud tähest kuuleb iga laps lugu oma päkapiku käest.'
  }
  if (shape.value.endsWith('-story')) return 'Järjejutus otsitakse kirjast kirja kadunud tähte. Vahepeal on ka iseseisvaid lugusid.'
  return ''
})
const showShape = computed(() => shapeOptions.value.length > 1 && (family.value || series.value))

const extrasInUse = computed(
  () =>
    (model.value.events?.length ?? 0) > 0 ||
    (model.value.challenges?.length ?? 0) > 0 ||
    !!model.value.sundaySweets ||
    !!model.value.secretHelper,
)
/** The secret helper needs a younger sibling and a series long enough for a second storyline. */
const offersSecretHelper = computed(() => linked.value && christmas.value && model.value.count >= 12)
</script>

<template>
  <div class="options-grid">
    <div class="count">
      <SegmentedControl v-model="countChoice" name="letter-count" label="Kirjade arv" :options="countOptions" :hint="countHint" />
      <label v-if="otherOpen" class="count__other">
        <span>Mitu kirja?</span>
        <input class="input" type="number" :min="minOther" :max="maxCount" inputmode="numeric" :value="model.count" @change="setOtherCount" />
        <span class="count__range">{{ minOther }}–{{ maxCount }}</span>
      </label>
    </div>
    <FormField id="letter-date" label="Esimese kirja kuupäev" hint="Sarja puhul saab iga järgmine kiri järgmise päeva kuupäeva.">
      <template #default="{ describedBy }">
        <DateInput id="letter-date" v-model="model.startDate" :described-by="describedBy" label="Esimese kirja kuupäev" />
        <label class="dated">
          <input type="checkbox" :checked="model.dated === false" @change="model.dated = ($event.target as HTMLInputElement).checked ? false : undefined" />
          <span>Ilma kuupäevata – kirjad on lihtsalt nummerdatud</span>
        </label>
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
        <label v-if="offersSecretHelper" class="dated">
          <input type="checkbox" :checked="!!model.secretHelper" @change="model.secretHelper = ($event.target as HTMLInputElement).checked || undefined" />
          <span>
            Vanim laps on päkapikkude salajane abiline: mõnes kirjas on talle salamissioon nooremate heaks. Vali see ainult siis,
            kui tead, et lapsele meeldib saladust hoida.
          </span>
        </label>
      </div>
    </details>
  </div>
</template>

<style scoped lang="scss">
.dated {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  input {
    flex: none;
    width: 1rem;
    height: 1rem;
    margin-top: 0.2rem;
    accent-color: var(--lavender);
  }
}
.count {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.count__other {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  .input {
    width: 5rem;
  }
}
.count__range {
  font-weight: 400;
  color: var(--ink-soft);
}
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
