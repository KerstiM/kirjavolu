<script setup lang="ts">
import { computed, ref } from 'vue'
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import type { ChildDecoration, Decoration, OccasionId, PatternId, StoredImageRef } from '../../../domain/models'
import { isSuggestedPattern, PATTERN_LABELS, patternsFor } from '../../../domain/patterns'
import { computeGrid } from '../../../domain/puzzleGrid'
import { PUZZLE_ENABLED } from '../../../domain/puzzleAvailability'
import { saveImage } from '../../../utils/imageStore'
import PanelSection from '../../../components/ui/PanelSection.vue'
import PatternBackground from './PatternBackground.vue'
import PosterArt from '../poster/PosterArt.vue'

const props = defineProps<{
  decoration: Decoration
  occasionId: OccasionId
  itemCount: number
  imageUrl: string | null
  /** Puzzle poster: a picture spans the whole poster, and the drawn landscape is one of the choices. */
  poster?: boolean
  /** Toddler card sheets: the picture is a background behind the cards, never cut into pieces. */
  mini?: boolean
  /** Some child has an own picture, so the strength slider is needed even without a shared one. */
  childImage?: boolean
  /** Children with their own sheets (a linked family series): each may get their own background. */
  children?: { id: string; name: string; mini: boolean }[]
  /** Loaded own pictures of the children, by image id. */
  childImageUrls?: Record<string, string>
}>()
const emit = defineEmits<{ update: [decoration: Decoration] }>()

/** A background as a swatch: none, a pattern, the poster landscape or a picture by its id. */
type BackgroundChoice = 'none' | 'poster-art' | PatternId | `image:${string}`

const uploading = ref(false)
const error = ref('')
const patterns = computed(() => patternsFor(props.occasionId))

/**
 * With several children the parent first picks whose background to set: all of them (the
 * shared background, the default) or some, who then get their own. A child not chosen
 * keeps what they have, so a child leaving the shared background starts from it.
 */
const kids = computed(() => props.children ?? [])
const perChild = computed(() => kids.value.length > 1)
const selected = ref<string[]>(kids.value.map((child) => child.id))
const everyone = computed(() => !perChild.value || kids.value.every((child) => selected.value.includes(child.id)))

function toggleChild(id: string): void {
  if (!selected.value.includes(id)) {
    const first = selected.value[0]
    selected.value = [...selected.value, id]
    // Everyone chosen again: the child chosen first sets the shared background for all.
    if (first && everyone.value && new Set(kids.value.map((child) => choiceOf(child.id))).size > 1) {
      chooseBackground(choiceOf(first), own(first).image)
    }
  }
  // Someone is always chosen: the swatches always say whose background they set.
  else if (selected.value.length > 1) selected.value = selected.value.filter((other) => other !== id)
}

function own(childId: string): ChildDecoration {
  return props.decoration.childDecorations?.[childId] ?? { background: 'shared', image: null }
}

const sharedChoice = computed<BackgroundChoice>(() => {
  if (props.decoration.imageAsBackground && props.decoration.image) return `image:${props.decoration.image.id}`
  if (props.poster && props.decoration.posterArt) return 'poster-art'
  return props.decoration.pattern ?? 'none'
})

function choiceOf(childId: string): BackgroundChoice {
  const mine = own(childId)
  if (mine.background === 'none') return 'none'
  if (mine.background === 'image' && mine.image) return `image:${mine.image.id}`
  if (mine.background === 'pattern' && mine.pattern) return mine.pattern
  if (mine.background === 'poster-art') return 'poster-art'
  return sharedChoice.value
}

/** The swatch shown as chosen: what every chosen child has, or none when they differ. */
const background = computed<BackgroundChoice | null>(() => {
  if (!perChild.value) return sharedChoice.value
  const choices = new Set(selected.value.map(choiceOf))
  return choices.size === 1 ? [...choices][0]! : null
})
const backgroundImage = computed(() => background.value?.startsWith('image:') ?? false)

