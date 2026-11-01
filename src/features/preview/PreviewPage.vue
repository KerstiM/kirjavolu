<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ArrowLeft, Download, FileQuestion, Printer, Plus, SlidersHorizontal } from 'lucide-vue-next'
import type { CardFit, CertificateStyle, ChildProfile, Decoration, GeneratedItem, PrintableLayout } from '../../domain/models'
import { EMPTY_DECORATION } from '../../domain/models'
import { computeGrid } from '../../domain/puzzleGrid'
import { useStoredImage } from '../../composables/useStoredImage'
import DecorationPanel from './decoration/DecorationPanel.vue'
import PosterBoard from './poster/PosterBoard.vue'
import MiniSheet from './mini/MiniSheet.vue'
import ItemEditorDialog from './ItemEditorDialog.vue'
import { ageBand, buildAudience, usesSmallCards } from '../../domain/generators/audience'
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

const toddlers = computed(() => content.value?.request.children.filter(usesSmallCards).length ?? 0)
const allToddlers = computed(() => !!content.value && toddlers.value === content.value.request.children.length)
/**
 * Puzzle poster and toddler cards are one choice: everyone gets the card layout
 * that suits their age, so the label tells what this family will get.
 */
const cardLabel = computed(() => {
  if (allToddlers.value) return 'Väikelapse kaardid'
  return toddlers.value > 0 ? 'Plakat ja väikelapse kaardid' : 'Pusleplakat'
})
const layoutOptions = computed<{ value: PrintableLayout; label: string }[]>(() => [
  { value: 'page', label: 'Terve leht' },
  { value: 'half', label: 'Pool lehte' },
  { value: 'cards', label: 'Kaardid (4 lehel)' },
  { value: 'poster', label: cardLabel.value },
])
const rawLayout = computed(() => content.value?.layout ?? 'page')
const layout = computed({
  get: () => (rawLayout.value === 'mini' ? 'poster' : rawLayout.value),
  set: (value: PrintableLayout) => store.setLayout(props.id, value),
})
const certificateStyle = computed<CertificateStyle | undefined>(() =>
  content.value?.request.contentType === 'certificate' ? content.value.request.options.style : undefined,
)
const decoration = computed<Decoration>(() => ({ ...EMPTY_DECORATION, ...content.value?.decoration }))
const imageUrl = useStoredImage(() => decoration.value.image?.id)
// Capital letters by default when the youngest reader is still learning to read.
const uppercase = computed(
  () =>
    decoration.value.uppercase ??
    (content.value ? buildAudience(content.value.request.children).band !== 'older' : false),
)
interface ItemGroup {
  key: string
  child: ChildProfile | null
  entries: { item: GeneratedItem; index: number }[]
}

/** Linked family series are shown per child; everything else is one group. */
const groups = computed<ItemGroup[]>(() => {
  const current = content.value
  if (!current) return []
  const entries = current.items.map((item, index) => ({ item, index }))
  const childIds = new Set(current.items.map((item) => item.childId).filter(Boolean))
  if (childIds.size < 2) return [{ key: 'all', child: null, entries }]
  return current.request.children
    .filter((child) => childIds.has(child.id))
    .map((child) => ({ key: child.id, child, entries: entries.filter((entry) => entry.item.childId === child.id) }))
})
const childFilter = ref('all')
const filterOptions = computed(() => [
  { value: 'all', label: 'Kõik lapsed' },
  ...groups.value.flatMap((group) => (group.child ? [{ value: group.key, label: group.child.name }] : [])),
])
const visibleGroups = computed(() =>
  childFilter.value === 'all' ? groups.value : groups.value.filter((group) => group.key === childFilter.value),
)

/** Each child gets the card layout that suits them: little ones simple cards, others the poster. */
function groupLayout(group: ItemGroup): PrintableLayout {
  if (layout.value !== 'poster') return layout.value
  const toddler = group.child ? usesSmallCards(group.child) : allToddlers.value
  return toddler ? 'mini' : 'poster'
}
const isPoster = computed(() => groups.value.some((group) => groupLayout(group) === 'poster'))
const isMini = computed(() => groups.value.some((group) => groupLayout(group) === 'mini'))
function groupUppercase(group: ItemGroup): boolean {
  if (decoration.value.uppercase !== undefined || !group.child) return uppercase.value
  return ageBand(group.child) !== 'older'
}
function groupTitle(group: ItemGroup): string {
  return group.child && content.value ? `${group.child.name} · ${content.value.title}` : posterTitle.value
}

