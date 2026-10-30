<script setup lang="ts">
import type { PuzzleOptions } from '../../../domain/models'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { PUZZLE_KIND_OPTIONS } from '../labels'

const model = defineModel<PuzzleOptions>({ required: true })
</script>

<template>
  <div class="options-grid">
    <div class="options-grid__wide">
      <SegmentedControl v-model="model.kind" name="puzzle-kind" label="Ülesannete tüüp" :options="PUZZLE_KIND_OPTIONS" />
    </div>
    <FormField id="puzzle-count" label="Ülesannete arv" :hint="`${model.challengeCount} ülesannet`">
      <template #default="{ describedBy }">
        <input
          id="puzzle-count"
          v-model.number="model.challengeCount"
          class="range"
          type="range"
          min="1"
          max="12"
          :aria-describedby="describedBy"
        />
      </template>
    </FormField>
    <FormField
      id="puzzle-secret"
      label="Salakood lõpus (valikuline)"
      hint="Näiteks „Vaata diivani alla“. Viimane ülesanne kodeerib selle lause."
    >
      <template #default="{ describedBy }">
        <input id="puzzle-secret" v-model="model.secretCode" class="input" type="text" maxlength="40" :aria-describedby="describedBy" />
      </template>
    </FormField>
  </div>
</template>