/** Pictures to pick from: the shared one, and for some children also their own. */
const pictures = computed(() => {
  const list: { image: StoredImageRef; url: string }[] = []
  if (props.decoration.image && props.imageUrl) list.push({ image: props.decoration.image, url: props.imageUrl })
  if (!everyone.value) {
    for (const child of kids.value) {
      const image = own(child.id).image
      const url = image && props.childImageUrls?.[image.id]
      if (image && url && !list.some((known) => known.image.id === image.id)) list.push({ image, url })
    }
  }
  return list
})

// On card sheets the picture is behind the cards, so it can be shown at full strength.
const cardSheets = computed(() => !!props.poster || !!props.mini)
const maxOpacity = computed(() => (cardSheets.value ? 1 : 0.6))
const opacity = computed(() => (cardSheets.value ? (props.decoration.cardImageOpacity ?? 1) : props.decoration.imageOpacity))
function setOpacity(value: number): void {
  update(cardSheets.value ? { cardImageOpacity: value } : { imageOpacity: value })
}
const grid = computed(() =>
  props.decoration.image ? computeGrid(props.itemCount, props.decoration.image.width / props.decoration.image.height) : null,
)

/** What is chosen, for the closed section: the background (or "differs" for children with their own) and the picture. */
const summary = computed(() => {
  const choice = background.value
  const name = !choice
    ? 'lastel eri taustad'
    : choice === 'none'
      ? 'taust puudub'
      : choice === 'poster-art'
        ? 'plakatipilt'
        : choice.startsWith('image:')
          ? 'oma pilt'
          : (PATTERN_LABELS[choice as PatternId] ?? '').toLowerCase()
  const saver = choice && patterns.value.includes(choice as PatternId) && props.decoration.inkSaver ? 'tindisäästlik' : ''
  return [name, saver].filter(Boolean).join(' · ')
})

function update(patch: Partial<Decoration>): void {
  emit('update', { ...props.decoration, ...patch })
}

function ownBackground(choice: BackgroundChoice, image: StoredImageRef | null): Omit<ChildDecoration, 'image'> & { image?: StoredImageRef | null } {
  if (choice === 'none') return { background: 'none' }
  if (choice === 'poster-art') return { background: 'poster-art' }
  if (choice.startsWith('image:')) return { background: 'image', image }
  return { background: 'pattern', pattern: choice as PatternId }
}

function chooseBackground(choice: BackgroundChoice, image: StoredImageRef | null = null): void {
  if (everyone.value) {
    // All children: the shared background, and every child follows it again.
    const childDecorations = perChild.value
      ? Object.fromEntries(kids.value.map((child) => [child.id, { ...own(child.id), background: 'shared' as const }]))
      : props.decoration.childDecorations
    if (choice.startsWith('image:')) update({ ...(image ? { image } : {}), imageAsBackground: true, posterArt: false, pattern: null, childDecorations })
    else if (choice === 'poster-art') update({ imageAsBackground: false, posterArt: true, pattern: null, childDecorations })
    else update({ imageAsBackground: false, posterArt: false, pattern: choice === 'none' ? null : (choice as PatternId), childDecorations })
    return
  }
  const childDecorations = { ...props.decoration.childDecorations }
  for (const id of selected.value) childDecorations[id] = { ...own(id), ...ownBackground(choice, image) }
  update({ childDecorations })
}

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Vali pildifail (JPG, PNG või WebP).'
    return
  }
  uploading.value = true
  error.value = ''
  try {
    const image = await saveImage(file)
    if (!everyone.value) chooseBackground(`image:${image.id}`, image)
    // On the poster a fresh picture goes behind the cards. Elsewhere cutting it into pieces is
    // the parent's own choice (a certificate wants the picture whole); without the puzzle a
    // picture is the background.
    else if (!PUZZLE_ENABLED) update({ image, puzzle: false, imageAsBackground: true, posterArt: false, pattern: null })
    else if (cardSheets.value) update({ image, puzzle: true, imageAsBackground: true, posterArt: false, pattern: null })
    else update({ image, puzzle: false })
  } catch {
    error.value = 'Pilti ei õnnestunud salvestada. Proovi teist pilti või teist brauserit.'
  } finally {
    uploading.value = false
  }
}

function removeImage(): void {
  update({ image: null, imageAsBackground: false, puzzle: false })
}
</script>

