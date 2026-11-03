<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, FileQuestion, Printer, Plus, UsersRound } from 'lucide-vue-next'
import type { CardFit, CertificateStyle, ChildProfile, Decoration, GeneralOptions, GeneratedContent, GeneratedItem, GenerationRequest, PrintableLayout } from '../../domain/models'
import { EMPTY_DECORATION, sheetBackground } from '../../domain/models'
import { computeGrid } from '../../domain/puzzleGrid'
import { computePoster, LARGE_CARD_CHARS } from '../../domain/posterLayout'
import { useStoredImage, useStoredImages } from '../../composables/useStoredImage'
import DecorationPanel from './decoration/DecorationPanel.vue'
import ChildBackgrounds from './decoration/ChildBackgrounds.vue'
import PosterBoard from './poster/PosterBoard.vue'
import MiniSheet from './mini/MiniSheet.vue'
import ItemEditorDialog from './ItemEditorDialog.vue'
import { ageBand, buildAudience, usesSmallCards } from '../../domain/generators/audience'
import { formatDayMonth, namesInCase } from '../../domain/text/estonian'
import BaseButton from '../../components/ui/BaseButton.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import { useGenerator } from '../../composables/useGenerator'
import { GenerationError } from '../../domain/generators/templateGenerator'
import { contentToPlainText, downloadText, fileNameFor } from '../../utils/exportText'
import { useCreationsStore } from './creationsStore'
import PrintableItem from './PrintableItem.vue'
import ParentSheet from './ParentSheet.vue'
import CustomizePanel from './CustomizePanel.vue'
import PassOfferCard from '../pass/PassOfferCard.vue'
import { AI_SERIES_GENERATOR, FIX_ERROR_TEXTS, LettersRequestError, requestLetterFix, requestStoryPageFix } from '../pass/passLetters'
import AiStoryCard from './AiStoryCard.vue'
import { loadPass, type SeasonPass } from '../pass/seasonPass'
import { useChildrenStore } from '../children/childrenStore'
import EnvelopeReveal from './EnvelopeReveal.vue'
import { track } from '../../app/analytics'
import { DESIGN_KEY, designPath, type Design } from '../../components/brand/design'

/** "new" at /uus-disain/looming/…: the same preview in the new design, tried out next to the current one. */
const props = withDefaults(defineProps<{ id: string; design?: Design }>(), { design: 'new' })
provide(DESIGN_KEY, props.design)
const store = useCreationsStore()
const generator = useGenerator()

const content = computed(() => store.byId(props.id))
// AI letters or stories from the Jõulupass: the template engine must not write over them.
const aiWritten = computed(() => content.value?.generator.id === AI_SERIES_GENERATOR)

