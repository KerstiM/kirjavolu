<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ArrowLeft, Download, FileQuestion, Printer, Plus } from 'lucide-vue-next'
import type { CertificateStyle, Decoration, GeneratedItem, PrintableLayout } from '../../domain/models'
import { EMPTY_DECORATION } from '../../domain/models'
import { computeGrid } from '../../domain/puzzleGrid'
import { useStoredImage } from '../../composables/useStoredImage'
import DecorationPanel from './decoration/DecorationPanel.vue'
import PosterBoard from './poster/PosterBoard.vue'
import MiniSheet from './mini/MiniSheet.vue'
import { buildAudience } from '../../domain/generators/audience'
import { formatDayMonth } from '../../domain/text/estonian'
import BaseButton from '../../components/ui/BaseButton.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import { useGenerator } from '../../composables/useGenerator'
import { contentToPlainText, downloadText, fileNameFor } from '../../utils/exportText'
import { useCreationsStore } from './creationsStore'
import PrintableItem from './PrintableItem.vue'
import ParentSheet from './ParentSheet.vue'

const props = defineProps<{ id: string }>()
const store = useCreationsStore()
const generator = useGenerator()

const content = computed(() => store.byId(props.id))
const busyItem = ref<string | null>(null)
const status = ref('')
let statusTimer: ReturnType<typeof setTimeout> | undefined
function announce(message: string): void {
  status.value = message
  clearTimeout(statusTimer)
  statusTimer = setTimeout(() => (status.value = ''), 3500)
}

const layoutOptions: { value: PrintableLayout; label: string }[] = [
  { value: 'page', label: 'Terve leht' },
  { value: 'half', label: 'Pool lehte' },
  { value: 'cards', label: 'Kaardid (4 lehel)' },
  { value: 'poster', label: 'Pusleplakat' },
  { value: 'mini', label: 'Väikelapse kaardid' },
]
const layout = computed({
  get: () => content.value?.layout ?? 'page',
  set: (value: PrintableLayout) => store.setLayout(props.id, value),
})
const certificateStyle = computed<CertificateStyle | undefined>(() =>
  content.value?.request.contentType === 'certificate' ? content.value.request.options.style : undefined,
)
const decoration = computed<Decoration>(() => ({ ...EMPTY_DECORATION, ...content.value?.decoration }))
const imageUrl = useStoredImage(() => decoration.value.image?.id)
const isPoster = computed(() => layout.value === 'poster')
const isMini = computed(() => layout.value === 'mini')
// Capital letters by default when the youngest reader is still learning to read.
const uppercase = computed(
  () =>
    decoration.value.uppercase ??
    (content.value ? buildAudience(content.value.request.children).band !== 'older' : false),
)
const overflowCount = ref(0)
const posterTitle = computed(() =>
  content.value ? `${content.value.request.children.map((child) => child.name).join(', ')} · ${content.value.title}` : '',
)
const posterLabels = computed(() =>
  (content.value?.items ?? []).map((item) => (item.date ? formatDayMonth(item.date) : item.label)),
)
// The small pieces under each item are not needed on the poster: the cards are the pieces.
const puzzle = computed(() => {
  const image = decoration.value.image
  if (isPoster.value || !decoration.value.puzzle || !image || !imageUrl.value || !content.value) return null
  return { imageUrl: imageUrl.value, grid: computeGrid(content.value.items.length, image.width / image.height) }
})
// Smaller pieces on cards so four still fit on one A4 page.
const pieceMaxCm = computed(() => (layout.value === 'cards' ? 5 : layout.value === 'half' ? 6 : 8))
const hasParentMaterial = computed(
  () => (content.value?.instructions.length ?? 0) > 0 || !!puzzle.value || isPoster.value,
)

function setDecoration(next: Decoration): void {
  store.setDecoration(props.id, next)
}

function save(item: GeneratedItem, patch: Pick<GeneratedItem, 'heading' | 'body' | 'signature'>): void {
  store.editItem(props.id, item.id, patch)
  announce('Muudatus salvestatud.')
}

