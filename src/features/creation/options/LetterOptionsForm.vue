<script setup lang="ts">
import type { ChildProfile, LetterOptions, OccasionId } from '../../../domain/models'
import PersonaEditor from './PersonaEditor.vue'
import FamilyEventsEditor from './FamilyEventsEditor.vue'
import ChallengesEditor from './ChallengesEditor.vue'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'

const props = defineProps<{ children: ChildProfile[]; occasionId: OccasionId }>()
const model = defineModel<LetterOptions>({ required: true })

const modeOptions = [
  { value: 'linked' as const, label: 'Igaühele oma, omavahel seotud' },
  { value: 'shared' as const, label: 'Üks ühine kiri kõigile' },
]
const linked = () => props.children.length > 1 && (model.value.mode ?? 'linked') === 'linked'

const countOptions = [
  { value: 1 as const, label: '1 kiri' },
  { value: 3 as const, label: '3 kirja' },
  { value: 7 as const, label: '7 kirja' },
  { value: 24 as const, label: '24 kirja' },
]
const connectedOptions = [
  { value: false, label: 'Iseseisvad kirjad' },
  { value: true, label: 'Järjejutt' },
]
</script>

<template>
  <div class="options-grid">
    <div v-if="children.length > 1" class="options-grid__wide">
      <SegmentedControl
        :model-value="model.mode ?? 'linked'"
        name="letter-mode"
        label="Mitu last"
        :options="modeOptions"
        hint="Seotud sarjades saab iga laps oma kirjad, aga abilised tunnevad üksteist ja vanem laps teeb aeg-ajalt midagi nooremale – mõlema kiri teab sellest."
        @update:model-value="(value) => (model.mode = value)"
      />
    </div>
    <div v-if="linked()" class="options-grid__wide">
      <PersonaEditor v-model="model.personas" :children="children" :occasion-id="occasionId" />
    </div>
    <FormField v-if="!linked()" id="letter-sender" label="Saatja nimi" hint="Näiteks Päkapikk Tuduja või Hambahaldjas Helk.">
      <template #default="{ describedBy }">
        <input id="letter-sender" v-model="model.sender" class="input" type="text" :aria-describedby="describedBy" />
      </template>
    </FormField>
    <FormField id="letter-date" label="Esimese kirja kuupäev" hint="Sarja puhul saab iga järgmine kiri järgmise päeva kuupäeva.">
      <template #default="{ describedBy }">
        <input id="letter-date" v-model="model.startDate" class="input" type="date" :aria-describedby="describedBy" />
      </template>
    </FormField>
    <SegmentedControl v-model="model.count" name="letter-count" label="Kirjade arv" :options="countOptions" />
    <SegmentedControl
      v-if="model.count > 1"
      v-model="model.connected"
      name="letter-connected"
      label="Kirjade seos"
      :options="connectedOptions"
      hint="Järjejutus otsitakse kirjast kirja kadunud võlutähte."
    />
    <div v-if="model.count > 1" class="options-grid__wide">
      <FamilyEventsEditor
        v-model:events="model.events"
        v-model:sunday-sweets="model.sundaySweets"
        :children="children"
        :start-date="model.startDate"
        :count="model.count"
      />
    </div>
    <div v-if="model.count > 1" class="options-grid__wide">
      <ChallengesEditor v-model="model.challenges" :children="children" :start-date="model.startDate" :count="model.count" />
    </div>
  </div>
</template>
