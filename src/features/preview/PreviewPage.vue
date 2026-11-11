<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, FileQuestion, Printer, Plus, UsersRound } from 'lucide-vue-next'
import type { CardFit, CertificateStyle, ChildProfile, Decoration, GeneralOptions, GeneratedContent, GeneratedItem, GenerationRequest, PrintableLayout } from '../../domain/models'
import { EMPTY_DECORATION, sheetBackground } from '../../domain/models'
import { drawnAsFrame } from '../../domain/patterns'
import { computeGrid } from '../../domain/puzzleGrid'
import { PUZZLE_ENABLED } from '../../domain/puzzleAvailability'
import { computePoster, LARGE_CARD_CHARS } from '../../domain/posterLayout'
import { useStoredImage, useStoredImages } from '../../composables/useStoredImage'
import DecorationPanel from './decoration/DecorationPanel.vue'
import PosterBoard from './poster/PosterBoard.vue'
import MiniSheet from './mini/MiniSheet.vue'
import ItemEditorDialog from './ItemEditorDialog.vue'
import { ageBand, buildAudience, languageFor, textLevel, usesSmallCards } from '../../domain/generators/audience'
import { formatDayMonth, namesInCase } from '../../domain/text/estonian'
import BaseButton from '../../components/ui/BaseButton.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import PanelSection from '../../components/ui/PanelSection.vue'
import { useGenerator } from '../../composables/useGenerator'
import { GenerationError } from '../../domain/generators/templateGenerator'
import { contentToPlainText, downloadText, fileNameFor } from '../../utils/exportText'
import { useCreationsStore } from './creationsStore'
import PrintableItem from './PrintableItem.vue'
import { companionFor, companionLine, type CompanionId } from '../../components/brand/companion/companions'
import { fitsSheet, printTextPt, type FitOptions, type FitSheet } from './printFit'
import { useNoVariants } from './useVariants'
import { carryEdits } from './carryEdits'
import ParentSheet from './ParentSheet.vue'
import CustomizePanel from './CustomizePanel.vue'
import PersonalSoon from './PersonalSoon.vue'
import SupportCard from '../support/SupportCard.vue'
import FeedbackCard from '../feedback/FeedbackCard.vue'
import { SUPPORT_ENABLED } from '../support/support'
import PassOfferCard from '../pass/PassOfferCard.vue'
import { AI_SERIES_GENERATOR, FIX_ERROR_TEXTS, LettersRequestError, requestLetterFix, requestStoryPageFix } from '../pass/passLetters'
import AiStoryCard from './AiStoryCard.vue'
import { loadPass, type SeasonPass } from '../pass/seasonPass'
import { PASS_ENABLED } from '../pass/availability'
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
const { noVariantIds, markNone } = useNoVariants(content, computed(() => !aiWritten.value))

