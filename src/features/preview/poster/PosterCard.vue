<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GeneratedItem } from '../../../domain/models'
import { formatDayMonth, weekdayName } from '../../../domain/text/estonian'
import { useFitText } from '../../../composables/useFitText'

const props = defineProps<{ item: GeneratedItem; uppercase: boolean }>()
const emit = defineEmits<{ overflow: [value: boolean] }>()

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
})
watch(overflow, (value) => emit('overflow', value), { immediate: true })
</script>

<template>
  <article class="card" :class="{ 'is-upper': uppercase, 'is-overflow': overflow }">
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
    <p v-if="overflow" class="card__warning no-print">Tekst on kaardi jaoks liiga pikk – lühenda seda paigutuses „Terve leht“.</p>
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