async function regenerate(index: number): Promise<void> {
  const current = content.value
  const item = current?.items[index]
  if (!current || !item) return
  busyItem.value = item.id
  try {
    const next = await generator.regenerateItem(current, index)
    if (next.body === item.body) {
      announce('Sellele osale teist varianti ei leitud. Muuda teksti käsitsi.')
    } else {
      store.updateItem(props.id, next)
      announce(`${item.label}: uus variant loodud.`)
    }
  } finally {
    busyItem.value = null
  }
}

type PrintMode = 'all' | 'child' | 'parent'
function cleanupPrint(): void {
  document.body.classList.remove('print-all', 'print-child', 'print-parent')
}
function print(mode: PrintMode): void {
  cleanupPrint()
  document.body.classList.add(`print-${mode}`)
  window.addEventListener('afterprint', cleanupPrint, { once: true })
  window.print()
}
onBeforeUnmount(() => {
  cleanupPrint()
  clearTimeout(statusTimer)
})

function exportText(): void {
  if (!content.value) return
  downloadText(contentToPlainText(content.value), fileNameFor(content.value.title))
}
</script>

<template>
  <div v-if="!content" class="container section">
    <EmptyState :icon="FileQuestion" title="Seda loomingut ei leitud" text="See võis olla kustutatud või loodud teises brauseris.">
      <BaseButton to="/loo"><Plus aria-hidden="true" /> Loo uus</BaseButton>
      <BaseButton to="/" variant="secondary">Avalehele</BaseButton>
    </EmptyState>
  </div>

  <div v-else class="preview">
    <div class="toolbar no-print">
      <div class="container toolbar__inner">
        <div class="toolbar__title">
          <BaseButton to="/" variant="ghost" size="sm" aria-label="Tagasi avalehele"><ArrowLeft aria-hidden="true" /></BaseButton>
          <div>
            <h1>{{ content.title }}</h1>
            <p>{{ content.subtitle }}</p>
          </div>
        </div>
        <div class="toolbar__actions">
          <BaseButton variant="secondary" size="sm" @click="exportText"><Download aria-hidden="true" /> Tekstifail</BaseButton>
          <BaseButton size="sm" @click="print('all')"><Printer aria-hidden="true" /> Prindi / PDF</BaseButton>
        </div>
      </div>
    </div>

    <div class="container preview__body">
      <aside class="controls no-print" aria-label="Eelvaate seaded">
        <SegmentedControl v-model="layout" name="layout" label="Prindi paigutus" :options="layoutOptions" />
        <div class="controls__print">
          <span class="controls__label">Prindi eraldi</span>
          <BaseButton variant="secondary" size="sm" @click="print('child')">Ainult lapsele</BaseButton>
          <BaseButton v-if="hasParentMaterial" variant="secondary" size="sm" @click="print('parent')">Lapsevanema leht</BaseButton>
        </div>
        <label class="check controls__upper">
          <input type="checkbox" :checked="uppercase" @change="setDecoration({ ...decoration, uppercase: !uppercase })" />
          <span>Trükitähed (suured tähed alles lugema õppijale)</span>
        </label>
        <p v-if="isPoster" class="controls__note">
          Pusleplakat: kaardid on tükid, mis lõigatakse lahti ja pannakse lõpuks kokku. Tekstide muutmiseks vali paigutus
          „Terve leht“.
        </p>
        <p v-if="isMini" class="controls__note">
          Väikelapse kaardid: 12 kaarti lehel, lõika mööda katkendjooni lahti. Tekstide muutmiseks vali paigutus „Terve leht“.
        </p>
        <p v-if="(isPoster || isMini) && overflowCount > 0" class="controls__warn" role="status">
          {{ overflowCount }} kaardil on tekst liiga pikk. Lühenda neid paigutuses „Terve leht“.
        </p>
        <p class="controls__note">
          PDF-i saamiseks vali printimisaknas „Salvesta PDF-ina“. {{ content.generator.label }}.
        </p>
      </aside>

      <DecorationPanel
        :decoration="decoration"
        :occasion-id="content.request.occasionId"
        :item-count="content.items.length"
        :image-url="imageUrl"
        :poster="isPoster"
        @update="setDecoration"
      />

      <p class="visually-hidden" role="status" aria-live="polite">{{ status }}</p>
      <p v-if="status" class="toast no-print" aria-hidden="true">{{ status }}</p>

      <div v-if="isPoster" class="child-sheet print-root">
        <PosterBoard
          :items="content.items"
          :occasion-id="content.request.occasionId"
          :title="posterTitle"
          :image-url="decoration.image ? imageUrl : null"
          :pattern="decoration.pattern"
          :uppercase="uppercase"
          @overflow-count="(count) => (overflowCount = count)"
        />
      </div>
      <div v-else-if="isMini" class="child-sheet print-root">
        <MiniSheet
          :items="content.items"
          :title="posterTitle"
          :uppercase="uppercase"
          @overflow-count="(count) => (overflowCount = count)"
        />
      </div>
      <div v-else class="child-sheet print-root" :class="`sheet--${layout}`">
        <PrintableItem
          v-for="(item, index) in content.items"
          :key="item.id"
          :item="item"
          :certificate-style="certificateStyle"
          :busy="busyItem === item.id"
          :pattern="decoration.pattern"
          :ink-saver="decoration.inkSaver"
          :background-url="decoration.imageAsBackground ? imageUrl : null"
          :background-opacity="decoration.imageOpacity"
          :uppercase="uppercase"
          :piece="puzzle ? { ...puzzle, index, maxCm: pieceMaxCm } : null"
          @save="(patch) => save(item, patch)"
          @regenerate="regenerate(index)"
        />
      </div>

      <ParentSheet
        v-if="hasParentMaterial"
        :content="content"
        :puzzle="puzzle"
        :poster-labels="isPoster ? posterLabels : null"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  position: sticky;
  top: 4rem;
  z-index: 10;
  background: rgba(251, 247, 241, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.toolbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-block: 0.75rem;
}
.toolbar__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  h1 {
    font-size: 1.35rem;
    margin: 0;
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--ink-soft);
  }
}
.toolbar__actions {
  display: flex;
  gap: 0.5rem;
}
.preview__body {
  padding-block: 1.5rem 3rem;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.controls__print {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.controls__label {
  width: 100%;
  font-weight: 600;
  font-size: 0.95rem;
}
.controls__warn {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.85rem;
  color: var(--danger);
}
.controls__upper {
  align-self: center;
}
.controls__note {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.toast {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  margin: 0;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font-size: 0.9rem;
  box-shadow: var(--shadow);
}

.child-sheet {
  display: grid;
  gap: 1.25rem;
}
.sheet--page {
  max-width: 720px;
  margin-inline: auto;
  :deep(.paper) {
    min-height: 34rem;
  }
}
.sheet--half {
  max-width: 720px;
  margin-inline: auto;
}
.sheet--cards {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
}

@media print {
  .preview__body {
    padding: 0;
    width: auto;
  }
  .child-sheet {
    display: block;
    max-width: none;
  }
  .sheet--page :deep(.paper) {
    min-height: 255mm;
    break-after: page;
    page-break-after: always;
  }
  .sheet--page :deep(.paper:last-child) {
    break-after: auto;
    page-break-after: auto;
  }
  .sheet--half :deep(.paper) {
    min-height: 120mm;
    margin-bottom: 8mm;
  }
  .sheet--cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6mm;
    :deep(.paper) {
      min-height: 118mm;
      font-size: 11pt;
    }
    :deep(.paper__body p) {
      font-size: 11pt;
    }
    :deep(.paper__heading) {
      font-size: 15pt;
    }
  }
}
</style>
