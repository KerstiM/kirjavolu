<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { GeneratedItem, OccasionId, PatternId } from '../../../domain/models'
import {
  cellsOnPage,
  computePoster,
  itemAt,
  PAGE_HEIGHT_MM,
  PAGE_WIDTH_MM,
  pagePosition,
  pathGeometry,
  POSTER_HEIGHT_MM,
  posterPages,
  type PosterCell,
  type PosterPage,
} from '../../../domain/posterLayout'
import PatternBackground from '../decoration/PatternBackground.vue'
import PosterArt from './PosterArt.vue'
import PosterCard from './PosterCard.vue'

const props = defineProps<{
  items: GeneratedItem[]
  occasionId: OccasionId
  title: string
  imageUrl: string | null
  pattern: PatternId | null
  uppercase: boolean
}>()
const emit = defineEmits<{ overflowCount: [count: number]; edit: [itemId: string] }>()

const layout = computed(() => computePoster(props.items.length))
const pages = computed(() => posterPages(layout.value))
const geometry = computed(() => pathGeometry(layout.value))
const posterWidth = computed(() => layout.value.pageCols * PAGE_WIDTH_MM)
const posterHeight = computed(() => layout.value.pageRows * POSTER_HEIGHT_MM)
const trackPoints = computed(() => geometry.value.points.map((p) => `${p.x},${p.y}`).join(' '))

function pageViewBox(page: PosterPage): string {
  return `${page.pageCol * PAGE_WIDTH_MM} ${page.pageRow * POSTER_HEIGHT_MM} ${PAGE_WIDTH_MM} ${POSTER_HEIGHT_MM}`
}

function cellStyle(cell: PosterCell, page: PosterPage): Record<string, string> {
  const { cellWidthMm, cellHeightMm, rowsPerPage } = layout.value
  return {
    left: `${(cell.col - page.pageCol * 2) * cellWidthMm}mm`,
    top: `${(cell.row - page.pageRow * rowsPerPage) * cellHeightMm}mm`,
    width: `${cellWidthMm}mm`,
    height: `${cellHeightMm}mm`,
  }
}

/** The uploaded picture spans the whole poster; each sheet shows its slice. */
function imageStyle(page: PosterPage): Record<string, string> {
  return {
    width: `${layout.value.pageCols * 100}%`,
    height: `${layout.value.pageRows * 100}%`,
    left: `${-page.pageCol * 100}%`,
    top: `${-page.pageRow * 100}%`,
  }
}

// Cut lines: the vertical centre line and every row border of the sheet.
const cutRows = computed(() =>
  Array.from({ length: layout.value.rowsPerPage - 1 }, (_, i) => (i + 1) * layout.value.cellHeightMm),
)

const overflowing = ref(new Set<string>())
function onOverflow(id: string, value: boolean): void {
  const next = new Set(overflowing.value)
  if (value) next.add(id)
  else next.delete(id)
  overflowing.value = next
  emit('overflowCount', next.size)
}

