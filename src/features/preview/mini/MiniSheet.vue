<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { GeneratedItem } from '../../../domain/models'
import { miniPages, MINI_ROWS } from '../../../domain/miniLayout'
import { PAGE_HEIGHT_MM, PAGE_WIDTH_MM, POSTER_HEIGHT_MM } from '../../../domain/posterLayout'
import MiniCard from './MiniCard.vue'

/** Sheets of toddler cards: 12 per A4 page in two columns, with cut lines. */
const props = defineProps<{ items: GeneratedItem[]; title: string; uppercase: boolean }>()
const emit = defineEmits<{ overflowCount: [count: number] }>()

const pages = computed(() => miniPages(props.items.length))
const cellW = PAGE_WIDTH_MM / 2
const cellH = POSTER_HEIGHT_MM / MINI_ROWS

const overflowing = ref(new Set<number>())
// On narrow screens the sheets are scaled down; printing always uses real size.
const board = ref<HTMLElement | null>(null)
const zoom = ref(1)
let observer: ResizeObserver | undefined
const SHEET_PX = (PAGE_WIDTH_MM * 96) / 25.4
function updateZoom(): void {
  const width = board.value?.parentElement?.clientWidth ?? 0
  if (width) zoom.value = Math.min(1, width / SHEET_PX)
}
onMounted(() => {
  updateZoom()
  if (typeof ResizeObserver !== 'undefined' && board.value?.parentElement) {
    observer = new ResizeObserver(updateZoom)
    observer.observe(board.value.parentElement)
  }
})
onBeforeUnmount(() => observer?.disconnect())

function onOverflow(index: number, value: boolean): void {
  const next = new Set(overflowing.value)
  if (value) next.add(index)
  else next.delete(index)
  overflowing.value = next
  emit('overflowCount', next.size)
}
</script>

<template>
  <div ref="board" class="mini-board" :style="{ zoom }">
    <section
      v-for="(page, p) in pages"
      :key="p"
      class="mini-sheet"
      :aria-label="`Leht ${p + 1}/${pages.length}`"
      :style="{ width: `${PAGE_WIDTH_MM}mm`, height: `${PAGE_HEIGHT_MM}mm` }"
    >
      <div class="mini-sheet__area" :style="{ height: `${POSTER_HEIGHT_MM}mm` }">
        <div
          v-for="slot in page"
          :key="slot.index"
          class="mini-cell"
          :style="{ left: `${slot.col * cellW}mm`, top: `${slot.row * cellH}mm`, width: `${cellW}mm`, height: `${cellH}mm` }"
        >
          <MiniCard
            :item="items[slot.index] as GeneratedItem"
            :index="slot.index"
            :uppercase="uppercase"
            @overflow="(value) => onOverflow(slot.index, value)"
          />
        </div>
        <svg class="mini-sheet__cuts" :viewBox="`0 0 ${PAGE_WIDTH_MM} ${POSTER_HEIGHT_MM}`" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0.15" y="0.15" :width="PAGE_WIDTH_MM - 0.3" :height="POSTER_HEIGHT_MM - 0.3" fill="none" class="cut" />
          <line :x1="cellW" y1="0" :x2="cellW" :y2="POSTER_HEIGHT_MM" class="cut" />
          <line v-for="r in MINI_ROWS - 1" :key="r" x1="0" :y1="r * cellH" :x2="PAGE_WIDTH_MM" :y2="r * cellH" class="cut" />
        </svg>
      </div>
      <p class="mini-sheet__label">{{ title }}, leht {{ p + 1 }}/{{ pages.length }}</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.mini-board {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}
.mini-sheet {
  position: relative;
  background: #fff;
  box-shadow: var(--shadow);
  max-width: 100%;
}
.mini-sheet__area {
  position: relative;
}
.mini-cell {
  position: absolute;
}
.mini-sheet__cuts {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  .cut {
    stroke: #8d8597;
    stroke-width: 0.3;
    stroke-dasharray: 2 1.5;
    vector-effect: non-scaling-stroke;
  }
}
.mini-sheet__label {
  margin: 1.2mm 0 0;
  font-family: var(--font-body);
  font-size: 7.5pt;
  color: #5b5366;
}
@media print {
  .mini-board {
    display: block;
    zoom: 1 !important;
  }
  .mini-sheet {
    box-shadow: none;
    break-after: page;
    page-break-after: always;
  }
  .mini-sheet:last-child {
    break-after: auto;
    page-break-after: auto;
  }
}
</style>
