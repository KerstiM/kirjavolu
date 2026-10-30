<script setup lang="ts">
import type { LetterOptions } from '../../../domain/models'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'

const model = defineModel<LetterOptions>({ required: true })

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
    <FormField id="letter-sender" label="Saatja nimi" hint="Näiteks Päkapikk Tuduja või Hambahaldjas Helk.">
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
  </div>
</template>
