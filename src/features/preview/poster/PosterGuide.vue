<script setup lang="ts">
import { computed } from 'vue'
import { computePoster, itemAt } from '../../../domain/posterLayout'

/** Parent-sheet map of the poster: which day sits where, and how the sheets join. */
const props = defineProps<{ count: number; labels: string[] }>()
const layout = computed(() => computePoster(props.count))
const rows = computed(() =>
  Array.from({ length: layout.value.pageRows * layout.value.rowsPerPage }, (_, row) =>
    Array.from({ length: layout.value.cols }, (_, col) => itemAt({ col, row }, layout.value)),
  ),
)
</script>

<template>
  <div class="guide">
    <h3>Pusleplakati kokkupanek</h3>
    <p>
      Prindi {{ layout.pages }} {{ layout.pages === 1 ? 'leht' : 'lehte' }} ja lõika kaardid mööda katkendjooni lahti. Anna
      lapsele iga päev üks kaart. Lõpuks saab kõik kaardid kokku panna: rada viib päevast päeva ja tagant tuleb välja
      terve pilt.
    </p>
    <table class="map" :aria-label="`Plakati kaart: ${layout.cols} veergu`">
      <tbody>
        <tr v-for="(row, r) in rows" :key="r" :class="{ 'page-break': r > 0 && r % layout.rowsPerPage === 0 }">
          <td
            v-for="(index, c) in row"
            :key="c"
            :class="{ 'page-col': c > 0 && c % 2 === 0, empty: index === null }"
          >
            {{ index === null ? '–' : labels[index] }}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="note">Paksemad jooned näitavad lehtede piire.</p>
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
  p {
    margin: 0 0 0.6rem;
    font-size: 0.92rem;
  }
}
.map {
  border-collapse: collapse;
  background: #fff;
  font-size: 0.8rem;
  td {
    width: 5.5rem;
    padding: 0.35rem 0.4rem;
    border: 1px dashed var(--line-strong);
    text-align: center;
  }
  .page-col {
    border-left: 2px solid var(--ink-soft);
  }
  .page-break td {
    border-top: 2px solid var(--ink-soft);
  }
  .empty {
    color: var(--ink-faint);
  }
}
.note {
  font-size: 0.8rem !important;
  color: var(--ink-soft);
}
</style>
