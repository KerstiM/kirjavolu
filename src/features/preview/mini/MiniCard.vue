<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Pencil } from 'lucide-vue-next'
import type { GeneratedItem } from '../../../domain/models'
import { weekdayName } from '../../../domain/text/estonian'
import { useFitText } from '../../../composables/useFitText'
import AnimalFace from './AnimalFace.vue'
import { animalFor, colorFor } from './animals'

/** Toddler card: big number, an animal face and a few large words to read aloud. */
const props = defineProps<{ item: GeneratedItem; index: number; uppercase: boolean; smallText?: boolean }>()
const emit = defineEmits<{ overflow: [value: boolean]; edit: [] }>()

const body = ref<HTMLElement | null>(null)
const number = computed(() => (props.item.date ? Number(props.item.date.slice(8, 10)) : props.index + 1))
const weekday = computed(() => (props.item.date ? weekdayName(props.item.date) : ''))
const text = computed(() => props.item.body.split(/\n{2,}/).filter((p) => p.trim()))

const { overflow } = useFitText(body, [() => props.item.body, () => props.uppercase, () => props.smallText], {
  maxPt: () => 13,
  minPt: () => (props.smallText ? 7 : 9),
  headroom: () => (props.uppercase ? 0.88 : 0.95),
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
    <button type="button" class="card-edit no-print" :aria-label="`Muuda: ${number}. kaart`" @click="emit('edit')">
      <span class="card-edit__pill"><Pencil :size="11" aria-hidden="true" /> Muuda</span>
    </button>
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
.card-edit {
  position: absolute;
  bottom: 1.6mm;
  left: 1.6mm;
  z-index: 2;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transition: opacity 0.15s ease;
  &:hover .card-edit__pill,
  &:focus-visible .card-edit__pill {
    border-color: #6b5aa8;
  }
}
.card-edit__pill {
  display: inline-flex;
  align-items: center;
  gap: 1mm;
  padding: 0.8mm 2.4mm;
  border: 0.3mm solid #c9c3dc;
  border-radius: 999px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 7.5pt;
  font-weight: 600;
  color: #54458c;
}
/* On a touch screen the cards are shown small, so the whole card opens the editor. */
@media (hover: none) {
  .card-edit {
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 1.6mm;
  }
}
/* With a mouse the button appears on hover or keyboard focus; on touch screens it is always visible. */
@media (hover: hover) {
  .card-edit {
    opacity: 0;
  }
  .card:hover .card-edit,
  .mini:hover .card-edit,
  .card-edit:focus-visible {
    opacity: 1;
  }
}
@media print {
  .card-edit {
    display: none;
  }
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
