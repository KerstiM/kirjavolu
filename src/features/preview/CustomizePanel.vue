<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ChildProfile, ContentOptionsMap, Decoration, GeneralOptions, GeneratedContent, LanguageLevel, TextSize } from '../../domain/models'
import { getContentType } from '../../domain/contentTypes'
import { defaultOptions } from '../../domain/defaults'
import { clone } from '../../utils/clone'
import { usesScenarioEngine } from '../../domain/story/scenarioLetters'
import { PUZZLE_ENABLED } from '../../domain/puzzleAvailability'
import type { RequestFor } from '../../domain/models'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import PanelSection from '../../components/ui/PanelSection.vue'
import ChildContentBlock from './ChildContentBlock.vue'
import CompanionPicker from './CompanionPicker.vue'
import type { CompanionId } from '../../domain/models'
import PersonaEditor from '../creation/options/PersonaEditor.vue'
import { suggestPersonas } from '../../data/templates/personas'
import { ageBand, languageFor } from '../../domain/generators/audience'
import {
  DIFFICULTY_OPTIONS,
  LANGUAGE_HINT,
  LANGUAGE_OPTIONS,
  LEGACY_MEDIUM,
  LENGTH_OPTIONS,
  LETTER_LENGTH_HINT,
  LETTER_LENGTH_OPTIONS,
  TONE_OPTIONS,
} from '../creation/labels'
import LetterOptionsForm from '../creation/options/LetterOptionsForm.vue'
import TreasureHuntOptionsForm from '../creation/options/TreasureHuntOptionsForm.vue'
import StoryOptionsForm from '../creation/options/StoryOptionsForm.vue'
import PuzzleOptionsForm from '../creation/options/PuzzleOptionsForm.vue'
import CalendarOptionsForm from '../creation/options/CalendarOptionsForm.vue'
import CertificateOptionsForm from '../creation/options/CertificateOptionsForm.vue'

/**
 * The creation's choices beside the preview. Every change is sent on after a short
 * pause, so the letters update while the parent is still looking at them.
 */
const props = defineProps<{ content: GeneratedContent; decoration: Decoration; busy?: boolean; errors?: string[] }>()
const emit = defineEmits<{
  change: [choices: { general: GeneralOptions; options: GeneratedContent['request']['options'] }]
  decoration: [decoration: Decoration]
}>()

interface Choices {
  general: GeneralOptions
  options: ContentOptionsMap
}

const DEBOUNCE_MS = 350

function choicesOf(content: GeneratedContent): Choices {
  const { request } = content
  return {
    general: clone(request.general),
    options: { ...defaultOptions(request.occasionId), [request.contentType]: clone(request.options) },
  }
}

const draft = ref<Choices>(choicesOf(props.content))
const request = computed(() => props.content.request)
const type = computed(() => request.value.contentType)
const children = computed(() => request.value.children)

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const unchanged = () =>
  same(draft.value.general, request.value.general) && same(draft.value.options[type.value], request.value.options)

// A new creation (or one updated elsewhere) brings its own choices.
watch(request, () => {
  if (!unchanged()) draft.value = choicesOf(props.content)
})

let timer: ReturnType<typeof setTimeout> | undefined
watch(
  draft,
  () => {
    clearTimeout(timer)
    timer = setTimeout(send, DEBOUNCE_MS)
  },
  { deep: true },
)
onBeforeUnmount(() => clearTimeout(timer))

// Letters edited by hand are kept by the preview (PreviewPage asks before any would be lost).
function send(): void {
  if (unchanged()) return
  emit('change', { general: clone(draft.value.general), options: clone(draft.value.options[type.value]) })
}

/**
 * Letters have one warm, playful style: the four tones did not give letters that differed
 * reliably, so they are not offered. Elsewhere the tone still picks openings, endings, wishes.
 */
const toneMatters = computed(() => type.value !== 'letter')
const letters = computed(() => type.value === 'letter')
const engine = computed(
  () => letters.value && usesScenarioEngine({ ...props.content.request, options: draft.value.options.letter } as RequestFor<'letter'>),
)

/**
 * Each child's language, as the letters were written. Choosing one keeps every other child's
 * as it is: an older creation's "Lihtsam" / "Keerulisem" is written out per child first.
 */
function languageOf(child: ChildProfile): LanguageLevel {
  return languageFor(child, draft.value.options.letter, draft.value.general.difficulty)
}
function setLanguage(child: ChildProfile, level: LanguageLevel): void {
  const language = Object.fromEntries(children.value.map((other) => [other.id, languageOf(other)]))
  draft.value.options.letter.language = { ...language, [child.id]: level }
  draft.value.general.difficulty = 'auto'
}
// A toddler's two texts are not the readers' two, so the hint says what they are.
const toddlerNote = (child: ChildProfile) =>
  ageBand(child) === 'toddler' ? 'Väikelapsele on lihtne keel ettelugemislugu; rikkalikum keel on nagu 5–7-aastastel.' : ''
