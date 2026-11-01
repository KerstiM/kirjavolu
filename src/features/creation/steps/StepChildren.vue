<script setup lang="ts">
import { computed } from 'vue'
import { Plus, UsersRound } from 'lucide-vue-next'
import type { ChildProfile } from '../../../domain/models'
import { READING_LEVEL_LABELS } from '../../../domain/models'
import { ageLabel } from '../../../domain/text/estonian'
import ChoiceCard from '../../../components/ui/ChoiceCard.vue'
import BaseButton from '../../../components/ui/BaseButton.vue'
import EmptyState from '../../../components/ui/EmptyState.vue'

const props = defineProps<{ children: ChildProfile[]; selected: string[] }>()
const emit = defineEmits<{ toggle: [id: string]; selectAll: []; add: [] }>()

const shared = computed(() => props.selected.length > 1)
</script>

<template>
  <section aria-labelledby="step-children-title">
    <h2 id="step-children-title" class="step-title">Kellele?</h2>
    <p class="step-lead">Vali üks või mitu last. Mitme lapse puhul tekib ühine elamus õdedele-vendadele.</p>

    <EmptyState
      v-if="children.length === 0"
      :icon="UsersRound"
      title="Profiile pole veel"
      text="Lisa laps – piisab nimest ja vanusest. Tekstid kõnetavad teda nimepidi."
    >
      <BaseButton @click="emit('add')"><Plus aria-hidden="true" /> Lisa laps</BaseButton>
    </EmptyState>

    <template v-else>
      <div class="choice-grid" role="group" aria-labelledby="step-children-title">
        <ChoiceCard
          v-for="child in children"
          :key="child.id"
          role="checkbox"
          tone="coral"
          :title="child.name"
          :description="`${ageLabel(child.age)} · ${READING_LEVEL_LABELS[child.readingLevel]}`"
          :selected="selected.includes(child.id)"
          @select="emit('toggle', child.id)"
        />
      </div>
      <div class="step-actions-inline">
        <BaseButton variant="ghost" size="sm" @click="emit('add')"><Plus aria-hidden="true" /> Lisa laps</BaseButton>
        <BaseButton v-if="children.length > 1" variant="ghost" size="sm" @click="emit('selectAll')">Vali kõik</BaseButton>
        <BaseButton variant="ghost" size="sm" to="/lapsed">Halda profiile</BaseButton>
      </div>
      <p v-if="shared" class="info-note" role="status">
        <strong>Ühine elamus.</strong> Tekstid pöörduvad kõigi poole korraga ja ülesanded jagatakse laste vahel
        vastavalt vanusele. Kõige pisematele on mõeldud lihtsad tegevused, mida teeb kaasa täiskasvanu.
      </p>
    </template>
  </section>
</template>
