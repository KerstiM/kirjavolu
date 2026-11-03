<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ContentTypeId, OccasionId } from '../../../domain/models'
import { CONTENT_TYPES } from '../../../domain/contentTypes'
import { getOccasion } from '../../../domain/occasions/occasions'
import ChoiceCard from '../../../components/ui/ChoiceCard.vue'
import { iconFor } from '../../../components/ui/icons'
import PostcardCard from '../../../components/brand/PostcardCard.vue'
import { postcardLook, useDesign } from '../../../components/brand/design'
import PickedChoice from './PickedChoice.vue'
import { isReady, NOT_READY_LABEL } from '../../home/new/readiness'

const props = defineProps<{ occasionId: OccasionId | null }>()
const model = defineModel<ContentTypeId | null>({ required: true })

const design = useDesign()
// In the new design a type picked on the home page stays one line; "Muuda" opens the list.
const listOpen = ref(model.value === null)
watch(model, (value) => {
  if (value === null) listOpen.value = true
})
function choose(value: ContentTypeId): void {
  model.value = value
  listOpen.value = false
}
const pickedIndex = computed(() => CONTENT_TYPES.findIndex((type) => type.id === model.value))
const picked = computed(() => CONTENT_TYPES[pickedIndex.value])
// The same colours as the postcard it stands for.
const pickedLook = computed(() => postcardLook(Math.max(pickedIndex.value, 0)))
const recommended = computed(() => (props.occasionId ? getOccasion(props.occasionId).suggested.slice(0, 3) : []))
</script>

<template>
  <section aria-labelledby="step-type-title">
    <h2 id="step-type-title" class="step-title">Mida soovid luua?</h2>
    <PickedChoice
      v-if="design === 'new' && picked && !listOpen"
      :icon="iconFor(picked.icon)"
      :title="picked.title"
      :detail="picked.tagline"
      :ink="pickedLook.ink"
      :edge="pickedLook.edge"
      change-label="Muuda, mida luua"
      @change="listOpen = true"
    />
    <p v-else class="step-lead">
      Vali sisu tüüp.<template v-if="occasionId"> Märgitud on need, mis sobivad selle sündmusega eriti hästi.</template>
    </p>
    <div v-if="design === 'new' && (!picked || listOpen)" class="postcard-grid" role="radiogroup" aria-labelledby="step-type-title">
      <PostcardCard
        v-for="(type, index) in CONTENT_TYPES"
        :key="type.id"
        :title="type.title"
        :tagline="type.tagline"
        :description="type.description"
        :icon="iconFor(type.icon)"
        :index="index"
        :selected="model === type.id"
        :badge="recommended.includes(type.id) ? 'Sobib hästi' : ''"
        :soon="isReady(type.id) ? '' : NOT_READY_LABEL"
        @select="choose(type.id)"
      />
    </div>
    <div v-else-if="design !== 'new'" class="choice-grid" role="radiogroup" aria-labelledby="step-type-title">
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
