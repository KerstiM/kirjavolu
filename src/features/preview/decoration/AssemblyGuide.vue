<script setup lang="ts">
import { computed } from 'vue'
import type { PuzzleGrid } from '../../../domain/puzzleGrid'
import PuzzlePiece from './PuzzlePiece.vue'

/** Parent-sheet part of the picture puzzle: a numbered overview and any extra pieces. */
const props = defineProps<{ imageUrl: string; grid: PuzzleGrid; itemCount: number }>()

const extras = computed(() =>
  Array.from({ length: props.grid.cells - props.itemCount }, (_, k) => props.itemCount + k),
)
</script>

<template>
  <div class="guide">
    <h3>Pusle kokkupanek</h3>
    <p>
      Iga osa all on nummerdatud puslekild. Kui kõik {{ grid.cells }} tükki on koos, saab need panna järjekorda vasakult
      paremale ja ülevalt alla – nii nagu all näidatud.
    </p>
    <div class="guide__overview" :style="{ aspectRatio: `${grid.cols * grid.pieceAspect} / ${grid.rows}` }">
      <img :src="imageUrl" alt="Terve puslepilt" />
      <div class="guide__cells" :style="{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }">
        <span v-for="n in grid.cells" :key="n">{{ n }}</span>
      </div>
    </div>
    <template v-if="extras.length">
      <h4>Lisatükid</h4>
      <p>Neid tükke ei ole üheski osas. Lõika need välja ja anna lapsele koos viimase osaga.</p>
      <div class="guide__extras">
        <PuzzlePiece v-for="index in extras" :key="index" :image-url="imageUrl" :grid="grid" :index="index" :max-cm="6" />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.guide {
  margin-bottom: 1.25rem;
  break-inside: avoid;
  h3 {
    font-size: 1.05rem;
    margin-bottom: 0.4rem;
  }
  h4 {
    font-size: 0.95rem;
    margin: 1rem 0 0.25rem;
  }
  p {
    margin: 0 0 0.6rem;
    font-size: 0.92rem;
  }
}
.guide__overview {
  position: relative;
  width: min(100%, 12cm);
  overflow: hidden;
  border-radius: 8px;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
}
.guide__cells {
  position: absolute;
  inset: 0;
  display: grid;
  span {
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.85);
    color: #2b2433;
    font-weight: 700;
    font-size: 0.8rem;
    text-shadow:
      0 0 3px #fff,
      0 0 3px #fff;
  }
}
.guide__extras {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
