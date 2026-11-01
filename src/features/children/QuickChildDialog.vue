<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ChildProfileDraft, ReadingLevel } from '../../domain/models'
import { READING_LEVEL_LABELS } from '../../domain/models'
import { readingLevelForAge } from '../../domain/generators/audience'
import { validateChildProfile, type FieldErrors } from '../../domain/validation'
import BaseDialog from '../../components/ui/BaseDialog.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import FormField from '../../components/ui/FormField.vue'
import TopicPicker from './TopicPicker.vue'
import { emptyChildDraft } from './childrenStore'

/**
 * A child added without leaving the wizard: only name, age and up to three topics.
 * Everything else can be filled in later on the "Lapsed" page.
 */
const emit = defineEmits<{ save: [draft: ChildProfileDraft]; close: [] }>()

const MAX_TOPICS = 3
const draft = reactive<ChildProfileDraft>({ ...emptyChildDraft(), readingLevel: readingLevelForAge(emptyChildDraft().age) })
const topics = computed({
  get: () => draft.topics ?? [],
  set: (value) => (draft.topics = value),
})
const errors = ref<FieldErrors>({})
const submitted = ref(false)
// The reading level follows the age until the parent picks one.
const levelTouched = ref(false)
const readingLevels = Object.entries(READING_LEVEL_LABELS) as [ReadingLevel, string][]

watch(
  () => draft.age,
  (age) => {
    if (!levelTouched.value && Number.isInteger(age)) draft.readingLevel = readingLevelForAge(age)
  },
)

function submit(): void {
  submitted.value = true
  errors.value = validateChildProfile(draft)
  const first = Object.keys(errors.value)[0]
  if (first) {
    document.getElementById(`quick-child-${first}`)?.focus()
    return
  }
  emit('save', { ...draft, topics: [...topics.value] })
}

function revalidate(): void {
  if (submitted.value) errors.value = validateChildProfile(draft)
}
</script>

<template>
  <BaseDialog title="Lisa laps" @close="emit('close')">
    <form class="quick-child" novalidate @submit.prevent="submit" @input="revalidate">
      <p class="quick-child__lead">Piisab nimest ja vanusest. Muud saad hiljem lehel „Lapsed“ lisada.</p>
      <div class="quick-child__row">
        <FormField id="quick-child-name" label="Nimi" :error="errors.name">
          <template #default="{ describedBy, invalid }">
            <input
              id="quick-child-name"
              v-model="draft.name"
              class="input"
              type="text"
              autocomplete="off"
              autofocus
              :aria-invalid="invalid"
              :aria-describedby="describedBy"
            />
          </template>
        </FormField>
        <FormField id="quick-child-age" label="Vanus" :error="errors.age">
          <template #default="{ describedBy, invalid }">
            <input
              id="quick-child-age"
              v-model.number="draft.age"
              class="input"
              type="number"
              min="0"
              max="17"
              inputmode="numeric"
              :aria-invalid="invalid"
              :aria-describedby="describedBy"
            />
          </template>
        </FormField>
      </div>
      <FormField
        id="quick-child-readingLevel"
        label="Lugemisoskus"
        hint="Pakutud vanuse järgi, muuda vajadusel."
        :error="errors.readingLevel"
      >
        <template #default="{ describedBy }">
          <select
            id="quick-child-readingLevel"
            v-model="draft.readingLevel"
            class="select"
            :aria-describedby="describedBy"
            @change="levelTouched = true"
          >
            <option v-for="[value, label] in readingLevels" :key="value" :value="value">{{ label }}</option>
          </select>
        </template>
      </FormField>

      <fieldset class="quick-child__topics">
        <legend>Mis lapsele meeldib? <span class="quick-child__count">(kuni {{ MAX_TOPICS }})</span></legend>
        <p class="quick-child__hint">Iga teema kohta on kirjades valmis lood. Võid ka vahele jätta.</p>
        <TopicPicker v-model="topics" :max="MAX_TOPICS" />
      </fieldset>

      <footer class="quick-child__actions">
        <BaseButton variant="ghost" @click="emit('close')">Tühista</BaseButton>
        <BaseButton type="submit">Lisa laps</BaseButton>
      </footer>
    </form>
  </BaseDialog>
</template>

<style scoped lang="scss">
.quick-child {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.quick-child__lead,
.quick-child__hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.quick-child__row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}
.quick-child__topics {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  legend {
    font-weight: 600;
    padding: 0;
    margin-bottom: 0.4rem;
  }
}
.quick-child__count {
  font-weight: 400;
  color: var(--ink-soft);
}
.quick-child__actions {
  position: sticky;
  bottom: -1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin: 0 -1.25rem -1.25rem;
  padding: 0.75rem 1.25rem 1.25rem;
  background: var(--surface);
  border-top: 1px solid var(--line);
}
</style>
