<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { FileText, Trash2 } from 'lucide-vue-next'
import EmptyState from '../../components/ui/EmptyState.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import { iconFor } from '../../components/ui/icons'
import { getContentType } from '../../domain/contentTypes'
import { useCreationsStore } from '../preview/creationsStore'

const store = useCreationsStore()

function formatCreated(iso: string): string {
  return new Date(iso).toLocaleDateString('et-EE', { day: 'numeric', month: 'long' })
}

function remove(id: string, title: string): void {
  if (window.confirm(`Kas kustutada „${title}“?`)) store.remove(id)
}
</script>

<template>
  <section class="section" aria-labelledby="recent-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 id="recent-title">Minu loomingud</h2>
          <p class="muted">Salvestatud sinu brauserisse. Ava, muuda ja prindi uuesti.</p>
        </div>
      </div>
      <EmptyState
        v-if="store.creations.length === 0"
        :icon="FileText"
        title="Siin on veel vaikne"
        text="Kui lood esimese kirja, aardejahi või loo, ilmub see siia."
      >
        <BaseButton to="/loo">Loo esimene</BaseButton>
      </EmptyState>
      <ul v-else class="recent" role="list">
        <li v-for="creation in store.creations" :key="creation.id" class="recent__item">
          <span class="recent__icon" aria-hidden="true">
            <component :is="iconFor(getContentType(creation.request.contentType).icon)" :size="20" />
          </span>
          <div class="recent__text">
            <RouterLink :to="`/looming/${creation.id}`" class="recent__title">{{ creation.title }}</RouterLink>
            <span class="recent__meta">
              {{ creation.subtitle }} · {{ creation.items.length }} osa · {{ formatCreated(creation.createdAt) }}
            </span>
          </div>
          <button
            type="button"
            class="recent__delete"
            :aria-label="`Kustuta ${creation.title}`"
            @click="remove(creation.id, creation.title)"
          >
            <Trash2 :size="18" />
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.recent {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.6rem;
}
.recent__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  transition: box-shadow 0.15s ease;
  &:hover {
    box-shadow: var(--shadow-sm);
  }
}
.recent__icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 10px;
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  flex-shrink: 0;
}
.recent__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.recent__title {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }
  &:hover {
    color: var(--lavender-ink);
  }
}
.recent__meta {
  font-size: 0.85rem;
  color: var(--ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.recent__delete {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-faint);
  cursor: pointer;
  &:hover {
    background: #fdecea;
    color: var(--danger);
  }
}
</style>
