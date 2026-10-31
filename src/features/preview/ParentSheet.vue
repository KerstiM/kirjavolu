<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'
import type { GeneratedContent } from '../../domain/models'
import type { PuzzleGrid } from '../../domain/puzzleGrid'
import AssemblyGuide from './decoration/AssemblyGuide.vue'
import PosterGuide from './poster/PosterGuide.vue'

const props = defineProps<{
  content: GeneratedContent
  puzzle?: { imageUrl: string; grid: PuzzleGrid } | null
  posterLabels?: string[] | null
}>()
const solved = computed(() => props.content.items.filter((item) => item.answer || item.parentNote))
</script>

<template>
  <section class="parent-sheet" aria-labelledby="parent-title">
    <header class="parent-sheet__head">
      <ShieldCheck :size="22" aria-hidden="true" />
      <div>
        <h2 id="parent-title">Lapsevanemale</h2>
        <p>Juhised ja vastused – hoia see leht lapse eest peidus.</p>
      </div>
    </header>

    <div v-for="instruction in content.instructions" :key="instruction.title" class="block">
      <h3>{{ instruction.title }}</h3>
      <ol>
        <li v-for="step in instruction.steps" :key="step">{{ step }}</li>
      </ol>
    </div>

    <PosterGuide v-if="posterLabels" :count="posterLabels.length" :labels="posterLabels" />

    <AssemblyGuide
      v-if="puzzle"
      :image-url="puzzle.imageUrl"
      :grid="puzzle.grid"
      :item-count="content.items.length"
    />

    <div v-if="solved.length" class="block">
      <h3>Vastused ja ettevalmistus</h3>
      <table class="answers">
        <thead>
          <tr>
            <th scope="col">Osa</th>
            <th scope="col">Vastus</th>
            <th scope="col">Märkus</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in solved" :key="item.id">
            <th scope="row">{{ item.childId && item.forChild ? `${item.forChild} · ${item.label}` : item.label }}</th>
            <td>{{ item.answer ?? '–' }}</td>
            <td>{{ item.parentNote ?? '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped lang="scss">
.parent-sheet {
  margin-top: 2.5rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 2px solid var(--sage);
  border-radius: var(--radius);
  background: var(--sage-soft);
  font-family: var(--font-body);
}
.parent-sheet__head {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  color: var(--sage-ink);
  margin-bottom: 1.25rem;
  h2 {
    margin: 0;
    color: var(--ink);
    font-size: 1.4rem;
  }
  p {
    margin: 0.15rem 0 0;
    color: var(--ink-soft);
    font-size: 0.92rem;
  }
}
.block {
  margin-bottom: 1.25rem;
  break-inside: avoid;
  h3 {
    font-size: 1.05rem;
    margin-bottom: 0.4rem;
  }
  ol {
    margin: 0;
    padding-left: 1.3rem;
    li {
      margin-bottom: 0.3rem;
    }
  }
}
.answers {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.92rem;
  th,
  td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }
  thead th {
    background: var(--surface-2);
    font-weight: 600;
  }
  tbody th {
    font-weight: 600;
    white-space: nowrap;
  }
}
@media print {
  .parent-sheet {
    break-before: page;
    page-break-before: always;
    margin: 0;
    border: 1.5pt solid #7fa387;
    background: #fff;
    font-size: 11pt;
  }
}
</style>
