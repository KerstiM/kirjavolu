<script setup lang="ts">
import type { CertificateOptions, OccasionId } from '../../../domain/models'
import { DEFAULT_ACHIEVEMENTS } from '../../../domain/generators/certificateGenerator'
import FormField from '../../../components/ui/FormField.vue'
import SegmentedControl from '../../../components/ui/SegmentedControl.vue'
import { CERTIFICATE_FORMAT_OPTIONS, CERTIFICATE_STYLE_OPTIONS } from '../labels'

defineProps<{ occasionId: OccasionId }>()
const model = defineModel<CertificateOptions>({ required: true })
</script>

<template>
  <div class="options-grid">
    <SegmentedControl v-model="model.format" name="cert-format" label="Vorm" :options="CERTIFICATE_FORMAT_OPTIONS" />
    <SegmentedControl v-model="model.style" name="cert-style" label="Stiil" :options="CERTIFICATE_STYLE_OPTIONS" />
    <FormField
      v-if="model.format === 'diploma'"
      id="cert-achievement"
      label="Saavutus"
      :hint="`Kirjuta „eest“ või „puhul“ vormis. Tühjaks jättes: „${DEFAULT_ACHIEVEMENTS[occasionId]}“.`"
    >
      <template #default="{ describedBy }">
        <input
          id="cert-achievement"
          v-model="model.achievement"
          class="input"
          type="text"
          :placeholder="DEFAULT_ACHIEVEMENTS[occasionId]"
          :aria-describedby="describedBy"
        />
      </template>
    </FormField>
    <FormField id="cert-issuer" label="Allkiri" hint="Näiteks „Ema ja isa“ või „Päkapikk Tuduja“.">
      <template #default="{ describedBy }">
        <input id="cert-issuer" v-model="model.issuer" class="input" type="text" :aria-describedby="describedBy" />
      </template>
    </FormField>
    <div class="options-grid__wide">
      <FormField id="cert-message" label="Isiklik sõnum (valikuline)">
        <template #default="{ describedBy }">
          <textarea id="cert-message" v-model="model.message" class="textarea" rows="3" :aria-describedby="describedBy" />
        </template>
      </FormField>
    </div>
  </div>
</template>