// "Paranda AI-ga" in the editor: with this browser's Jõulupass, one fix per rewritten letter.
const children = useChildrenStore()
const pass = ref(loadPass())
const passUsable = computed(() => !!pass.value && new Date(pass.value.validUntil) > new Date())
const aiNote = computed(() => {
  if (!aiWritten.value || !PASS_ENABLED) return undefined
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

const smallCards = (child: ChildProfile) => !!content.value && usesSmallCards(child, content.value.request)
const toddlers = computed(() => content.value?.request.children.filter(smallCards).length ?? 0)
const allToddlers = computed(() => !!content.value && toddlers.value === content.value.request.children.length)
/**
 * Puzzle poster and toddler cards are one choice: everyone gets the card layout
 * that suits their age, so the label tells what this family will get.
 */
const cardLabel = computed(() => {
  if (allToddlers.value || !PUZZLE_ENABLED) return 'Väikelapse kaardid'
  return toddlers.value > 0 ? 'Plakat ja väikelapse kaardid' : 'Pusleplakat'
})
/** Long letters go on large poster cards: the poster takes more sheets, the text is never cut. */
const longLetters = computed(() => {
  const request = content.value?.request
  return request?.contentType === 'letter' && request.general.length === 'long' && !allToddlers.value
})
// Smaller text is a step beyond the large cards, so it keeps them large too.
const posterLarge = computed(() => cardFit.value !== 'normal' || longLetters.value)
/** Cards of one child's poster (each child of a family has their own). */
const posterCount = computed(() => groups.value.find((group) => groupLayout(group) === 'poster')?.entries.length ?? content.value?.items.length ?? 0)
/** The poster stays in the list; it is only off when a letter would not fit even a large card. */
const posterFits = computed(() => {
  const current = content.value
  if (!current) return true
  const childOf = (item: GeneratedItem) =>
    current.request.children.find((child) => child.id === item.childId) ?? current.request.children[0]
  const request = current.request
  return current.items.every((item) => {
    const child = childOf(item)
    if (!child || smallCards(child)) return true
    // The letter's own text decides the card: a six-year-old's rich letters are the older readers' text.
    const band =
      request.contentType === 'letter'
        ? textLevel(child, languageFor(child, request.options, request.general.difficulty), request.general.length).band
        : ageBand(child)
    return item.body.length <= LARGE_CARD_CHARS[band === 'older' ? 'older' : 'young']
  })
})
/** One choice for how the letters go on paper; the poster only for a series. */
const printOptions_ = computed<{ value: PrintableLayout; label: string; disabled?: boolean; reason?: string }[]>(() => {
  const current = content.value
  const letters = current?.request.contentType === 'letter'
  const series = (current?.items.length ?? 0) >= 3
  return [
    { value: 'cards', label: letters ? 'Kaardid sussi sisse' : 'Kaardid', disabled: !cardsFit.value, reason: cardsReason.value },
    { value: 'half', label: 'Pool lehte', disabled: !halfFits.value, reason: halfReason.value },
    { value: 'page', label: 'Terve leht' },
    ...((series || layout.value === 'poster') && (PUZZLE_ENABLED || toddlers.value > 0)
      ? [{ value: 'poster' as const, label: cardLabel.value, disabled: !posterFits.value, reason: posterReason.value }]
      : []),
  ]
})
const cardsReason = computed(
  () => 'Neli kaarti A4-l ei mahuta neid kirju loetava suurusega. Vali pool lehte või terve leht – kiri jääb terveks.',
)
const halfReason = computed(
  () =>
    `${tooLongForHalf.value.length === 1 ? '1 kiri on' : `${tooLongForHalf.value.length} kirja on`} poolele lehele liiga ${tooLongForHalf.value.length === 1 ? 'pikk' : 'pikad'} (${tooLongNames.value}). Vajuta kirja juures „Lühenda“ – üle jääv tekst on punane. Või vali kohandamise all lühem kirjade pikkus.`,
)
const posterReason = computed(
  () => 'Mõni kiri on plakatikaardi jaoks liiga pikk. Lühenda seda nupuga „Muuda“ või vali kohandamise all lühem kirjade pikkus.',
)
const presetHint = computed(() => {
  if (layout.value === 'cards') return 'Neli kaarti A4 lehel. Lõika lahti ja pane igal õhtul üks kaart sussi sisse.'
  if (layout.value === 'half') return 'Kaks kirja A4 lehel. Lõika pooleks.'
  if (layout.value === 'poster') {
    if (allToddlers.value) return 'Väikelapse kaardid: 12 kaarti lehel, suur tekst ja loomanägu.'
    if (!PUZZLE_ENABLED) return 'Väikelapse kaardid: 12 kaarti lehel, suur tekst ja loomanägu. Teiste laste kirjad on igaüks omal lehel.'
    const pages = computePoster(posterCount.value, { large: posterLarge.value }).pages
    return `Kaardid on pusletükid: lõika lahti, anna üks päevas ja lõpuks pane kokku terveks pildiks. Plakat tuleb ${pages} A4 lehele${posterLarge.value ? ', kaardid on suuremad' : ''}.`
  }
  return 'Iga kiri omal lehel – sobib ümbrikusse või voldituna sussi sisse.'
})
// Without the puzzle a creation saved on the poster prints on whole pages (toddlers keep their cards).
const rawLayout = computed(() => {
  const saved = content.value?.layout ?? 'page'
  return saved === 'poster' && !PUZZLE_ENABLED && toddlers.value === 0 ? 'page' : saved
})
const layout = computed({
  get: () => (rawLayout.value === 'mini' ? 'poster' : rawLayout.value),
  set: (value: PrintableLayout) => store.setLayout(props.id, value),
})
// Letters made long while on the poster move to the largest layout they fit: cards, half or whole page.
watch(posterFits, (fits) => {
  if (!fits && layout.value === 'poster') layout.value = cardsFit.value ? 'cards' : halfFits.value ? 'half' : 'page'
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
/** The chosen child, while their own letters are shown; null when everybody's are. */
const filteredGroup = computed(() =>
  childFilter.value === 'all' ? null : (groups.value.find((group) => group.key === childFilter.value) ?? null),
)
// One shared letter (or another child list) has no group for the chosen child: show everybody's
// letters again rather than none.
const visibleGroups = computed(() => (filteredGroup.value ? [filteredGroup.value] : groups.value))
watch(groups, () => {
  if (childFilter.value !== 'all' && !filteredGroup.value) childFilter.value = 'all'
})

/** Each child gets the card layout that suits them: little ones simple cards, others the poster. */
function groupLayout(group: ItemGroup): PrintableLayout {
  if (layout.value !== 'poster') return layout.value
  const toddler = group.child ? smallCards(group.child) : allToddlers.value
  if (toddler) return 'mini'
  return PUZZLE_ENABLED ? 'poster' : 'page'
}
const isPoster = computed(() => groups.value.some((group) => groupLayout(group) === 'poster'))
/**
 * The poster and the toddler cards are laid out as puzzle pieces, in the order they are cut.
 * To read the letters they are shown one after another by date; the sheets as they print are
 * one click away, and are what the printer gets either way.
 */
type View = 'read' | 'print'
const view = ref<View>('read')
const viewOptions: { value: View; label: string }[] = [
  { value: 'read', label: 'Kirjad järjest' },
  { value: 'print', label: 'Nagu prinditult' },
]
const boardLayout = (group: ItemGroup) => ['poster', 'mini'].includes(groupLayout(group))
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
function groupSmaller(group: ItemGroup): boolean {
  const own = group.child ? decoration.value.childDecorations?.[group.child.id]?.textSize : undefined
  return (own ?? decoration.value.textSize) === 'smaller'
}
/** The chosen character, while the letters are long ones: a short letter has no room for it. */
const companionId = computed<CompanionId | null>(() => {
  const request = content.value?.request
  return request?.contentType === 'letter' && request.general.length === 'long' ? (decoration.value.companion ?? null) : null
})
/** What sits under one letter: its own pose and exclamation, greeting the child by name. */
function companionOf(group: ItemGroup, entry: { item: GeneratedItem; index: number }) {
  const sheet = groupLayout(group)
  const request = content.value?.request
  if (!companionId.value || !request || entry.item.kind !== 'letter' || (sheet !== 'half' && sheet !== 'page')) return null
  const child = group.child ?? request.children.find((c) => c.id === entry.item.childId) ?? (request.children.length === 1 ? request.children[0] : undefined)
  const { pose, line } = companionFor(content.value!.id, entry.index)
  return { id: companionId.value, pose, line: companionLine(companionId.value, pose, line, child?.name) }
}
function fitOptions(group: ItemGroup, sheet: FitSheet): FitOptions {
  const background = groupBackground(group)
  const backdrop = !!groupImageUrl(group) || (!!background.pattern && !drawnAsFrame(background.pattern, decoration.value.inkSaver))
  return { sheet, uppercase: groupUppercase(group), backdrop, smaller: groupSmaller(group), companion: !!companionId.value && sheet !== 'cards' }
}
/** Long letters get a smaller print text, so that they fit their half or whole page. */
function printPt(group: ItemGroup, item: GeneratedItem): number | undefined {
  const sheet = groupLayout(group)
  if ((sheet !== 'half' && sheet !== 'page') || item.kind === 'certificate') return undefined
  return printTextPt(item, fitOptions(group, sheet))
}
/** Four cards on a sheet only while every letter fits a card at its normal size (11 pt). */
const cardsFit = computed(() =>
  groups.value.every((group) =>
    group.entries.every(({ item }) => item.kind !== 'letter' || fitsSheet(item, fitOptions(group, 'cards'))),
  ),
)
watch(
  cardsFit,
  (fits) => {
    if (!fits && layout.value === 'cards') layout.value = halfFits.value ? 'half' : 'page'
  },
  { immediate: true },
)
/** The half page is only offered while every letter fits it at a readable size. */
const halfFits = computed(() =>
  groups.value.every((group) =>
    group.entries.every(({ item }) => item.kind === 'certificate' || fitsSheet(item, fitOptions(group, 'half'))),
  ),
)
/** The letters too long for a half page, by name, so the parent knows which to shorten. */
const tooLongForHalf = computed(() =>
  groups.value.flatMap((group) =>
    group.entries
      .filter(({ item }) => item.kind !== 'certificate' && !fitsSheet(item, fitOptions(group, 'half')))
      .map(({ item }) => ({ item, group })),
  ),
)
const shortenIds = computed(() => new Set(tooLongForHalf.value.map(({ item }) => item.id)))
const tooLongNames = computed(() => {
  const names = tooLongForHalf.value.map(({ item, group }) => {
    const day = item.date ? formatDayMonth(item.date) : item.label || item.heading
    return groups.value.length > 1 && group.child ? `${day} (${group.child.name})` : day
  })
  return names.length > 6 ? `${names.slice(0, 6).join(', ')} ja veel ${names.length - 6}` : names.join(', ')
})
// Letters made long, or decorated, while on the half page move to whole pages.
watch(
  halfFits,
  (fits) => {
    if (!fits && layout.value === 'half') layout.value = 'page'
  },
  { immediate: true },
)
function groupTitle(group: ItemGroup): string {
  return group.child && content.value ? `${group.child.name} · ${content.value.title}` : posterTitle.value
}

const overflowByGroup = ref<Record<string, number>>({})
const overflowCount = computed(() => Object.values(overflowByGroup.value).reduce((sum, n) => sum + n, 0))
function setOverflow(key: string, count: number): void {
  overflowByGroup.value = { ...overflowByGroup.value, [key]: count }
}

/**
 * Long texts on cards. The poster makes its cards larger by itself when a text does not fit
 * (more sheets, never cut text); only if a text is still too long is "smaller text" offered.
 */
const cardFit = computed({
  get: (): CardFit => decoration.value.cardFit ?? 'normal',
  set: (value: CardFit) => setDecoration({ ...decoration.value, cardFit: value }),
})
watch(overflowCount, (count) => {
  if (count > 0 && isPoster.value && !posterLarge.value) {
    cardFit.value = 'larger'
    announce('Mõni tekst ei mahtunud, nii et plakati kaardid on nüüd suuremad.')
  }
})
const showSmallText = computed(() => (isPoster.value || isMini.value) && (overflowCount.value > 0 || cardFit.value === 'smaller'))
function setSmallText(on: boolean): void {
  cardFit.value = on ? 'smaller' : isPoster.value && !longLetters.value ? 'larger' : 'normal'
}

const posterTitle = computed(() =>
  content.value ? `${content.value.request.children.map((child) => child.name).join(', ')} · ${content.value.title}` : '',
)
const posterLabels = computed(() => {
  const group = groups.value.find((candidate) => groupLayout(candidate) === 'poster')
  return (group?.entries ?? []).map(({ item }) => (item.date ? formatDayMonth(item.date) : item.label))
})
// The small pieces under each item are not needed on the poster: the cards are the pieces.
// One item (a certificate, say) is never cut: one piece would just be the picture again.
const puzzle = computed(() => {
  const image = decoration.value.image
  if (!PUZZLE_ENABLED || isPoster.value || !decoration.value.puzzle || !image || !imageUrl.value || !content.value) return null
  if (content.value.items.length < 2) return null
  return { imageUrl: imageUrl.value, grid: computeGrid(content.value.items.length, image.width / image.height) }
})
// Smaller pieces on cards so four still fit on one A4 page.
const pieceMaxCm = computed(() => (layout.value === 'cards' ? 5 : layout.value === 'half' ? 6 : 8))
const hasParentMaterial = computed(
  () => (content.value?.instructions.length ?? 0) > 0 || !!puzzle.value || isPoster.value,
)

// New choices from the panel beside the preview: the texts are written again with the same seed.
// Letters edited by hand stay; before any would be lost the parent is asked, and a "no" puts
// the panel's choices back.
const updating = ref(false)
const panelKey = ref(0)
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
    const { items, kept, lost } = carryEdits(current.items, next.items)
    if (
      lost.length > 0 &&
      !window.confirm(
        lost.length === 1
          ? 'Üks käsitsi muudetud kiri ei mahu uute valikutega sarja ja kaob. Jätkan?'
          : `${lost.length} käsitsi muudetud kirja ei mahu uute valikutega sarja ja kaovad. Jätkan?`,
      )
    ) {
      panelKey.value++
      return
    }
    store.applyChoices(props.id, { ...next, items })
    choiceErrors.value = []
    announce(
      kept > 0
        ? `Eelvaade uuendatud. ${kept === 1 ? 'Käsitsi muudetud kiri jäi alles' : `${kept} käsitsi muudetud kirja jäid alles`} – vaata, kas see sobib uue looga.`
        : 'Eelvaade uuendatud.',
    )
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
/** Set when the editor was opened to shorten a letter for the half page. */
const editingFit = ref<FitOptions | null>(null)
function openEditor(itemId: string, fit: FitOptions | null = null): void {
  editingId.value = itemId
  editingFit.value = fit
}
function saveFromDialog(patch: Pick<GeneratedItem, 'label' | 'heading' | 'body' | 'signature'>): void {
  const item = editingItem.value
  if (item) save(item, patch)
  editingId.value = null
}

function save(item: GeneratedItem, patch: Pick<GeneratedItem, 'label' | 'heading' | 'body' | 'signature'>): void {
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
      markNone(item.id)
      announce('Sellele osale teist varianti ei leitud. Muuda teksti käsitsi.')
    } else {
      store.updateItem(props.id, next)
      announce(`${item.label || item.heading || 'Kiri'}: uus variant loodud.`)
    }
  } finally {
    busyItem.value = null
  }
}

type PrintMode = 'all' | 'child' | 'parent'
const printMode = ref<PrintMode>('all')
const printOptions = computed<{ value: PrintMode; label: string }[]>(() => [
  { value: 'all', label: 'Kõik kirjad' },
  { value: 'child', label: 'Ainult lapsele' },
  ...(hasParentMaterial.value ? [{ value: 'parent' as const, label: 'Lapsevanema leht' }] : []),
])
const printSummary = computed(() =>
  [
    printOptions_.value.find((option) => option.value === layout.value)?.label,
    printMode.value !== 'all' ? printOptions.value.find((option) => option.value === printMode.value)?.label : '',
    uppercase.value ? 'trükitähed' : '',
  ]
    .filter(Boolean)
    .join(' · '),
)
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

/** The text file holds what is shown: one child's letters while the filter shows one child. */
const exportLabel = computed(() => (filteredGroup.value?.child ? `Tekstifail: ${filteredGroup.value.child.name}` : 'Tekstifail'))
function exportText(): void {
  const current = content.value
  if (!current) return
  const child = filteredGroup.value?.child
  if (!child) {
    downloadText(contentToPlainText(current), fileNameFor(current.title))
    return
  }
  const own = { ...current, items: current.items.filter((item) => item.childId === child.id) }
  downloadText(contentToPlainText(own, true, child.name), fileNameFor(`${child.name} ${current.title}`))
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
          <BaseButton variant="secondary" size="sm" :aria-label="exportLabel" @click="exportText"><Download aria-hidden="true" /> <span class="toolbar__label">{{ exportLabel }}</span></BaseButton>
          <BaseButton size="sm" @click="print(printOptions.some((o) => o.value === printMode) ? printMode : 'all')"><Printer aria-hidden="true" /> Prindi / PDF</BaseButton>
        </div>
      </div>
    </div>

    <div class="container preview__body">
      <aside v-scroll-shadow class="side no-print" aria-label="Kohanda ja prindi">
        <p v-if="aiWritten" class="ai-note">
          <template v-if="content.request.contentType === 'story'">
            Selle loo kirjutas päkapikk just {{ namesInCase(content.request.children, 'allative') }}. Iga lehekülge saad muuta nupuga „Muuda“, seal saab ka päkapikult muudatust paluda.
          </template>
          <template v-else>Need kirjad kirjutas päkapikk Tuduja just {{ namesInCase(content.request.children, 'allative') }}. Iga kirja saad muuta nupuga „Muuda“, seal saab ka päkapikult muudatust paluda.</template>
        </p>
        <CustomizePanel
          v-else
          :key="panelKey"
          :content="content"
          :decoration="decoration"
          :busy="updating"
          :errors="choiceErrors"
          @change="applyChoices"
          @decoration="setDecoration"
        />
        <PassOfferCard
          v-if="PASS_ENABLED && !aiWritten && design === 'new' && content.request.contentType === 'letter' && content.request.occasionId === 'christmas'"
          :content="content"
        />
        <!-- After the choices: they are what the AI story is written from. -->
        <AiStoryCard
          v-if="PASS_ENABLED && !aiWritten && design === 'new' && content.request.contentType === 'story'"
          :content="content"
          :pass="pass"
          :busy-elsewhere="updating"
          @written="storyWritten"
        />

        <DecorationPanel
          :decoration="decoration"
          :occasion-id="content.request.occasionId"
          :item-count="content.items.length"
          :image-url="imageUrl"
          :poster="isPoster"
          :mini="isMini"
          :child-image="anyChildImage"
          :children="childRows"
          :child-image-urls="childImageUrls"
          @update="setDecoration"
        />

        <PanelSection title="Printimine" :summary="printSummary">
          <SegmentedControl v-model="layout" name="print-preset" label="Kuidas prindid?" :options="printOptions_" :hint="presetHint" />
          <p v-if="(isPoster || isMini) && overflowCount > 0" class="controls__warn" role="status">
            {{ overflowCount }} kaardil on tekst liiga pikk{{ isPoster ? ' ka suurel kaardil' : '' }}. Lühenda seda kaardil „Muuda“
            või vali väiksem tekst.
          </p>
          <label v-if="showSmallText" class="check controls__small">
            <input type="checkbox" :checked="cardFit === 'smaller'" @change="setSmallText(($event.target as HTMLInputElement).checked)" />
            <span>Väiksem tekst kaartidel</span>
          </label>

          <details class="more">
            <summary class="more__summary">Printimise lisavalikud <span class="more__what">mida printida, trükitähed</span></summary>
            <div class="more__body">
              <div class="controls">
                <!-- One choice at a time (one print run), so radios. -->
                <SegmentedControl v-model="printMode" name="print-mode" label="Mida printida?" :options="printOptions" />
                <label class="check controls__upper">
                  <input type="checkbox" :checked="uppercase" @change="setDecoration({ ...decoration, uppercase: !uppercase })" />
                  <span>Trükitähed (suured tähed alles lugema õppijale)</span>
                </label>
                <p v-if="isPoster || isMini" class="controls__note">
                  <template v-if="isPoster">Pusleplakati kaardid on tükid, mis lõigatakse lahti ja pannakse lõpuks kokku.</template>
                  <template v-else>Väikelapse kaarte on 12 lehel, lõika mööda katkendjooni.</template>
                </p>
              </div>
            </div>
          </details>
          <p class="controls__note">Teksti muutmiseks vajuta kaardil „Muuda“. PDF-i saamiseks vali printimisaknas „Salvesta PDF-ina“.</p>
          <p class="controls__note">
            Kui pilt või taust jääb prindis kahele lehele (näiteks telefonis, kus äärt muuta ei saa), vähenda printimisaknas skaalat
            või vali seal „Fit to page“ ehk lehele mahutamine. Nii jääb kogu leht tervena ühele paberile.
          </p>
        </PanelSection>
        <!-- Right after printing: the letters are free, supporting is a choice. -->
        <SupportCard v-if="SUPPORT_ENABLED && !aiWritten" />
        <FeedbackCard />
        <PersonalSoon v-if="!PASS_ENABLED && !aiWritten && content.request.contentType === 'letter' && content.request.occasionId === 'christmas'" />
      </aside>

      <div class="sheets">
        <p class="visually-hidden" role="status" aria-live="polite">{{ status }}</p>
        <p v-if="status" class="toast no-print" aria-hidden="true">{{ status }}</p>

        <SegmentedControl
          v-if="isPoster || isMini"
          v-model="view"
          class="child-filter no-print"
          name="sheet-view"
          label="Eelvaade"
          :options="viewOptions"
          :hint="isPoster ? 'Prinditakse alati pusletükkidena, nagu „Nagu prinditult“ näitab.' : 'Prinditakse kaartidena, nagu „Nagu prinditult“ näitab.'"
        />
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
          <div v-if="boardLayout(group) && view === 'read'" class="read-list no-print">
            <PrintableItem
              v-for="entry in group.entries"
              :key="entry.item.id"
              :item="entry.item"
              :busy="busyItem === entry.item.id"
              :pattern="null"
              :ink-saver="true"
              :background-url="null"
              :uppercase="groupUppercase(group)"
              :no-variants="aiWritten"
              :no-variant="noVariantIds.has(entry.item.id)"
              @edit="openEditor(entry.item.id)"
              @regenerate="regenerate(entry.index)"
            />
          </div>
          <div v-if="boardLayout(group)" :class="{ 'board-offscreen': view === 'read' }" :aria-hidden="view === 'read' || undefined" :inert="view === 'read' || undefined">
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
          </div>
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
              :smaller="groupSmaller(group)"
              :piece="puzzle ? { ...puzzle, index: entry.index, maxCm: pieceMaxCm } : null"
              :no-variants="aiWritten"
              :no-variant="noVariantIds.has(entry.item.id)"
              :print-pt="printPt(group, entry.item)"
              :shorten="shortenIds.has(entry.item.id)"
              :companion="companionOf(group, entry)"
              @shorten="openEditor(entry.item.id, fitOptions(group, 'half'))"
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
          :ai-fix="PASS_ENABLED && aiWritten && passUsable ? fixWithAi : undefined"
          :ai-note="aiNote"
          :fit="editingFit"
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
  align-self: flex-start;
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
  :deep(.panel-section) {
    border: 2px solid #f0e2cf;
    border-radius: 14px;
    background: #fffdf8;
  }
  // The "Varsti" section stays gray, like the offer on the finished letters' page.
  :deep(.panel-section.soon) {
    border-color: #e6ded3;
    background: #f6f2ec;
  }
  .more {
    border-top: 2px dashed #ecd9bf;
  }
  .child-group__title {
    font-family: var(--font-print);
    font-weight: 600;
  }
}
// On screen the sheets keep the shape they print in (A4 inside the 14mm margins, see the
// print heights below), so a whole page looks like a whole page; a long text still grows it.
// The shape is a minimum height, not an aspect ratio: a ratio holds the box to the sheet's
// shape however narrow the screen is, and a phone cut the text off at the bottom of the card.
.sheet--page {
  max-width: 720px;
  margin-inline: auto;
  container-type: inline-size;
  :deep(.paper) {
    min-height: calc(100cqw * 245 / 182);
  }
}
.sheet--half {
  max-width: 720px;
  margin-inline: auto;
  container-type: inline-size;
  :deep(.paper) {
    min-height: calc(100cqw * 120 / 182);
  }
}
// The letters in date order while reading; the poster sheets are still laid out (out of
// sight) so that their text-fit checks run, and they are what prints.
.read-list {
  display: grid;
  gap: 1rem;
  max-width: 720px;
  margin-inline: auto;
}
.board-offscreen {
  position: absolute;
  left: -10000px;
  top: 0;
  width: 1100px;
  visibility: hidden;
}
.sheet--cards {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
}

@media print {
  .board-offscreen {
    position: static;
    width: auto;
    visibility: visible;
  }
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
  // The print heights replace the screen's aspect ratio, which would hold a long text to
  // the ratio's height; the text size is fitted to these heights (printFit.ts). They stay
  // under the ~251 mm Safari prints on an A4 page (Chrome: 269 mm inside the 14 mm margins):
  // a sheet any taller adds an empty page after every letter.
  .sheet--page :deep(.paper) {
    aspect-ratio: auto;
    min-height: 245mm;
    break-after: page;
    page-break-after: always;
  }
  .sheet--page :deep(.paper:last-child) {
    break-after: auto;
    page-break-after: auto;
  }
  .sheet--half :deep(.paper) {
    aspect-ratio: auto;
    min-height: 120mm;
    margin-bottom: 6mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .sheet--cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6mm;
    :deep(.paper) {
      min-height: 118mm;
      font-size: 11pt;
      break-inside: avoid;
      page-break-inside: avoid;
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