const overflowByGroup = ref<Record<string, number>>({})
const overflowCount = computed(() => Object.values(overflowByGroup.value).reduce((sum, n) => sum + n, 0))
function setOverflow(key: string, count: number): void {
  overflowByGroup.value = { ...overflowByGroup.value, [key]: count }
}

/** Long texts: the parent decides between bigger poster cards and smaller letters. */
const cardFit = computed({
  get: (): CardFit => decoration.value.cardFit ?? 'normal',
  set: (value: CardFit) => setDecoration({ ...decoration.value, cardFit: value }),
})
const cardFitOptions = computed<{ value: CardFit; label: string }[]>(() => [
  { value: 'normal', label: 'Tavaline' },
  ...(isPoster.value ? [{ value: 'larger' as const, label: 'Suuremad kaardid' }] : []),
  { value: 'smaller', label: 'Väiksem tekst' },
])
const showCardFit = computed(() => (isPoster.value || isMini.value) && (overflowCount.value > 0 || cardFit.value !== 'normal'))
const cardFitHint = computed(() => {
  if (cardFit.value === 'larger') return 'Plakat tuleb rohkematele lehtedele: kaardid on kõrgemad ja pilt suurem.'
  if (cardFit.value === 'smaller') return 'Pikemate kaartide tekst läheb väiksemaks, kuni see mahub.'
  return 'Vali, kas kaardid lähevad suuremaks või tekst väiksemaks. Või lühenda teksti kaardil „Muuda“.'
})

const posterTitle = computed(() =>
  content.value ? `${content.value.request.children.map((child) => child.name).join(', ')} · ${content.value.title}` : '',
)
const posterLabels = computed(() => {
  const group = groups.value.find((candidate) => groupLayout(candidate) === 'poster')
  return (group?.entries ?? []).map(({ item }) => (item.date ? formatDayMonth(item.date) : item.label))
})
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

// Every card is edited in the same dialog.
const editingId = ref<string | null>(null)
const editingIndex = computed(() => content.value?.items.findIndex((item) => item.id === editingId.value) ?? -1)
const editingItem = computed(() => (editingIndex.value >= 0 ? content.value?.items[editingIndex.value] : undefined))
const editingTitle = computed(() => {
  const item = editingItem.value
  if (!item) return ''
  const day = item.date ? formatDayMonth(item.date) : item.label
  return item.forChild && item.childId ? `${item.forChild}, ${day}` : day
})
function openEditor(itemId: string): void {
  editingId.value = itemId
}
function saveFromDialog(patch: Pick<GeneratedItem, 'heading' | 'body' | 'signature'>): void {
  const item = editingItem.value
  if (item) save(item, patch)
  editingId.value = null
}

function save(item: GeneratedItem, patch: Pick<GeneratedItem, 'heading' | 'body' | 'signature'>): void {
  store.editItem(props.id, item.id, patch)
  announce('Muudatus salvestatud.')
}