// On screen the sheets are scaled down to fit; printing always uses real size.
const board = ref<HTMLElement | null>(null)
const zoom = ref(1)
let observer: ResizeObserver | undefined
const MM_TO_PX = 96 / 25.4
const GAP_PX = 12
function updateZoom(): void {
  const width = board.value?.parentElement?.clientWidth ?? 0
  if (!width) return
  const natural = layout.value.pageCols * PAGE_WIDTH_MM * MM_TO_PX + (layout.value.pageCols - 1) * GAP_PX
  zoom.value = Math.min(1, width / natural)
}
onMounted(() => {
  updateZoom()
  if (typeof ResizeObserver !== 'undefined' && board.value?.parentElement) {
    observer = new ResizeObserver(updateZoom)
    observer.observe(board.value.parentElement)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="board"
    class="board"
    :style="{ '--zoom': zoom, gridTemplateColumns: `repeat(${layout.pageCols}, ${PAGE_WIDTH_MM}mm)` }"
  >
    <section
      v-for="page in pages"
      :key="page.index"
      class="sheet"
      :aria-label="`Leht ${page.index + 1}/${layout.pages}: ${pagePosition(page, layout)}`"
      :style="{ width: `${PAGE_WIDTH_MM}mm`, height: `${PAGE_HEIGHT_MM}mm` }"
    >
      <div class="sheet__poster" :style="{ height: `${POSTER_HEIGHT_MM}mm` }">
        <img v-if="imageUrl" :src="imageUrl" alt="" class="sheet__image" :style="imageStyle(page)" />
        <svg class="sheet__layer" :viewBox="pageViewBox(page)" preserveAspectRatio="none" aria-hidden="true">
          <PosterArt v-if="!imageUrl" :occasion-id="occasionId" :width-mm="posterWidth" :height-mm="posterHeight" />
          <polyline :points="trackPoints" fill="none" stroke="#33305e" stroke-width="6.4" stroke-linejoin="round" stroke-linecap="round" />
          <polyline :points="trackPoints" fill="none" stroke="#f2c46d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />
          <g v-for="(s, i) in geometry.stations" :key="i">
            <circle :cx="s.x" :cy="s.y" r="5" fill="#f2c46d" stroke="#33305e" stroke-width="1.3" />
            <circle :cx="s.x" :cy="s.y" r="1.7" fill="#33305e" />
          </g>
        </svg>
        <PatternBackground v-if="pattern && !imageUrl" :pattern="pattern" :ink-saver="false" class="sheet__pattern" />

        <div v-for="cell in cellsOnPage(page, layout)" :key="`${cell.col}-${cell.row}`" class="cell" :style="cellStyle(cell, page)">
          <PosterCard
            v-if="itemAt(cell, layout) !== null"
            :item="items[itemAt(cell, layout) as number] as GeneratedItem"
            :uppercase="uppercase"
            @overflow="(value) => onOverflow((items[itemAt(cell, layout) as number] as GeneratedItem).id, value)"
            @edit="emit('edit', (items[itemAt(cell, layout) as number] as GeneratedItem).id)"
          />
        </div>

        <svg class="sheet__cuts" :viewBox="`0 0 ${PAGE_WIDTH_MM} ${POSTER_HEIGHT_MM}`" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0.15" y="0.15" :width="PAGE_WIDTH_MM - 0.3" :height="POSTER_HEIGHT_MM - 0.3" fill="none" class="cut" />
          <line :x1="PAGE_WIDTH_MM / 2" y1="0" :x2="PAGE_WIDTH_MM / 2" :y2="POSTER_HEIGHT_MM" class="cut" />
          <line v-for="y in cutRows" :key="y" x1="0" :y1="y" :x2="PAGE_WIDTH_MM" :y2="y" class="cut" />
        </svg>
      </div>
      <p class="sheet__label">{{ title }}, leht {{ page.index + 1 }}/{{ layout.pages }}: {{ pagePosition(page, layout) }}</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.board {
  display: grid;
  gap: 12px;
  justify-content: center;
  zoom: var(--zoom);
}
.sheet {
  position: relative;
  background: #fff;
  box-shadow: var(--shadow);
}
.sheet__poster {
  position: relative;
  overflow: hidden;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.sheet__image {
  position: absolute;
  max-width: none;
  object-fit: cover;
}
.sheet__layer,
.sheet__cuts {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.sheet__pattern {
  opacity: 0.6;
}
.sheet__cuts {
  z-index: 2;
  pointer-events: none;
  .cut {
    stroke: #8d8597;
    stroke-width: 0.3;
    stroke-dasharray: 2 1.5;
    vector-effect: non-scaling-stroke;
  }
}
.cell {
  position: absolute;
  z-index: 1;
}
.sheet__label {
  margin: 1.2mm 0 0;
  font-family: var(--font-body);
  font-size: 7.5pt;
  color: #5b5366;
}
@media print {
  .board {
    display: block;
    zoom: 1;
  }
  .sheet {
    box-shadow: none;
    break-after: page;
    page-break-after: always;
  }
  .sheet:last-child {
    break-after: auto;
    page-break-after: auto;
  }
}
</style>
