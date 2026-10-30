<script setup lang="ts">
import type { CalendarOptions } from '../../../domain/models'
import { MATERIAL_LABELS, type MaterialId } from '../../../data/templates/activities'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { CALENDAR_SETTING_OPTIONS } from '../labels'

const model = defineModel<CalendarOptions>({ required: true })

const dayOptions = [7, 14, 24, 30].map((value) => ({ value, label: `${value} päeva` }))
const minuteOptions = [
  { value: 10 as const, label: 'Kuni 10 min' },
  { value: 20 as const, label: 'Kuni 20 min' },
  { value: 45 as const, label: 'Kuni 45 min' },
]
const materials = Object.entries(MATERIAL_LABELS) as [MaterialId, string][]

function toggleMaterial(id: MaterialId): void {
  const list = model.value.materials
  model.value.materials = list.includes(id) ? list.filter((m) => m !== id) : [...list, id]
}
</script>

<template>
  <div class="options-grid">
    <SegmentedControl v-model="model.days" name="calendar-days" label="Päevade arv" :options="dayOptions" />
    <SegmentedControl v-model="model.setting" name="calendar-setting" label="Kus tegutseda?" :options="CALENDAR_SETTING_OPTIONS" />
    <SegmentedControl v-model="model.minutes" name="calendar-minutes" label="Aeg ühe tegevuse kohta" :options="minuteOptions" />
    <fieldset class="checks options-grid__wide">
      <legend>Kodus olemas olevad vahendid</legend>
      <label v-for="[id, label] in materials" :key="id" class="check">
        <input type="checkbox" :checked="model.materials.includes(id)" @change="toggleMaterial(id)" />
        <span>{{ label }}</span>
      </label>
    </fieldset>
  </div>
</template>
