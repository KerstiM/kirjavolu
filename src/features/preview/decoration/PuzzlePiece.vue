<script setup lang="ts">
import { computed } from 'vue'
import { piecePosition, pieceSizeCm, type PuzzleGrid } from '../../../domain/puzzleGrid'

/**
 * One cut-out piece of the picture. Uses an <img> (not a CSS background) so it
 * prints even when the browser's "background graphics" option is off.
 */
const props = defineProps<{ imageUrl: string; grid: PuzzleGrid; index: number; maxCm: number }>()

const size = computed(() => pieceSizeCm(props.grid, props.maxCm))
const imageStyle = computed(() => {
  const { row, col } = piecePosition(props.index, props.grid)
  return {
    width: `${props.grid.cols * 100}%`,
    height: `${props.grid.rows * 100}%`,
    left: `${-col * 100}%`,
    top: `${-row * 100}%`,
  }
})
</script>

<template>
  <figure class="piece">
    <div class="piece__cut" :style="{ width: `${size.width}cm`, height: `${size.height}cm` }">
      <img :src="imageUrl" alt="" class="piece__img" :style="imageStyle" />
      <span class="piece__number">{{ index + 1 }}</span>
    </div>
    <figcaption class="piece__caption">
      Puslekild {{ index + 1 }}/{{ grid.cells }} – lõika mööda katkendjoont välja ja hoia alles
    </figcaption>
  </figure>
</template>

<style scoped lang="scss">
.piece {
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  break-inside: avoid;
}
.piece__cut {
  position: relative;
  overflow: hidden;
  outline: 2px dashed #8d8597;
  outline-offset: 3px;
  max-width: 100%;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.piece__img {
  position: absolute;
  max-width: none;
}
.piece__number {
  position: absolute;
  top: 4px;
  left: 4px;
  min-width: 1.5em;
  padding: 0 0.3em;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #2b2433;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
}
.piece__caption {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: #5b5366;
  text-align: center;
}
</style>
