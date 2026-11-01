<script setup lang="ts">
import { track } from '../../app/analytics'
import { nextTick, ref } from 'vue'
import { Plus, Users } from 'lucide-vue-next'
import type { ChildProfile, ChildProfileDraft } from '../../domain/models'
import BaseButton from '../../components/ui/BaseButton.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { genitive, nameCase } from '../../domain/text/estonian'
import ChildCard from './ChildCard.vue'
import ChildForm from './ChildForm.vue'
import { emptyChildDraft, useChildrenStore } from './childrenStore'

const store = useChildrenStore()
const editing = ref<{ mode: 'add' } | { mode: 'edit'; child: ChildProfile } | null>(null)
const announcement = ref('')

function toDraft(child: ChildProfile): ChildProfileDraft {
  // Omit metadata; the rest is the editable draft.
  const { id, createdAt, updatedAt, ...draft } = child
  return { ...draft, nameGenitive: draft.nameGenitive ?? '' }
}

async function openForm(next: typeof editing.value): Promise<void> {
  editing.value = next
  await nextTick()
  document.getElementById('child-name')?.focus()
}

function save(draft: ChildProfileDraft): void {
  if (editing.value?.mode === 'edit') {
    store.update(editing.value.child.id, draft)
    announcement.value = `${genitive(draft.name, draft.nameGenitive)} profiil on salvestatud.`
  } else {
    store.add(draft)
    track('child_added', { from: 'profiles' })
    announcement.value = `${draft.name} on lisatud.`
  }
  editing.value = null
}

function remove(child: ChildProfile): void {
  if (!window.confirm(`Kas kustutada ${nameCase(child, 'genitive')} profiil?`)) return
  store.remove(child.id)
  announcement.value = `${nameCase(child, 'genitive')} profiil on kustutatud.`
}
</script>

<template>
  <div class="container section">
    <div class="section-head">
      <div>
        <span class="eyebrow">Profiilid</span>
        <h1 class="page-title">Lapsed</h1>
        <p class="muted">
          Profiilid aitavad tekste isikupärastada: nimi, vanus, lugemisoskus, huvid ja lemmikud. Kõik andmed
          jäävad sinu brauserisse.
        </p>
      </div>
      <div v-if="!editing" class="head-actions">
        <BaseButton @click="openForm({ mode: 'add' })"><Plus aria-hidden="true" /> Lisa laps</BaseButton>
      </div>
    </div>

    <p class="visually-hidden" role="status" aria-live="polite">{{ announcement }}</p>

    <ChildForm
      v-if="editing"
      :key="editing.mode === 'edit' ? editing.child.id : 'new'"
      :mode="editing.mode"
      :initial="editing.mode === 'edit' ? toDraft(editing.child) : emptyChildDraft()"
      @save="save"
      @cancel="editing = null"
    />

    <template v-else>
      <EmptyState
        v-if="store.children.length === 0"
        :icon="Users"
        title="Ühtegi profiili veel pole"
        text="Lisa oma lapse profiil – siis teavad kirjad ja lood, kellega räägivad."
      >
        <BaseButton @click="openForm({ mode: 'add' })"><Plus aria-hidden="true" /> Lisa laps</BaseButton>
        <BaseButton variant="secondary" @click="store.restoreDemo()">Kasuta näidisprofiile</BaseButton>
      </EmptyState>
      <ul v-else class="children-grid" role="list">
        <li v-for="child in store.children" :key="child.id">
          <ChildCard :child="child" @edit="openForm({ mode: 'edit', child })" @remove="remove(child)" />
        </li>
      </ul>
      <p v-if="store.children.some((c) => c.id.startsWith('demo-'))" class="demo-note muted">
        Ruben, Jasper ja Brita on näidisprofiilid. Muuda või kustuta need julgelt.
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.page-title {
  font-size: clamp(2rem, 4vw, 2.6rem);
}
.head-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.children-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}
.demo-note {
  margin-top: 1.25rem;
  font-size: 0.9rem;
}
</style>