<template>
  <PanelSection title="Välimus" :summary="summary" class="decor">

    <fieldset v-if="perChild" class="decor__group">
      <legend>Milliste laste kirjadel?</legend>
      <div class="kids">
        <button
          v-for="child in kids"
          :key="child.id"
          type="button"
          class="kid"
          :class="{ 'is-active': selected.includes(child.id) }"
          :aria-pressed="selected.includes(child.id)"
          @click="toggleChild(child.id)"
        >
          {{ child.name }}
        </button>
      </div>
      <p class="decor__hint">
        {{
          everyone
            ? 'Kõigil on ühine taust. Oma tausta jaoks vali ainult see laps.'
            : 'Valitud lapsed saavad oma tausta, teiste oma jääb.'
        }}
      </p>
    </fieldset>

    <fieldset class="decor__group">
      <legend>Taust</legend>
      <div class="swatches">
        <label class="swatch" :class="{ 'is-active': background === 'none' }">
          <input type="radio" class="visually-hidden" name="bg" :checked="background === 'none'" @change="chooseBackground('none')" />
          <span class="swatch__preview swatch__preview--none" aria-hidden="true" />
          <span>Puudub</span>
        </label>
        <label v-for="pattern in patterns" :key="pattern" class="swatch" :class="{ 'is-active': background === pattern }">
          <input type="radio" class="visually-hidden" name="bg" :checked="background === pattern" @change="chooseBackground(pattern)" />
          <span class="swatch__preview" aria-hidden="true"><PatternBackground :pattern="pattern" :ink-saver="false" /></span>
          <span>{{ PATTERN_LABELS[pattern] }}<span v-if="isSuggestedPattern(occasionId, pattern)" class="visually-hidden"> (sobib sündmusega)</span></span>
          <span v-if="isSuggestedPattern(occasionId, pattern)" class="swatch__star" aria-hidden="true">★</span>
        </label>
        <label v-if="poster" class="swatch" :class="{ 'is-active': background === 'poster-art' }">
          <input type="radio" class="visually-hidden" name="bg" :checked="background === 'poster-art'" @change="chooseBackground('poster-art')" />
          <span class="swatch__preview" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><PosterArt :occasion-id="occasionId" :width-mm="100" :height-mm="100" /></svg>
          </span>
          <span>Plakatipilt</span>
        </label>
        <label v-for="picture in pictures" :key="picture.image.id" class="swatch" :class="{ 'is-active': background === `image:${picture.image.id}` }">
          <input
            type="radio"
            class="visually-hidden"
            name="bg"
            :checked="background === `image:${picture.image.id}`"
            @change="chooseBackground(`image:${picture.image.id}`, picture.image)"
          />
          <span class="swatch__preview" aria-hidden="true"><img :src="picture.url" alt="" /></span>
          <span>Oma pilt</span>
        </label>
      </div>
      <label v-if="background && patterns.includes(background as PatternId)" class="check">
        <input type="checkbox" :checked="decoration.inkSaver" @change="update({ inkSaver: !decoration.inkSaver })" />
        <span>Tindisäästlik printimine: muster ainult raamina</span>
      </label>
      <label v-if="backgroundImage || childImage" class="range-field">
        <span>Pildi tugevus</span>
        <span class="range-field__end" aria-hidden="true">hele</span>
        <input
          type="range"
          class="range"
          min="0.1"
          :max="maxOpacity"
          step="0.05"
          :value="opacity"
          aria-label="Taustapildi tugevus"
          @input="setOpacity(Number(($event.target as HTMLInputElement).value))"
        />
        <span class="range-field__end" aria-hidden="true">tugev</span>
      </label>
    </fieldset>

    <fieldset class="decor__group">
      <legend>Oma pilt</legend>
      <p class="decor__hint">
        Pere foto või lapse joonistus. Pilt jääb ainult sinu seadmesse.
        <template v-if="!everyone">See tuleb valitud laste taustaks.</template>
        <template v-else-if="PUZZLE_ENABLED && itemCount > 1 && !cardSheets">Taustaks või lõigatuna tükkideks.</template>
        <template v-else>Taustaks.</template>
      </p>
      <div class="upload-row">
        <label class="upload" :class="{ 'is-busy': uploading }">
          <input type="file" accept="image/*" class="visually-hidden" :disabled="uploading" @change="onFile" />
          <ImagePlus :size="18" aria-hidden="true" />
          <span>{{ uploading ? 'Laen…' : everyone && decoration.image ? 'Vaheta pilti' : 'Laadi pilt üles' }}</span>
        </label>
        <button v-if="everyone && decoration.image" type="button" class="remove" @click="removeImage">
          <Trash2 :size="16" aria-hidden="true" /> Eemalda pilt
        </button>
      </div>
      <p v-if="error" class="decor__error" role="alert">{{ error }}</p>
      <p v-if="poster && backgroundImage" class="decor__hint" role="status">
        Pusleplakatil on see pilt kogu plakati taust – kui kõik kaardid on koos, tuleb pilt välja.
      </p>
      <!-- One part is one piece: nothing to cut. -->
      <template v-if="PUZZLE_ENABLED && everyone && decoration.image && grid && !cardSheets && itemCount > 1">
        <label class="check">
          <input type="checkbox" :checked="decoration.puzzle" @change="update({ puzzle: !decoration.puzzle })" />
          <span>Lõika pilt tükkideks (iga osa juurde üks tükk)</span>
        </label>
        <p v-if="decoration.puzzle" class="decor__hint" role="status">
          {{ itemCount }} osa → {{ grid.cells }} tükki ({{ grid.cols }} × {{ grid.rows }}).
          <template v-if="grid.cells > itemCount">
            {{ grid.cells - itemCount }} lisatükki on lapsevanema lehel – anna need koos viimasega.
          </template>
          Kokkupaneku juhend on lapsevanema lehel.
        </p>
        <p v-if="decoration.puzzle && decoration.image.width < 1200" class="decor__warn">
          Pilt on üsna väikese eraldusvõimega, prinditud tükid võivad jääda veidi uduseks.
        </p>
      </template>
    </fieldset>
  </PanelSection>
