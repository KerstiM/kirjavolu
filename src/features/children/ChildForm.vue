<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { ChildProfileDraft, ReadingLevel } from '../../domain/models'
import { READING_LEVEL_LABELS } from '../../domain/models'
import { validateChildProfile, type FieldErrors } from '../../domain/validation'
import { genitive } from '../../domain/text/estonian'
import FormField from '../../components/ui/FormField.vue'
import ListInput from '../../components/ui/ListInput.vue'
import TopicPicker from './TopicPicker.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { clone } from '../../utils/clone'

const props = defineProps<{ initial: ChildProfileDraft; mode: 'add' | 'edit' }>()
const emit = defineEmits<{ save: [draft: ChildProfileDraft]; cancel: [] }>()

const draft = reactive<ChildProfileDraft>(clone({ ...props.initial }))
const topics = computed({
  get: () => draft.topics ?? [],
  set: (value) => (draft.topics = value),
})
const errors = ref<FieldErrors>({})
const submitted = ref(false)

const readingLevels = Object.entries(READING_LEVEL_LABELS) as [ReadingLevel, string][]
const genitivePreview = computed(() => (draft.name.trim() ? genitive(draft.name, draft.nameGenitive) : ''))

function submit(): void {
  submitted.value = true
  errors.value = validateChildProfile(draft)
  if (Object.keys(errors.value).length > 0) {
    document.getElementById(`child-${Object.keys(errors.value)[0]}`)?.focus()
    return
  }
  emit('save', clone({ ...draft }))
}

function revalidate(): void {
  if (submitted.value) errors.value = validateChildProfile(draft)
}
</script>

<template>
  <form class="child-form" novalidate @submit.prevent="submit" @input="revalidate">
    <h2 class="child-form__title">{{ mode === 'add' ? 'Lisa laps' : `Muuda: ${initial.name}` }}</h2>

    <fieldset class="group">
      <legend>Põhiandmed</legend>
      <div class="grid grid--3">
        <FormField id="child-name" label="Nimi" :error="errors.name">
          <template #default="{ describedBy, invalid }">
            <input
              id="child-name"
              v-model="draft.name"
              class="input"
              type="text"
              autocomplete="off"
              :aria-invalid="invalid"
              :aria-describedby="describedBy"
            />
          </template>
        </FormField>
        <FormField id="child-age" label="Vanus" :error="errors.age">
          <template #default="{ describedBy, invalid }">
            <input
              id="child-age"
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
        <FormField id="child-readingLevel" label="Lugemisoskus" :error="errors.readingLevel">
          <template #default="{ describedBy }">
            <select id="child-readingLevel" v-model="draft.readingLevel" class="select" :aria-describedby="describedBy">
              <option v-for="[value, label] in readingLevels" :key="value" :value="value">{{ label }}</option>
            </select>
          </template>
        </FormField>
      </div>
      <FormField
        id="child-nameGenitive"
        label="Nimi omastavas käändes (valikuline)"
        :hint="genitivePreview ? `Tekstides kasutame vormi „${genitivePreview}“ (nt „${genitivePreview}le“). Muuda, kui nimi käändub teisiti, näiteks Mart → Mardi.` : 'Vajalik vaid ebareeglipäraste nimede puhul, näiteks Mart → Mardi.'"
        :error="errors.nameGenitive"
      >
        <template #default="{ describedBy }">
          <input id="child-nameGenitive" v-model="draft.nameGenitive" class="input" type="text" :aria-describedby="describedBy" />
        </template>
      </FormField>
    </fieldset>

    <fieldset class="group">
      <legend>Mis lapsele meeldib?</legend>
      <p class="group__hint">
        Vali loendist kõik, mis sobib. Iga teema kohta on kirjades valmis lood – näiteks päkapikk proovib ise
        jalgpalli või põhjapõder Välk hakkab dinosauruseks.
      </p>
      <TopicPicker v-model="topics" />
    </fieldset>

    <fieldset class="group">
      <legend>Veel huvisid ja lemmikuid</legend>
      <p class="group__hint">
        Mida loendis pole, kirjuta siia ja eralda komadega. Lühemates kirjades mainime neid nimepidi, aga
        jõulusarja lugudesse jõuavad ainult loendist valitud teemad.
      </p>
      <div class="grid grid--2">
        <FormField id="child-interests" label="Muud huvid ja hobid" hint="nt linnuvaatlus, kalapüük">
          <template #default="{ describedBy }">
            <ListInput id="child-interests" v-model="draft.interests" :described-by="describedBy" />
          </template>
        </FormField>
        <FormField id="child-favorites" label="Lemmikraamatud ja -tegelased" hint="nt Miki Hiire koomiksid, Lotte">
          <template #default="{ describedBy }">
            <ListInput id="child-favorites" v-model="draft.favorites" :described-by="describedBy" />
          </template>
        </FormField>
        <FormField id="child-foods" label="Muud lemmiktoidud" hint="nt kartulipuder, mustikad">
          <template #default="{ describedBy }">
            <ListInput id="child-foods" v-model="draft.foods" :described-by="describedBy" />
          </template>
        </FormField>
        <FormField id="child-family" label="Pereliikmed, õed-vennad" hint="nt ema, isa, vend Jasper, kass Miisu">
          <template #default="{ describedBy }">
            <ListInput id="child-family" v-model="draft.family" :described-by="describedBy" />
          </template>
        </FormField>
        <FormField id="child-achievements" label="Erilised saavutused" hint="nt õppis rattaga sõitma">
          <template #default="{ describedBy }">
            <ListInput id="child-achievements" v-model="draft.achievements" :described-by="describedBy" />
          </template>
        </FormField>
        <FormField id="child-personality" label="Iseloom" hint="nt uudishimulik, naljakas, natuke häbelik">
          <template #default="{ describedBy }">
            <input id="child-personality" v-model="draft.personality" class="input" type="text" :aria-describedby="describedBy" />
          </template>
        </FormField>
      </div>
    </fieldset>

    <fieldset class="group">
      <legend>Lisainfo</legend>
      <div class="grid grid--2">
        <FormField id="child-details" label="Lisadetailid" hint="Kõik, mis aitab tekste kohandada.">
          <template #default="{ describedBy }">
            <textarea id="child-details" v-model="draft.details" class="textarea" rows="3" :aria-describedby="describedBy" />
          </template>
        </FormField>
        <FormField id="child-parentNotes" label="Märkmed lapsevanemale" hint="Ainult sulle – ei ilmu tekstides.">
          <template #default="{ describedBy }">
            <textarea id="child-parentNotes" v-model="draft.parentNotes" class="textarea" rows="3" :aria-describedby="describedBy" />
          </template>
        </FormField>
      </div>
    </fieldset>

    <div class="child-form__actions">
      <BaseButton variant="ghost" @click="emit('cancel')">Tühista</BaseButton>
      <BaseButton type="submit">{{ mode === 'add' ? 'Lisa laps' : 'Salvesta muudatused' }}</BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.child-form {
  padding: clamp(1.25rem, 3vw, 2rem);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.child-form__title {
  font-size: 1.5rem;
}
.group {
  border: 0;
  padding: 0;
  margin: 0 0 1.75rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  legend {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    padding: 0;
  }
}
.group__hint {
  margin: -0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.grid {
  display: grid;
  gap: 1rem;
}
.grid--3 {
  grid-template-columns: 2fr 1fr 2fr;
}
.grid--2 {
  grid-template-columns: 1fr 1fr;
}
.child-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}
@media (max-width: 720px) {
  .grid--3,
  .grid--2 {
    grid-template-columns: 1fr;
  }
}
</style>
