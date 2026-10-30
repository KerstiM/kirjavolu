<script setup lang="ts">
import { computed } from 'vue'
import type { ContentTypeId, OccasionId } from '../../../domain/models'
import { CONTENT_TYPES } from '../../../domain/contentTypes'
import { getOccasion } from '../../../domain/occasions/occasions'
import ChoiceCard from '../../../components/ui/ChoiceCard.vue'
import { iconFor } from '../../../components/ui/icons'

const props = defineProps<{ occasionId: OccasionId | null }>()
const model = defineModel<ContentTypeId | null>({ required: true })

const recommended = computed(() => (props.occasionId ? getOccasion(props.occasionId).suggested.slice(0, 3) : []))
</script>

<template>
  <section aria-labelledby="step-type-title">
    <h2 id="step-type-title" class="step-title">Mida soovid luua?</h2>
    <p class="step-lead">
      Vali sisu tüüp.<template v-if="occasionId"> Märgitud on need, mis sobivad selle sündmusega eriti hästi.</template>
    </p>
    <div class="choice-grid" role="radiogroup" aria-labelledby="step-type-title">
      <ChoiceCard
        v-for="type in CONTENT_TYPES"
        :key="type.id"
        :title="type.title"
        :description="type.description"
        :icon="iconFor(type.icon)"
        :selected="model === type.id"
        :badge="recommended.includes(type.id) ? 'Sobib hästi' : ''"
        @select="model = type.id"
      />
    </div>
  </section>
</template>