async function regenerate(index: number): Promise<void> {
  const current = content.value
  const item = current?.items[index]
  if (!current || !item) return
  // A new variant replaces the text, so hand-made changes would be lost.
  if (item.edited && !window.confirm('Oled seda teksti käsitsi muutnud. Uus variant asendab sinu muudatused. Jätkan?')) return
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
const printMode = ref<PrintMode>('all')
const printOptions = computed<{ value: PrintMode; label: string }[]>(() => [
  { value: 'all', label: 'Kõik' },
  { value: 'child', label: 'Ainult lapsele' },
  ...(hasParentMaterial.value ? [{ value: 'parent' as const, label: 'Lapsevanema leht' }] : []),
])
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
          <BaseButton :to="{ path: '/loo', query: { muuda: content.id } }" variant="secondary" size="sm"><SlidersHorizontal aria-hidden="true" /> <span class="toolbar__label">Muuda valikuid</span></BaseButton>
          <BaseButton variant="secondary" size="sm" @click="exportText"><Download aria-hidden="true" /> <span class="toolbar__label">Tekstifail</span></BaseButton>
          <BaseButton size="sm" @click="print(printOptions.some((o) => o.value === printMode) ? printMode : 'all')"><Printer aria-hidden="true" /> Prindi / PDF</BaseButton>
        </div>
      </div>
    </div>

    <div class="container preview__body">
      <aside class="controls no-print" aria-label="Eelvaate seaded">
        <SegmentedControl v-model="layout" name="layout" label="Prindi paigutus" :options="layoutOptions" />
        <SegmentedControl v-model="printMode" name="print-mode" label="Mida printida" :options="printOptions" />
        <label class="check controls__upper">
          <input type="checkbox" :checked="uppercase" @change="setDecoration({ ...decoration, uppercase: !uppercase })" />
          <span>Trükitähed (suured tähed alles lugema õppijale)</span>
        </label>
        <p class="controls__note">
          <template v-if="isPoster">Pusleplakati kaardid on tükid, mis lõigatakse lahti ja pannakse lõpuks kokku. </template>
          <template v-if="isMini">Väikelapse kaarte on 12 lehel, lõika mööda katkendjooni. </template>
          Teksti muutmiseks vajuta kaardil „Muuda“. PDF-i saamiseks vali printimisaknas „Salvesta PDF-ina“.
        </p>
        <p v-if="(isPoster || isMini) && overflowCount > 0" class="controls__warn" role="status">
          {{ overflowCount }} kaardil on tekst liiga pikk.
        </p>
        <SegmentedControl
          v-if="showCardFit"
          v-model="cardFit"
          name="card-fit"
          label="Pikad tekstid"
          :options="cardFitOptions"
          :hint="cardFitHint"
        />
        <p class="controls__note">{{ content.generator.label }}.</p>
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

      <SegmentedControl
        v-if="groups.length > 1"
        v-model="childFilter"
        class="child-filter no-print"
        name="child-filter"
        label="Näita ja prindi"
        :options="filterOptions"
      />

      <div
        v-for="(group, g) in visibleGroups"
        :key="group.key"
        class="child-sheet print-root"
        :class="[`sheet--${groupLayout(group)}`, { 'child-group--next': g > 0 }]"
      >
        <h2 v-if="group.child" class="child-group__title no-print">{{ group.child.name }}</h2>
        <PosterBoard
          v-if="groupLayout(group) === 'poster'"
          :items="group.entries.map((entry) => entry.item)"
          :occasion-id="content.request.occasionId"
          :title="groupTitle(group)"
          :image-url="decoration.image && decoration.imageAsBackground ? imageUrl : null"
          :pattern="decoration.pattern"
          :art="!!decoration.posterArt"
          :large="cardFit === 'larger'"
          :small-text="cardFit === 'smaller'"
          :uppercase="groupUppercase(group)"
          @overflow-count="(count) => setOverflow(group.key, count)"
          @edit="openEditor"
        />
        <MiniSheet
          v-else-if="groupLayout(group) === 'mini'"
          :items="group.entries.map((entry) => entry.item)"
          :title="groupTitle(group)"
          :uppercase="groupUppercase(group)"
          :small-text="cardFit === 'smaller'"
          @overflow-count="(count) => setOverflow(group.key, count)"
          @edit="openEditor"
        />
        <template v-else>
          <PrintableItem
            v-for="entry in group.entries"
            :key="entry.item.id"
            :item="entry.item"
            :certificate-style="certificateStyle"
            :busy="busyItem === entry.item.id"
            :pattern="decoration.pattern"
            :ink-saver="decoration.inkSaver"
            :background-url="decoration.imageAsBackground ? imageUrl : null"
            :background-opacity="decoration.imageOpacity"
            :uppercase="groupUppercase(group)"
            :piece="puzzle ? { ...puzzle, index: entry.index, maxCm: pieceMaxCm } : null"
            @edit="openEditor(entry.item.id)"
            @regenerate="regenerate(entry.index)"
          />
        </template>
      </div>

      <ItemEditorDialog
        v-if="editingItem"
        :key="`${editingItem.id}-${editingItem.variant}`"
        :item="editingItem"
        :title="editingTitle"
        :busy="busyItem === editingItem.id"
        :fit-hint="layout === 'poster'"
        @save="saveFromDialog"
        @regenerate="regenerate(editingIndex)"
        @close="editingId = null"
      />

      <ParentSheet
        v-if="hasParentMaterial"
        :content="content"
        :puzzle="puzzle"
        :poster-labels="posterLabels.length > 0 ? posterLabels : null"
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
// On a phone the secondary actions keep only their icons, so the bar fits the width.
@media (max-width: 520px) {
  .toolbar__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
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
.child-filter {
  margin-bottom: 1.25rem;
}
.child-group__title {
  font-size: 1.3rem;
  margin: 1.5rem 0 0.75rem;
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
  .child-group--next {
    break-before: page;
    page-break-before: always;
  }
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
