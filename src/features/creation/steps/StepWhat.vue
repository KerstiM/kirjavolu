<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { ContentTypeId, OccasionId } from '../../../domain/models'
import StepType from './StepType.vue'
import StepOccasion from './StepOccasion.vue'

/** First question: what to make and for which occasion, on one screen. */
const contentType = defineModel<ContentTypeId | null>('contentType', { required: true })
const occasionId = defineModel<OccasionId | null>('occasionId', { required: true })
const emit = defineEmits<{ done: [] }>()

const occasionSection = ref<HTMLElement | null>(null)

async function pickType(value: ContentTypeId | null): Promise<void> {
  contentType.value = value
  if (occasionId.value) {
    emit('done')
    return
  }
  // The occasion is still open: bring it into view so a phone user sees what comes next.
  await nextTick()
  const heading = occasionSection.value?.querySelector<HTMLElement>('h2')
  heading?.setAttribute('tabindex', '-1')
  heading?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  heading?.focus({ preventScroll: true })
}

function pickOccasion(value: OccasionId | null): void {
  occasionId.value = value
  if (contentType.value) emit('done')
}
</script>

<template>
  <div class="step-what">
    <StepType :model-value="contentType" :occasion-id="occasionId" @update:model-value="pickType" />
    <div ref="occasionSection" class="step-what__occasion">
      <StepOccasion :model-value="occasionId" :content-type="contentType" @update:model-value="pickOccasion" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.step-what__occasion {
  margin-top: 2.5rem;
  scroll-margin-top: 5rem;
}
</style>
