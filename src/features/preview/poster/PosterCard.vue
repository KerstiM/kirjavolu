<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Pencil } from 'lucide-vue-next'
import type { GeneratedItem } from '../../../domain/models'
import { formatDayMonth, weekdayName } from '../../../domain/text/estonian'
import { useFitText } from '../../../composables/useFitText'

const props = defineProps<{ item: GeneratedItem; uppercase: boolean }>()
const emit = defineEmits<{ overflow: [value: boolean]; edit: [] }>()

const body = ref<HTMLElement | null>(null)
const day = computed(() => (props.item.date ? formatDayMonth(props.item.date) : props.item.label))
const weekday = computed(() => (props.item.date ? weekdayName(props.item.date) : ''))
/** Only the sender's name, like a handwritten signature at the bottom of the card. */
const signer = computed(() => props.item.signature?.split('\n').at(-1) ?? '')
// Letters start with the greeting inline, like a handwritten card: "Kallis Ruben! Tere! …"
const paragraphs = computed(() => {
  const list = props.item.body.split(/\n{2,}/).filter((p) => p.trim())
  if (props.item.kind === 'letter' && props.item.heading && list.length > 0) {
    list[0] = `${props.item.heading} ${list[0]}`
  }
  return list
})

const { overflow } = useFitText(body, [() => props.item.body, () => props.uppercase], {
  maxPt: () => (props.uppercase ? 10.5 : 11),
  minPt: 7.5,
  // Capital letters come out wider in print than on screen: keep more room.
  headroom: () => (props.uppercase ? 0.88 : 0.95),
})
watch(overflow, (value) => emit('overflow', value), { immediate: true })
</script>

<template>
  <article class="card" :class="{ 'is-upper': uppercase, 'is-overflow': overflow }">
    <button type="button" class="card-edit no-print" :aria-label="`Muuda: ${day}`" @click="emit('edit')">
      <span class="card-edit__pill"><Pencil :size="11" aria-hidden="true" /> Muuda</span>
    </button>
    <header class="card__head">
      <span class="card__day">{{ day }}</span>
      <span v-if="weekday" class="card__weekday">{{ weekday }}</span>
    </header>
    <div ref="body" class="card__body">
      <div class="card__inner">
        <p v-if="item.heading && item.kind !== 'letter'" class="card__heading">{{ item.heading }}</p>
        <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
        <p v-if="signer" class="card__signer">{{ signer }}</p>
      </div>
    </div>
    <p v-if="overflow" class="card__warning no-print">Tekst on kaardi jaoks liiga pikk – vajuta „Muuda“ ja lühenda.</p>
  </article>
</template>

<style scoped lang="scss">
.card {
  position: absolute;
  inset: 5mm 5.5mm;
  display: flex;
  flex-direction: column;
  padding: 3.2mm 3.6mm 2.6mm;
  background: rgba(255, 255, 255, 0.94);
  border: 0.45mm solid #77729a;
  border-radius: 4mm;
  font-family: var(--font-print);
  color: #2e2a55;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.card__head {
  display: flex;
  align-items: baseline;
  gap: 2mm;
  margin-bottom: 1.2mm;
}
.card__day {
  font-family: var(--font-print);
  font-weight: 600;
  font-size: 13pt;
  line-height: 1.1;
  color: #c8513a;
  text-transform: uppercase;
}
.card__weekday {
  font-family: var(--font-body);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6f6a8f;
}
.card__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  line-height: 1.32;
  p {
    margin: 0 0 0.45em;
    white-space: pre-line;
    overflow-wrap: anywhere;
  }
}
.is-upper .card__body {
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.card__heading {
  font-weight: 600;
  color: #54458c;
}
.card__signer {
  text-align: right;
  font-weight: 600;
  color: #3f7a4f;
  text-transform: uppercase;
  margin-bottom: 0 !important;
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
.card__warning {
  margin: 1mm 0 0;
  font-family: var(--font-body);
  font-size: 7pt;
  color: var(--danger);
}
.is-overflow {
  border-color: var(--danger);
}
</style>