const lengthOptions = computed(() =>
  draft.value.general.length === 'medium' ? [...LETTER_LENGTH_OPTIONS, LEGACY_MEDIUM] : LETTER_LENGTH_OPTIONS,
)

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'normal', label: 'Tavaline (16 px)' },
  { value: 'smaller', label: 'Väiksem (14 px)' },
]
/** A child's own text size (several children), or the shared one. */
function textSizeOf(child?: ChildProfile): TextSize {
  const own = child && children.value.length > 1 ? props.decoration.childDecorations?.[child.id]?.textSize : undefined
  return own ?? props.decoration.textSize ?? 'normal'
}
function setTextSize(value: TextSize, child?: ChildProfile): void {
  if (!child || children.value.length < 2) {
    emit('decoration', { ...props.decoration, textSize: value })
    return
  }
  const own = props.decoration.childDecorations?.[child.id] ?? { background: 'shared' as const, image: null }
  emit('decoration', { ...props.decoration, childDecorations: { ...props.decoration.childDecorations, [child.id]: { ...own, textSize: value } } })
}

/** The character under long letters: only offered for the long letter, where there is room. */
const companionOn = computed(() => letters.value && draft.value.general.length === 'long')
function setCompanion(value: CompanionId | null): void {
  emit('decoration', { ...props.decoration, companion: value })
}

const labelOf = <T,>(list: { value: T; label: string }[], value: T) => list.find((o) => o.value === value)?.label ?? ''
const generalSummary = computed(() =>
  [
    toneMatters.value ? labelOf(TONE_OPTIONS, draft.value.general.tone) : '',
    labelOf(LENGTH_OPTIONS, draft.value.general.length),
    labelOf(DIFFICULTY_OPTIONS, draft.value.general.difficulty),
  ]
    .filter(Boolean)
    .join(' · ')
    .toLowerCase(),
)
const lengthHint = computed(() =>
  PUZZLE_ENABLED && draft.value.options.letter.count >= 7
    ? `${LETTER_LENGTH_HINT} ${draft.value.general.length === 'long' ? 'Pusleplakatil on suuremad kaardid.' : ''}`.trim()
    : LETTER_LENGTH_HINT,
)

const title = computed(() => (letters.value ? 'Kohanda kirju' : `Kohanda: ${getContentType(type.value).title.toLowerCase()}`))

// Letters: the family's helpers are one per child, so each child gets a block of their own.
const linked = computed(() => children.value.length > 1 && (draft.value.options.letter.mode ?? 'linked') === 'linked')
const personas = computed(() => suggestPersonas(children.value, request.value.occasionId, (child) => ageBand(child) === 'toddler'))
const helperName = (child: ChildProfile) => draft.value.options.letter.personas?.[child.id]?.name ?? personas.value[child.id]?.name
const childLine = (child: ChildProfile) =>
  [
    linked.value ? helperName(child) : '',
    engine.value ? labelOf(LANGUAGE_OPTIONS, languageOf(child)) : '',
    labelOf(lengthOptions.value, draft.value.general.length),
    textSizeOf(child) === 'smaller' ? 'väiksem tekst' : '',
  ]
    .filter(Boolean)
    .join(' · ')
const blocks = computed(() => children.value.length > 1 && (linked.value || engine.value))

