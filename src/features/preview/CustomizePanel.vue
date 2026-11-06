<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronDown, SlidersHorizontal } from 'lucide-vue-next'
import type { ChildProfile, ContentOptionsMap, GeneralOptions, GeneratedContent, LanguageLevel } from '../../domain/models'
import { getContentType } from '../../domain/contentTypes'
import { defaultOptions } from '../../domain/defaults'
import { clone } from '../../utils/clone'
import { usesScenarioEngine } from '../../domain/story/scenarioLetters'
import type { RequestFor } from '../../domain/models'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
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
const props = defineProps<{ content: GeneratedContent; busy?: boolean; errors?: string[] }>()
const emit = defineEmits<{ change: [choices: { general: GeneralOptions; options: GeneratedContent['request']['options'] }] }>()

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

// Open beside the preview on a wide screen; on a phone the letters come first.
const open = ref(typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 1024px)').matches)

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
const toddlerNote = computed(() =>
  children.value.some((child) => ageBand(child) === 'toddler')
    ? 'Väikelapsele on lihtne keel väike ettelugemislugu häälitsuste ja liigutustega (lühema kirja puhul ühe rea kaart); rikkalikum keel on samad kirjad, mis 5–7-aastastel.'
    : '',
)
const lengthOptions = computed(() =>
  draft.value.general.length === 'medium' ? [...LETTER_LENGTH_OPTIONS, LEGACY_MEDIUM] : LETTER_LENGTH_OPTIONS,
)

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
  draft.value.options.letter.count >= 7
    ? `${LETTER_LENGTH_HINT} ${draft.value.general.length === 'long' ? 'Pusleplakatil on siis suuremad kaardid.' : 'Lühemad kirjad mahuvad pusleplakati tavalistele kaartidele.'}`
    : LETTER_LENGTH_HINT,
)
</script>

<template>
  <section class="customize no-print" aria-labelledby="customize-title">
    <h2 id="customize-title" class="customize__title">
      <button
        type="button"
        class="customize__toggle"
        :aria-expanded="open"
        aria-controls="customize-body"
        @click="open = !open"
      >
        <SlidersHorizontal aria-hidden="true" :size="18" />
        <span>Kohanda: {{ getContentType(type).title.toLowerCase() }}</span>
        <ChevronDown aria-hidden="true" :size="18" class="customize__chevron" :class="{ 'is-open': open }" />
      </button>
    </h2>
    <p class="customize__status" role="status" aria-live="polite">{{ busy ? 'Uuendan eelvaadet…' : '' }}</p>

    <div v-show="open" id="customize-body" class="customize__body">
      <p class="customize__lead">Valikud on eeltäidetud. Iga muudatus jõuab eelvaatesse kohe.</p>
      <div v-if="errors?.length" class="customize__errors" role="alert">
        <p v-for="error in errors" :key="error">{{ error }}</p>
      </div>

      <LetterOptionsForm
        v-if="type === 'letter'"
        v-model="draft.options.letter"
        :children="children"
        :occasion-id="request.occasionId"
      />
      <TreasureHuntOptionsForm
        v-else-if="type === 'treasure-hunt'"
        v-model="draft.options['treasure-hunt']"
        :multiple-children="children.length > 1"
      />
      <StoryOptionsForm v-else-if="type === 'story'" v-model="draft.options.story" />
      <PuzzleOptionsForm v-else-if="type === 'puzzle'" v-model="draft.options.puzzle" />
      <CalendarOptionsForm v-else-if="type === 'calendar'" v-model="draft.options.calendar" />
      <CertificateOptionsForm v-else v-model="draft.options.certificate" :occasion-id="request.occasionId" />

      <section v-if="letters" class="customize__letter" aria-label="Keel ja pikkus">
        <template v-if="engine">
          <SegmentedControl
            v-for="child in children"
            :key="child.id"
            :model-value="languageOf(child)"
            :name="`language-${child.id}`"
            :label="children.length > 1 ? `Keel: ${child.name}` : 'Kirja keel'"
            :options="LANGUAGE_OPTIONS"
            @update:model-value="setLanguage(child, $event)"
          />
          <p class="customize__hint">{{ LANGUAGE_HINT }}</p>
          <p v-if="toddlerNote" class="customize__hint">{{ toddlerNote }}</p>
        </template>
        <SegmentedControl v-model="draft.general.length" name="length" label="Pikkus" :options="lengthOptions" :hint="lengthHint" />
      </section>
      <details v-else class="customize__general">
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
    </div>
  </section>
</template>

<style scoped lang="scss">
.customize {
  padding: 0.5rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.customize__title {
  margin: 0;
  font-size: 1.1rem;
}
.customize__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.25rem 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  span {
    flex: 1;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
}
.customize__chevron {
  transition: transform 0.15s ease;
  &.is-open {
    transform: rotate(180deg);
  }
}
.customize__status {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
  &:empty {
    display: none;
  }
}
.customize__body {
  padding-bottom: 0.75rem;
  // The panel is narrow beside the preview: one column of options is easier to read.
  :deep(.options-grid) {
    grid-template-columns: 1fr;
  }
}
.customize__lead {
  margin: 0.25rem 0 1rem;
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
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}
.customize__hint {
  margin: -0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.customize__general-body {
  display: grid;
  gap: 1.25rem;
  margin-top: 0.75rem;
}
</style>
