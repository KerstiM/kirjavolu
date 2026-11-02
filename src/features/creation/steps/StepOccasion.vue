<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ContentTypeId, OccasionId } from '../../../domain/models'
import { getOccasion, OCCASIONS } from '../../../domain/occasions/occasions'
import { isInSeason, sortBySeason } from '../../../domain/occasions/season'
import ChoiceCard from '../../../components/ui/ChoiceCard.vue'
import { iconFor } from '../../../components/ui/icons'
import StampCard from '../../../components/brand/StampCard.vue'
import { STAMP_COLORS, useDesign } from '../../../components/brand/design'
import PickedChoice from './PickedChoice.vue'

const props = defineProps<{ contentType: ContentTypeId | null }>()
const model = defineModel<OccasionId | null>({ required: true })

const design = useDesign()
const occasions = computed(() => sortBySeason(OCCASIONS))
// In the new design an occasion picked on the home page stays one line; "Muuda" opens the list.
const listOpen = ref(model.value === null)
watch(model, (value) => {
  if (value === null) listOpen.value = true
})
function choose(value: OccasionId): void {
  model.value = value
  listOpen.value = false
}
const picked = computed(() => (model.value ? getOccasion(model.value) : null))

function badgeFor(id: OccasionId, suggested: ContentTypeId[]): string {
  if (props.contentType && suggested.slice(0, 2).includes(props.contentType)) return 'Hea valik'
  return isInSeason(id) ? 'Hooajal' : ''
}
</script>

<template>
  <section aria-labelledby="step-occasion-title">
    <h2 id="step-occasion-title" class="step-title">Mis puhul?</h2>
    <PickedChoice
      v-if="design === 'new' && picked && !listOpen"
      :icon="iconFor(picked.icon)"
      :title="picked.name"
      :detail="picked.when"
      :ink="STAMP_COLORS[picked.id]"
      :edge="[STAMP_COLORS[picked.id], STAMP_COLORS[picked.id]]"
      change-label="Muuda tähtpäeva"
      @change="listOpen = true"
    />
    <p v-else class="step-lead">Tähtpäev mõjutab tekstide sisu, tegelasi ja tegevusi. Sobib ka täiesti tavaline päev.</p>
    <div v-if="design === 'new' && (!picked || listOpen)" class="stamp-grid" role="radiogroup" aria-labelledby="step-occasion-title">
      <StampCard
        v-for="(occasion, index) in occasions"
        :key="occasion.id"
        :name="occasion.name"
        :when="occasion.when"
        :icon="iconFor(occasion.icon)"
        :color="STAMP_COLORS[occasion.id]"
        :index="index"
        :badge="badgeFor(occasion.id, occasion.suggested)"
        :selected="model === occasion.id"
        @select="choose(occasion.id)"
      />
    </div>
    <div v-else-if="design !== 'new'" class="choice-grid" role="radiogroup" aria-labelledby="step-occasion-title">
      <ChoiceCard
        v-for="occasion in occasions"
        :key="occasion.id"
        tone="sage"
        :title="occasion.name"
        :description="`${occasion.when} · ${occasion.description}`"
        :icon="iconFor(occasion.icon)"
        :badge="badgeFor(occasion.id, occasion.suggested)"
        :selected="model === occasion.id"
        @select="model = occasion.id"
      />
    </div>
  </section>
</template>