const dateLabel = (iso: string) => iso.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${Number(d)}.${Number(m)}.${y}`)
const lettersSummary = computed(() => {
  const { count, dated, startDate } = draft.value.options.letter
  return [`${count} ${count === 1 ? 'kiri' : 'kirja'}`, dated === false ? 'ilma kuupäevadeta' : startDate ? dateLabel(startDate) : '']
    .filter(Boolean)
    .join(' · ')
})
const contentSummary = computed(() => {
  if (!letters.value) return generalSummary.value
  const length = labelOf(lengthOptions.value, draft.value.general.length)
  if (children.value.length === 1) return [engine.value ? labelOf(LANGUAGE_OPTIONS, languageOf(children.value[0]!)) : '', length].filter(Boolean).join(' · ')
  return `${length} · iga lapse valikud`
})
</script>

<template>
  <section class="customize no-print" aria-labelledby="customize-title">
    <h2 id="customize-title" class="customize__title">{{ title }}</h2>
    <p class="customize__status" role="status" aria-live="polite">{{ busy ? 'Uuendan eelvaadet…' : '' }}</p>
    <p class="customize__lead">Muudatused ilmuvad kohe eelvaates.</p>
    <div v-if="errors?.length" class="customize__errors" role="alert">
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>

    <template v-if="letters">
      <PanelSection title="Kirjad" :summary="lettersSummary" open>
        <LetterOptionsForm v-model="draft.options.letter" part="letters" :children="children" :occasion-id="request.occasionId" />
        <p class="customize__kids">
          <strong>Lapsed:</strong>
          {{ children.map((child) => `${child.name} (${child.age} a)`).join(', ') }}
        </p>
      </PanelSection>

      <PanelSection title="Sisu kohandamine" :summary="contentSummary">
        <LetterOptionsForm v-model="draft.options.letter" part="content" :children="children" :occasion-id="request.occasionId">
          <div class="customize__letter">
            <template v-if="blocks">
              <ChildContentBlock v-for="child in children" :key="child.id" :name="child.name" :summary="childLine(child)">
                <PersonaEditor v-if="linked" v-model="draft.options.letter.personas" :children="children" :occasion-id="request.occasionId" :only="child.id" />
                <SegmentedControl
                  v-if="engine"
                  :model-value="languageOf(child)"
                  :name="`language-${child.id}`"
                  label="Teksti keerukus"
                  :options="LANGUAGE_OPTIONS"
                  :hint="[LANGUAGE_HINT, toddlerNote(child)].filter(Boolean).join(' ')"
                  @update:model-value="setLanguage(child, $event)"
                />
                <SegmentedControl
                  :model-value="textSizeOf(child)"
                  :name="`text-size-${child.id}`"
                  label="Teksti suurus"
                  :options="TEXT_SIZE_OPTIONS"
                  @update:model-value="setTextSize($event, child)"
                />
              </ChildContentBlock>
            </template>
            <SegmentedControl
              v-else-if="engine"
              :model-value="languageOf(children[0]!)"
              :name="`language-${children[0]!.id}`"
              label="Teksti keerukus"
              :options="LANGUAGE_OPTIONS"
              :hint="[LANGUAGE_HINT, toddlerNote(children[0]!)].filter(Boolean).join(' ')"
              @update:model-value="setLanguage(children[0]!, $event)"
            />
            <SegmentedControl
              v-if="!blocks"
              :model-value="textSizeOf()"
              name="text-size"
              label="Teksti suurus"
              :options="TEXT_SIZE_OPTIONS"
              @update:model-value="setTextSize($event)"
            />
            <SegmentedControl
              v-model="draft.general.length"
              name="length"
              :label="children.length > 1 ? 'Kirja pikkus (kõigile lastele)' : 'Kirja pikkus'"
              :options="lengthOptions"
              :hint="lengthHint"
            />
            <CompanionPicker v-if="companionOn" :model-value="decoration.companion ?? null" name="companion" @update:model-value="setCompanion" />
          </div>
        </LetterOptionsForm>
      </PanelSection>
    </template>

    <PanelSection v-else title="Sisu kohandamine" :summary="contentSummary" open>
      <TreasureHuntOptionsForm
        v-if="type === 'treasure-hunt'"
        v-model="draft.options['treasure-hunt']"
        :multiple-children="children.length > 1"
      />
      <StoryOptionsForm v-else-if="type === 'story'" v-model="draft.options.story" />
      <PuzzleOptionsForm v-else-if="type === 'puzzle'" v-model="draft.options.puzzle" />
      <CalendarOptionsForm v-else-if="type === 'calendar'" v-model="draft.options.calendar" />
      <CertificateOptionsForm v-else v-model="draft.options.certificate" :occasion-id="request.occasionId" />

      <SegmentedControl
        :model-value="textSizeOf()"
        name="text-size"
        label="Teksti suurus"
        :options="TEXT_SIZE_OPTIONS"
        @update:model-value="setTextSize($event)"
      />

      <details class="customize__general">
        <summary>
          {{ toneMatters ? 'Toon, pikkus ja raskusaste' : 'Pikkus ja raskusaste' }} <span class="customize__now">{{ generalSummary }}</span>
        </summary>
        <div class="customize__general-body">
          <SegmentedControl v-if="toneMatters" v-model="draft.general.tone" name="tone" label="Toon" :options="TONE_OPTIONS" />
          <SegmentedControl v-model="draft.general.length" name="length" label="Pikkus" :options="LENGTH_OPTIONS" />
          <SegmentedControl
            v-model="draft.general.difficulty"
            name="difficulty"
            label="Raskusaste"
            :options="DIFFICULTY_OPTIONS"
            hint="Eakohane arvestab iga lapse vanust ja lugemisoskust."
          />
        </div>
      </details>
    </PanelSection>
  </section>
</template>

<style scoped lang="scss">
.customize {
  margin-bottom: 0.75rem;
  // The panel is narrow beside the preview: one column of options is easier to read.
  :deep(.options-grid) {
    grid-template-columns: 1fr;
  }
}
.customize__title {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}
.customize__status {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
  &:empty {
    display: none;
  }
}
.customize__lead {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.customize__errors {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
  p {
    margin: 0;
  }
}
.customize__kids {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.customize__general {
  margin-top: 1.25rem;
  summary {
    cursor: pointer;
    font-weight: 600;
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
}
.customize__now {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.customize__letter {
  display: grid;
  gap: 1rem;
}
.customize__general-body {
  display: grid;
  gap: 1.25rem;
  margin-top: 0.75rem;
}
</style>
