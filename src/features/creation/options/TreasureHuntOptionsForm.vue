<script setup lang="ts">
import { computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { TreasureHuntOptions } from '../../../domain/models'
import { HUNT_LOCATIONS } from '../../../data/templates/locations'
import FormField from '../../../components/ui/FormField.vue'
import ListInput from '../../../components/ui/ListInput.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { SETTING_OPTIONS } from '../labels'

defineProps<{ multipleChildren: boolean }>()
const model = defineModel<TreasureHuntOptions>({ required: true })

const suggestions = computed(() =>
  HUNT_LOCATIONS.filter((location) => location.setting === model.value.setting)
    .map((location) => location.name)
    .filter((name) => !model.value.locations.includes(name)),
)
const cooperativeOptions = [
  { value: true, label: 'Ühine jaht' },
  { value: false, label: 'Igaühele oma vihjed' },
]

function addLocation(name: string): void {
  model.value.locations = [...model.value.locations, name]
}
</script>

<template>
  <div class="options-grid">
    <FormField id="hunt-count" label="Vihjete arv" :hint="`${model.clueCount} vihjet – umbes ${model.clueCount * 3} minutit mängu.`">
      <template #default="{ describedBy }">
        <input
          id="hunt-count"
          v-model.number="model.clueCount"
          class="range"
          type="range"
          min="3"
          max="12"
          :aria-describedby="describedBy"
        />
      </template>
    </FormField>
    <SegmentedControl v-model="model.setting" name="hunt-setting" label="Kus mängitakse?" :options="SETTING_OPTIONS" />
    <SegmentedControl
      v-if="multipleChildren"
      v-model="model.cooperative"
      name="hunt-coop"
      label="Mitu last"
      :options="cooperativeOptions"
      hint="Ühises jahis loevad lapsed vihjeid kordamööda."
    />
    <FormField id="hunt-prize" label="Aare lõpus" hint="Mida laps lõpuks leiab?">
      <template #default="{ describedBy }">
        <input id="hunt-prize" v-model="model.prize" class="input" type="text" :aria-describedby="describedBy" />
      </template>
    </FormField>
    <div class="options-grid__wide">
      <FormField
        id="hunt-locations"
        label="Saadaval peidukohad (valikuline)"
        hint="Eralda komadega. Kui kohti on vähem kui vihjeid, lisame ise sobivaid."
      >
        <template #default="{ describedBy }">
          <ListInput id="hunt-locations" v-model="model.locations" :described-by="describedBy" placeholder="nt diivan, külmkapp, raamaturiiul" />
        </template>
      </FormField>
      <div class="suggestions" aria-label="Soovitatud peidukohad">
        <button v-for="name in suggestions" :key="name" type="button" class="suggestion" @click="addLocation(name)">
          <Plus :size="14" aria-hidden="true" /> {{ name }}
        </button>
      </div>
    </div>
  </div>
</template>
