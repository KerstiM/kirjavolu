<script setup lang="ts">
import { computed } from 'vue'
import type { ContentTypeId, OccasionId } from '../../../domain/models'
import { OCCASIONS } from '../../../domain/occasions/occasions'
import { isInSeason, sortBySeason } from '../../../domain/occasions/season'
import ChoiceCard from '../../../components/ui/ChoiceCard.vue'
import { iconFor } from '../../../components/ui/icons'

const props = defineProps<{ contentType: ContentTypeId | null }>()
const model = defineModel<OccasionId | null>({ required: true })

const occasions = computed(() => sortBySeason(OCCASIONS))

function badgeFor(id: OccasionId, suggested: ContentTypeId[]): string {
  if (props.contentType && suggested.slice(0, 2).includes(props.contentType)) return 'Hea valik'
  return isInSeason(id) ? 'Hooajal' : ''
}
</script>

<template>
  <section aria-labelledby="step-occasion-title">
    <h2 id="step-occasion-title" class="step-title">Mis puhul?</h2>
    <p class="step-lead">Tähtpäev mõjutab tekstide sisu, tegelasi ja tegevusi. Sobib ka täiesti tavaline päev.</p>
    <div class="choice-grid" role="radiogroup" aria-labelledby="step-occasion-title">
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
