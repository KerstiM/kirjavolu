<script setup lang="ts">
import type { ChildProfile, ContentOptionsMap, ContentTypeId, GeneralOptions, OccasionId } from '../../../domain/models'
import { getContentType } from '../../../domain/contentTypes'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { DIFFICULTY_OPTIONS, LENGTH_OPTIONS, TONE_OPTIONS } from '../labels'
import LetterOptionsForm from '../options/LetterOptionsForm.vue'
import TreasureHuntOptionsForm from '../options/TreasureHuntOptionsForm.vue'
import StoryOptionsForm from '../options/StoryOptionsForm.vue'
import PuzzleOptionsForm from '../options/PuzzleOptionsForm.vue'
import CalendarOptionsForm from '../options/CalendarOptionsForm.vue'
import CertificateOptionsForm from '../options/CertificateOptionsForm.vue'

defineProps<{ contentType: ContentTypeId; occasionId: OccasionId; childCount: number; children: ChildProfile[] }>()
const general = defineModel<GeneralOptions>('general', { required: true })
const options = defineModel<ContentOptionsMap>('options', { required: true })
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

    <div class="panel">
      <h3 class="panel__title">Üldine</h3>
      <div class="options-grid">
        <SegmentedControl v-model="general.tone" name="tone" label="Toon" :options="TONE_OPTIONS" />
        <SegmentedControl v-model="general.length" name="length" label="Pikkus" :options="LENGTH_OPTIONS" />
        <SegmentedControl
          v-model="general.difficulty"
          name="difficulty"
          label="Raskusaste"
          :options="DIFFICULTY_OPTIONS"
          hint="Eakohane arvestab iga lapse vanust ja lugemisoskust."
        />
        <div class="options-grid__wide">
          <FormField
            id="general-notes"
            label="Lisasoovid (valikuline)"
            hint="Mallimootor ei tõlgenda vaba teksti – need märkmed kuvatakse sulle eelvaates, et saaksid detailid ise lisada."
          >
            <template #default="{ describedBy }">
              <textarea id="general-notes" v-model="general.notes" class="textarea" rows="2" :aria-describedby="describedBy" />
            </template>
          </FormField>
        </div>
      </div>
    </div>
  </section>
</template>