</template>

<style scoped lang="scss">
.decor__group {
  border: 0;
  padding: 0;
  margin: 0 0 1rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  legend {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    padding: 0;
  }
}
.decor__hint,
.decor__warn,
.decor__error {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
}
.decor__hint {
  color: var(--ink-soft);
}
.decor__warn {
  color: #7a5410;
}
.decor__error {
  color: var(--danger);
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.swatch {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 4.75rem;
  padding: 0.4rem 0.3rem;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  &:hover {
    border-color: var(--line-strong);
  }
  &.is-active {
    border-color: var(--lavender);
    box-shadow: 0 0 0 3px var(--lavender-soft);
  }
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.swatch__preview {
  position: relative;
  display: block;
  width: 3.4rem;
  height: 2.6rem;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--line);
  img,
  svg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.swatch__preview--none {
  background: linear-gradient(135deg, #fff 47%, var(--line-strong) 48%, var(--line-strong) 52%, #fff 53%);
}
.swatch__star {
  position: absolute;
  top: 0.2rem;
  right: 0.35rem;
  color: #d9a441;
  font-size: 0.8rem;
}
.range-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  .range {
    max-width: 14rem;
  }
}
.range-field__end {
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.upload,
.remove {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.upload {
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  border: 1.5px solid var(--lavender-mid);
  &:hover {
    border-color: var(--lavender);
  }
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  &.is-busy {
    opacity: 0.7;
    cursor: wait;
  }
}
.remove {
  background: transparent;
  border: 1.5px solid var(--line);
  color: var(--ink-soft);
  &:hover {
    color: var(--danger);
    border-color: rgba(179, 38, 30, 0.35);
  }
}
.check {
  align-self: flex-start;
}
.kids {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.kid {
  min-height: 2.75rem;
  padding: 0.45rem 1rem;
  border: 2px solid var(--lavender-mid);
  border-radius: 999px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  &.is-active {
    border-color: var(--lavender);
    background: var(--lavender-soft);
    color: var(--lavender-ink);
    font-weight: 600;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
</style>