// "Paranda AI-ga" in the editor: with this browser's Jõulupass, one fix per rewritten letter.
const children = useChildrenStore()
const pass = ref(loadPass())
const passUsable = computed(() => !!pass.value && new Date(pass.value.validUntil) > new Date())
const aiNote = computed(() => {
  if (!aiWritten.value) return undefined
  if (!passUsable.value) return 'Päkapikult muudatust paludes kulub Jõulupassist üks muudatus. Sisesta selleks oma kood lehel „Jõulupass“.'
  return `Kulub 1 päkapiku muudatus, alles on ${pass.value?.fixesLeft ?? 30}.`
})
async function fixWithAi(wish: string): Promise<Pick<GeneratedItem, 'heading' | 'body' | 'signature'>> {
  const current = content.value
  const code = pass.value?.code
  if (!current || !code || !current.request.children.length) throw new Error(FIX_ERROR_TEXTS.failed)
  // The profiles as they are now, so what the parent added after the texts were written counts too.
  const profiles = current.request.children.map((snapshot) => children.byId(snapshot.id) ?? snapshot)
  try {
    if (current.request.contentType === 'story') {
      const item = current.items[editingIndex.value]
      const result = await requestStoryPageFix(code, current, profiles, editingIndex.value, wish)
      pass.value = result.pass
      return { heading: item?.heading ?? '', body: result.body, signature: item?.signature }
    }
    const result = await requestLetterFix(code, profiles[0]!, current.items, editingIndex.value, wish)
    pass.value = result.pass
    return result.letter
  } catch (error) {
    throw new Error(FIX_ERROR_TEXTS[error instanceof LettersRequestError ? error.reason : 'failed'])
  }
}
function storyWritten(next: GeneratedContent, spent: SeasonPass): void {
  store.applyChoices(props.id, next)
  pass.value = spent
  announce('Päkapikk kirjutas loo valmis.')
}
// Counted once per opened creation, not again when its choices change.
watch(
  () => props.id,
  () => {
    const current = content.value
    if (!current) return
    track('preview_shown', {
      type: current.request.contentType,
      occasion: current.request.occasionId,
      items: current.items.length,
      children: current.request.children.length,
    })
  },
  { immediate: true },
)
// Straight from the wizard the creation arrives in an envelope; a reload or a later visit skips it.
const route = useRoute()
const router = useRouter()
const revealing = computed(() => !!content.value && route.query.uus === '1')
function endReveal(): void {
  const { uus: _, ...query } = route.query
  router.replace({ query })
}

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
/** Long letters go on large poster cards: the poster takes more sheets, the text is never cut. */
const longLetters = computed(() => {
  const request = content.value?.request
  return request?.contentType === 'letter' && request.general.length === 'long' && !allToddlers.value
})
const posterLarge = computed(() => cardFit.value === 'larger' || longLetters.value)
/** Cards of one child's poster (each child of a family has their own). */
const posterCount = computed(() => groups.value.find((group) => groupLayout(group) === 'poster')?.entries.length ?? content.value?.items.length ?? 0)
/** The poster stays in the list; it is only off when a letter would not fit even a large card. */
const posterFits = computed(() => {
  const current = content.value
  if (!current) return true
  const childOf = (item: GeneratedItem) =>
    current.request.children.find((child) => child.id === item.childId) ?? current.request.children[0]
  return current.items.every((item) => {
    const child = childOf(item)
    if (!child || usesSmallCards(child)) return true
    return item.body.length <= LARGE_CARD_CHARS[ageBand(child) === 'older' ? 'older' : 'young']
  })
})
/** One choice for how the letters go on paper; the poster only for a series. */
const printOptions_ = computed<{ value: PrintableLayout; label: string; disabled?: boolean }[]>(() => {
  const current = content.value
  const letters = current?.request.contentType === 'letter'
  const series = (current?.items.length ?? 0) >= 3
  return [
    { value: 'cards', label: letters ? 'Kaardid sussi sisse' : 'Kaardid' },
    { value: 'half', label: 'Pool lehte' },
    { value: 'page', label: 'Terve leht' },
    ...(series || layout.value === 'poster' ? [{ value: 'poster' as const, label: cardLabel.value, disabled: !posterFits.value }] : []),
  ]
})
const presetHint = computed(() => {
  if (layout.value === 'cards') return 'Neli kaarti A4 lehel. Lõika lahti ja pane igal õhtul üks kaart sussi sisse.'
  if (layout.value === 'half') return 'Kaks kirja A4 lehel. Lõika pooleks.'
  if (layout.value === 'poster') {
    if (allToddlers.value) return 'Väikelapse kaardid: 12 kaarti lehel, suur tekst ja loomanägu.'
    const pages = computePoster(posterCount.value, { large: posterLarge.value }).pages
    return `Kaardid on pusletükid: lõika lahti, anna üks päevas ja lõpuks pane kokku terveks pildiks. Plakat tuleb ${pages} A4 lehele${posterLarge.value ? ', kaardid on suuremad' : ''}.`
  }
  return 'Iga kiri omal lehel – sobib ümbrikusse või voldituna sussi sisse.'
})
const rawLayout = computed(() => content.value?.layout ?? 'page')
const layout = computed({
  get: () => (rawLayout.value === 'mini' ? 'poster' : rawLayout.value),
  set: (value: PrintableLayout) => store.setLayout(props.id, value),
})
// Letters made long while on the poster move to the slipper cards.
watch(posterFits, (fits) => {
  if (!fits && layout.value === 'poster') layout.value = 'cards'
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
/** Each child's sheets may have their own picture or no background at all. */
function groupBackground(group: ItemGroup) {
  return sheetBackground(decoration.value, group.child?.id)
}
const childImageIds = computed(() =>
  Object.values(decoration.value.childDecorations ?? {}).flatMap((own) => (own.image ? [own.image.id] : [])),
)
const childImageUrls = useStoredImages(() => childImageIds.value)
function groupImageUrl(group: ItemGroup): string | null {
  const image = groupBackground(group).image
  if (!image) return null
  return image.id === decoration.value.image?.id ? imageUrl.value : (childImageUrls.value[image.id] ?? null)
}
const childRows = computed(() =>
  groups.value.flatMap((group) => (group.child ? [{ id: group.child.id, name: group.child.name, mini: groupLayout(group) === 'mini' }] : [])),
)
const anyChildImage = computed(() =>
  groups.value.some((group) => {
    const image = groupBackground(group).image
    return !!image && image.id !== decoration.value.image?.id
  }),
)
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
  // Long letters already get the large cards.
  ...(isPoster.value && !longLetters.value ? [{ value: 'larger' as const, label: 'Suuremad kaardid' }] : []),
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

// New choices from the panel beside the preview: the texts are written again with the same seed.
const updating = ref(false)
const choiceErrors = ref<string[]>([])
let latestChange = 0
async function applyChoices(choices: { general: GeneralOptions; options: GeneratedContent['request']['options'] }): Promise<void> {
  const current = content.value
  if (!current) return
  const request = { ...current.request, general: choices.general, options: choices.options } as GenerationRequest
  const ticket = ++latestChange
  updating.value = true
  try {
    const next = await generator.generate(request)
    // A newer change is already on its way.
    if (ticket !== latestChange) return
    store.applyChoices(props.id, next)
    choiceErrors.value = []
    announce('Eelvaade uuendatud.')
  } catch (error) {
    if (ticket === latestChange) {
      choiceErrors.value = error instanceof GenerationError ? error.errors : ['Midagi läks valesti. Proovi uuesti.']
    }
  } finally {
    if (ticket === latestChange) updating.value = false
  }
}

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
  if (content.value) track('print_clicked', { type: content.value.request.contentType, layout: rawLayout.value, mode })
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
  <div v-if="!content" class="container section" :class="{ 'design-new': design === 'new' }">
    <EmptyState :icon="FileQuestion" title="Seda loomingut ei leitud" text="See võis olla kustutatud või loodud teises brauseris.">
      <BaseButton :to="designPath(design, '/loo')"><Plus aria-hidden="true" /> Loo uus</BaseButton>
      <BaseButton :to="designPath(design, '/')" variant="secondary">Avalehele</BaseButton>
    </EmptyState>
  </div>

  <div v-else class="preview" :class="{ 'preview--new design-new': design === 'new' }">
    <EnvelopeReveal v-if="revealing && content" :content="content" @done="endReveal" />
    <div class="toolbar no-print">
      <div class="container toolbar__inner">
        <div class="toolbar__title">
          <BaseButton :to="designPath(design, '/')" variant="ghost" size="sm" aria-label="Tagasi avalehele"><ArrowLeft aria-hidden="true" /></BaseButton>
          <div>
            <h1>{{ content.title }}</h1>
            <p>{{ content.subtitle }}</p>
          </div>
        </div>
        <div class="toolbar__actions">
          <BaseButton :to="{ path: designPath(design, '/loo'), query: { muuda: content.id } }" variant="secondary" size="sm"><UsersRound aria-hidden="true" /> <span class="toolbar__label">Lapsed ja tüüp</span></BaseButton>
          <BaseButton variant="secondary" size="sm" @click="exportText"><Download aria-hidden="true" /> <span class="toolbar__label">Tekstifail</span></BaseButton>
          <BaseButton size="sm" @click="print(printOptions.some((o) => o.value === printMode) ? printMode : 'all')"><Printer aria-hidden="true" /> Prindi / PDF</BaseButton>
        </div>
      </div>
    </div>

    <div class="container preview__body">
      <aside class="side no-print" aria-label="Kohanda ja prindi">
        <p v-if="aiWritten" class="ai-note">
          <template v-if="content.request.contentType === 'story'">
            Selle loo kirjutas päkapikk just {{ namesInCase(content.request.children, 'allative') }}. Iga lehekülge saad muuta nupuga „Muuda“, seal saab ka päkapikult muudatust paluda.
          </template>
          <template v-else>Need kirjad kirjutas päkapikk Tuduja just {{ namesInCase(content.request.children, 'allative') }}. Iga kirja saad muuta nupuga „Muuda“, seal saab ka päkapikult muudatust paluda.</template>
        </p>
        <CustomizePanel v-else :content="content" :busy="updating" :errors="choiceErrors" @change="applyChoices" />
        <PassOfferCard
          v-if="!aiWritten && design === 'new' && content.request.contentType === 'letter' && content.request.occasionId === 'christmas'"
          :content="content"
        />
        <!-- After the choices: they are what the AI story is written from. -->
        <AiStoryCard
          v-if="!aiWritten && design === 'new' && content.request.contentType === 'story'"
          :content="content"
          :pass="pass"
          :busy-elsewhere="updating"
          @written="storyWritten"
        />

        <section class="print-panel" aria-labelledby="print-title">
          <h2 id="print-title" class="print-panel__title">Printimine</h2>
          <SegmentedControl v-model="layout" name="print-preset" label="Kuidas prindid?" :options="printOptions_" :hint="presetHint" />
          <p v-if="!posterFits && !allToddlers" class="controls__note">
            Pusleplakat pole praegu valitav: mõni kiri on plakatikaardi jaoks liiga pikk. Lühenda seda nupuga „Muuda“ või vali
            kohandamise all lühem kirjade pikkus.
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
          <p class="controls__note">Teksti muutmiseks vajuta kaardil „Muuda“. PDF-i saamiseks vali printimisaknas „Salvesta PDF-ina“.</p>

          <details class="more">
            <summary class="more__summary">Rohkem valikuid <span class="more__what">mida printida, trükitähed</span></summary>
            <div class="more__body">
              <div class="controls">
                <SegmentedControl v-model="printMode" name="print-mode" label="Mida printida" :options="printOptions" />
                <label class="check controls__upper">
                  <input type="checkbox" :checked="uppercase" @change="setDecoration({ ...decoration, uppercase: !uppercase })" />
                  <span>Trükitähed (suured tähed alles lugema õppijale)</span>
                </label>
                <p class="controls__note">
                  <template v-if="isPoster">Pusleplakati kaardid on tükid, mis lõigatakse lahti ja pannakse lõpuks kokku. </template>
                  <template v-if="isMini">Väikelapse kaarte on 12 lehel, lõika mööda katkendjooni. </template>
                  {{ content.generator.label }}.
                </p>
              </div>
            </div>
          </details>
        </section>

        <!-- Background and own picture are what parents look for, so they are not folded away. -->
        <DecorationPanel
          :decoration="decoration"
          :occasion-id="content.request.occasionId"
          :item-count="content.items.length"
          :image-url="imageUrl"
          :poster="isPoster"
          :mini="isMini"
          :child-image="anyChildImage"
          @update="setDecoration"
        />
        <ChildBackgrounds
          v-if="childRows.length > 1"
          :children="childRows"
          :decoration="decoration"
          :image-urls="childImageUrls"
          @update="setDecoration"
        />
      </aside>

      <div class="sheets">
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
            :image-url="groupImageUrl(group)"
            :image-opacity="decoration.cardImageOpacity ?? 1"
            :pattern="groupBackground(group).pattern"
            :art="groupBackground(group).posterArt"
            :large="posterLarge"
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
            :background-url="groupImageUrl(group)"
            :background-opacity="decoration.cardImageOpacity ?? 1"
            :pattern="groupBackground(group).pattern"
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
              :pattern="groupBackground(group).pattern"
              :ink-saver="decoration.inkSaver"
              :background-url="groupImageUrl(group)"
              :background-opacity="decoration.imageOpacity"
              :uppercase="groupUppercase(group)"
              :piece="puzzle ? { ...puzzle, index: entry.index, maxCm: pieceMaxCm } : null"
              :no-variants="aiWritten"
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
          :no-variants="aiWritten"
          :ai-fix="aiWritten && passUsable ? fixWithAi : undefined"
          :ai-note="aiNote"
          @save="saveFromDialog"
          @regenerate="regenerate(editingIndex)"
          @close="editingId = null"
        />

        <ParentSheet
          v-if="hasParentMaterial"
          :content="content"
          :puzzle="puzzle"
          :poster-labels="posterLabels.length > 0 ? posterLabels : null"
          :poster-large="posterLarge"
        />
      </div>
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
// Choices beside the letters on a wide screen; on a phone they come first, folded.
.side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
// The panel scrolls on its own on wide screens; its cards keep their height instead of being squeezed.
.side > * {
  flex-shrink: 0;
}
@media (min-width: 1024px) {
  .preview__body,
  .toolbar__inner {
    width: min(1360px, 100% - 2rem);
  }
  .preview__body {
    display: grid;
    grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
    align-items: start;
    gap: 1.75rem;
  }
  .side {
    position: sticky;
    top: 10rem;
    max-height: calc(100vh - 11rem);
    overflow-y: auto;
    margin-bottom: 0;
    padding-right: 0.25rem;
    overscroll-behavior: contain;
  }
}
.sheets {
  min-width: 0;
}
.ai-note {
  margin: 0;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-size: 0.92rem;
}
.print-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.print-panel__title {
  font-size: 1.1rem;
  margin: 0;
}
.more {
  border-top: 1px solid var(--line);
  padding-top: 0.5rem;
}
.more__summary {
  cursor: pointer;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-weight: 600;
}
.more__what {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.more__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.75rem;
  // The decoration panels have their own frames; inside the print panel they sit flat.
  :deep(.decor),
  :deep(.kids) {
    margin: 0;
    padding: 0;
    border: 0;
  }
}
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

// New design: a cream desk with the panels as luggage tags, the print panel with an airmail edge.
.preview--new {
  .toolbar {
    background: rgba(253, 246, 236, 0.94);
    border-bottom: 2px dashed #ecd9bf;
  }
  .toolbar__title h1 {
    font-weight: 600;
    letter-spacing: -0.015em;
  }
  .print-panel,
  :deep(.customize) {
    border: 2px solid #f0e2cf;
    border-radius: 14px;
    background: #fffdf8;
  }
  .print-panel {
    position: relative;
    overflow: hidden;
    padding-top: 1.4rem;
    &::before {
      content: '';
      position: absolute;
      inset: 0 0 auto;
      height: 6px;
      background: repeating-linear-gradient(
        -45deg,
        #e8836b 0 10px,
        #fffdf8 10px 15px,
        #7c6bb8 15px 25px,
        #fffdf8 25px 30px
      );
    }
  }
  .more {
    border-top: 2px dashed #ecd9bf;
  }
  .child-group__title {
    font-family: var(--font-print);
    font-weight: 600;
  }
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
    display: block;
  }
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
