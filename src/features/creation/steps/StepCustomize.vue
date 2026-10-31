<script setup lang="ts">
import { computed } from 'vue'
import type { ChildProfile, ContentOptionsMap, ContentTypeId, GeneralOptions, OccasionId } from '../../../domain/models'
import { getContentType } from '../../../domain/contentTypes'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { DIFFICULTY_OPTIONS, LENGTH_OPTIONS, TONE_OPTIONS } from '../labels'
import LetterOptionsForm from '../options/LetterOptionsForm.vue'
import TreasureHuntOptionsForm from '../options/TreasureHuntOptionsForm.vue'
import StoryOptionsForm from '../options/StoryOptionsForm.vue'
import PuzzleOptionsForm from '../options/PuzzleOptionsForm.vue'
import CalendarOptionsForm from '../options/CalendarOptionsForm.vue'
import CertificateOptionsForm from '../options/CertificateOptionsForm.vue'

const props = defineProps<{ contentType: ContentTypeId; occasionId: OccasionId; childCount: number; children: ChildProfile[] }>()
const general = defineModel<GeneralOptions>('general', { required: true })
const options = defineModel<ContentOptionsMap>('options', { required: true })

const labelOf = <T,>(list: { value: T; label: string }[], value: T) => list.find((o) => o.value === value)?.label ?? ''
const generalSummary = computed(() =>
  [labelOf(TONE_OPTIONS, general.value.tone), labelOf(LENGTH_OPTIONS, general.value.length), labelOf(DIFFICULTY_OPTIONS, general.value.difficulty)]
    .join(' · ')
    .toLowerCase(),
)
// Long series are kept short enough for the puzzle poster cards unless "Pikk" is chosen.
const lengthHint = computed(() =>
  props.contentType === 'letter' && options.value.letter.count >= 7
    ? 'Sarja kirjad mahuvad lühikese ja keskmise pikkusega pusleplakati kaartidele. „Pikk“ sobib tervele või poolele lehele.'
    : '',
)
</script>

<template>
  <section aria-labelledby="step-customize-title">
    <h2 id="step-customize-title" class="step-title">Kohanda</h2>
    <p class="step-lead">Kõik valikud on eeltäidetud mõistlike vaikeväärtustega – muuda ainult seda, mida soovid.</p>

    <div class="panel">
      <h3 class="panel__title">{{ getContentType(contentType).title }}</h3>
      <LetterOptionsForm
        v-if="contentType === 'letter'"
        v-model="options.letter"
        :children="children"
        :occasion-id="occasionId"
      />
      <TreasureHuntOptionsForm
        v-else-if="contentType === 'treasure-hunt'"
        v-model="options['treasure-hunt']"
        :multiple-children="childCount > 1"
      />
      <StoryOptionsForm v-else-if="contentType === 'story'" v-model="options.story" />
      <PuzzleOptionsForm v-else-if="contentType === 'puzzle'" v-model="options.puzzle" />
      <CalendarOptionsForm v-else-if="contentType === 'calendar'" v-model="options.calendar" />
      <CertificateOptionsForm v-else v-model="options.certificate" :occasion-id="occasionId" />
    </div>

    <details class="panel general">
      <summary class="panel__title general__summary">
        Toon, pikkus ja raskusaste <span class="general__now">{{ generalSummary }}</span>
      </summary>
      <div class="options-grid general__body">
        <SegmentedControl v-model="general.tone" name="tone" label="Toon" :options="TONE_OPTIONS" />
        <SegmentedControl v-model="general.length" name="length" label="Pikkus" :options="LENGTH_OPTIONS" :hint="lengthHint" />
        <SegmentedControl
          v-model="general.difficulty"
          name="difficulty"
          label="Raskusaste"
          :options="DIFFICULTY_OPTIONS"
          hint="Eakohane arvestab iga lapse vanust ja lugemisoskust."
        />
      </div>
    </details>
  </section>
</template>

<style scoped lang="scss">
.general__summary {
  cursor: pointer;
  margin: 0;
}
.general__now {
  margin-left: 0.4rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--ink-soft);
}
.general__body {
  margin-top: 1rem;
}
</style>
