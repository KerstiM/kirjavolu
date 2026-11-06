<script setup lang="ts">
import { computed } from 'vue'
import { companionSvg } from './art'
import type { CompanionId } from './companions'

/** One companion in one pose, drawn like the brand mascot; see art.ts. */
const props = withDefaults(defineProps<{ id: CompanionId; pose?: number; size?: number }>(), {
  pose: 0,
  size: 96,
})
// The drawings are fixed text from art.ts, never anything a user typed.
const svg = computed(() => companionSvg(props.id, props.pose))
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <span
    class="companion-figure"
    :style="{ width: `${size}px`, height: `${(size * 250) / 200}px` }"
    v-html="svg"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<style scoped lang="scss">
.companion-figure {
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
  :deep(svg) {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}
</style>
