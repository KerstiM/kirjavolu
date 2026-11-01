<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronDown, SlidersHorizontal } from 'lucide-vue-next'
import type { ContentOptionsMap, GeneralOptions, GeneratedContent } from '../../domain/models'
import { getContentType } from '../../domain/contentTypes'
import { defaultOptions } from '../../domain/defaults'
import { clone } from '../../utils/clone'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import { DIFFICULTY_OPTIONS, LENGTH_OPTIONS, TONE_OPTIONS } from '../creation/labels'
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
// Once the parent agrees to lose hand-made changes, the next changes do not ask again.
let confirmed = false
watch(
  draft,
  () => {
    clearTimeout(timer)
    timer = setTimeout(send, DEBOUNCE_MS)
  },
  { deep: true },
)
onBeforeUnmount(() => clearTimeout(timer))

function send(): void {
  if (unchanged()) return
  const ownChanges = props.content.items.some((item) => item.edited || item.variant > 0)
  if (ownChanges && !confirmed) {
    confirmed = window.confirm('Oled tekste käsitsi muutnud või valinud uue variandi. Uued valikud loovad tekstid uuesti ja need muudatused kaovad. Jätkan?')
    if (!confirmed) {
      draft.value = choicesOf(props.content)
      return
    }
  }
  emit('change', { general: clone(draft.value.general), options: clone(draft.value.options[type.value]) })
}

// Open beside the preview on a wide screen; on a phone the letters come first.
const open = ref(typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 1024px)').matches)

const labelOf = <T,>(list: { value: T; label: string }[], value: T) => list.find((o) => o.value === value)?.label ?? ''
const generalSummary = computed(() =>
  [
    labelOf(TONE_OPTIONS, draft.value.general.tone),
    labelOf(LENGTH_OPTIONS, draft.value.general.length),
    labelOf(DIFFICULTY_OPTIONS, draft.value.general.difficulty),
  ]
    .join(' · ')
    .toLowerCase(),
)
// Long series are kept short enough for the puzzle poster cards unless "Pikk" is chosen.
const lengthHint = computed(() =>
  type.value === 'letter' && draft.value.options.letter.count >= 7
    ? 'Sarja kirjad mahuvad lühikese ja keskmise pikkusega pusleplakati kaartidele. „Pikk“ sobib tervele või poolele lehele.'
    : '',
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

      <details class="customize__general">
        <summary>
          Toon, pikkus ja raskusaste <span class="customize__now">{{ generalSummary }}</span>
        </summary>
        <div class="customize__general-body">
          <SegmentedControl v-model="draft.general.tone" name="tone" label="Toon" :options="TONE_OPTIONS" />
          <SegmentedControl
            v-model="draft.general.length"
            name="length"
            label="Pikkus"
            :options="LENGTH_OPTIONS"
            :hint="lengthHint"
          />
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
.customize__general-body {
  display: grid;
  gap: 1.25rem;
  margin-top: 0.75rem;
}
</style>
