<script setup lang="ts">
import type { StoryOptions } from '../../../domain/models'
import FormField from '../../../components/ui/FormField.vue'
import ListInput from '../../../components/ui/ListInput.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { GENRE_OPTIONS, THEME_OPTIONS } from '../labels'

const model = defineModel<StoryOptions>({ required: true })
</script>

<template>
  <div class="options-grid">
    <div class="options-grid__wide">
      <SegmentedControl v-model="model.genre" name="story-genre" label="Žanr" :options="GENRE_OPTIONS" />
    </div>
    <FormField id="story-characters" label="Kaasa tulevad tegelased" hint="Mänguasjad või lemmikloomad, nt kaisukaru Mõmmi, kass Miisu.">
      <template #default="{ describedBy }">
        <ListInput id="story-characters" v-model="model.extraCharacters" :described-by="describedBy" />
      </template>
    </FormField>
    <FormField id="story-theme" label="Õpetlik teema (valikuline)">
      <template #default="{ describedBy }">
        <select id="story-theme" v-model="model.theme" class="select" :aria-describedby="describedBy">
          <option v-for="option in THEME_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </template>
    </FormField>
  </div>
</template>
