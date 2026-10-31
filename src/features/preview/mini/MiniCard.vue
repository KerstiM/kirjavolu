<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GeneratedItem } from '../../../domain/models'
import { weekdayName } from '../../../domain/text/estonian'
import { useFitText } from '../../../composables/useFitText'
import AnimalFace from './AnimalFace.vue'
import { animalFor, colorFor } from './animals'

/** Toddler card: big number, an animal face and a few large words to read aloud. */
const props = defineProps<{ item: GeneratedItem; index: number; uppercase: boolean }>()
const emit = defineEmits<{ overflow: [value: boolean] }>()

const body = ref<HTMLElement | null>(null)
const number = computed(() => (props.item.date ? Number(props.item.date.slice(8, 10)) : props.index + 1))
const weekday = computed(() => (props.item.date ? weekdayName(props.item.date) : ''))
const text = computed(() => props.item.body.split(/\n{2,}/).filter((p) => p.trim()))

const { overflow } = useFitText(body, [() => props.item.body, () => props.uppercase], {
  maxPt: () => 13,
  minPt: 9,
})
watch(overflow, (value) => emit('overflow', value), { immediate: true })
</script>

<template>
  <article class="mini" :class="{ 'is-upper': uppercase, 'is-overflow': overflow }" :style="{ '--edge': colorFor(index) }">
    <header class="mini__head">
      <span class="mini__number">{{ number }}.</span>
      <span v-if="weekday" class="mini__weekday">{{ weekday }}</span>
    </header>
    <span class="mini__face"><AnimalFace :animal="animalFor(index)" /></span>
    <div ref="body" class="mini__body">
      <div class="mini__inner">
        <p v-for="(paragraph, i) in text" :key="i">{{ paragraph }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.mini {
  position: absolute;
  inset: 4mm 4.5mm;
  display: flex;
  flex-direction: column;
  padding: 2.6mm 3.4mm 2.4mm;
  background: #fff;
  border: 0.7mm solid var(--edge);
  border-radius: 4.5mm;
  font-family: var(--font-print);
  color: #2e2a55;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.mini__head {
  display: flex;
  align-items: baseline;
  gap: 2mm;
  padding-right: 13mm;
}
.mini__number {
  font-size: 17pt;
  font-weight: 600;
  line-height: 1;
  color: #c94f6d;
}
.mini__weekday {
  font-family: var(--font-body);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6f6a8f;
}
.mini__face {
  position: absolute;
  top: 2mm;
  right: 2.6mm;
  width: 11mm;
  height: 11mm;
}
.mini__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-top: 1.4mm;
  padding-right: 6mm;
  line-height: 1.28;
  p {
    margin: 0 0 0.3em;
    overflow-wrap: anywhere;
  }
}
.is-upper .mini__body {
  text-transform: uppercase;
}
@media screen {
  .is-overflow {
    outline: 0.6mm dashed var(--danger);
  }
}
</style>
