<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { ChildProfile } from '../../domain/models'
import { READING_LEVEL_LABELS } from '../../domain/models'
import { ageLabel, nameCase } from '../../domain/text/estonian'

const props = defineProps<{ child: ChildProfile }>()
defineEmits<{ edit: []; remove: [] }>()

const palette = ['lavender', 'coral', 'sage', 'gold'] as const
const tone = computed(() => palette[props.child.name.length % palette.length])
const tags = computed(() => [...props.child.interests, ...props.child.favorites, ...props.child.foods].slice(0, 6))
</script>

<template>
  <article class="child-card" :class="`tone-${tone}`">
    <div class="child-card__head">
      <span class="avatar" aria-hidden="true">{{ child.name.charAt(0) }}</span>
      <div class="child-card__id">
        <h3>{{ child.name }}</h3>
        <p>{{ ageLabel(child.age) }} · {{ READING_LEVEL_LABELS[child.readingLevel] }}</p>
      </div>
    </div>
    <p v-if="child.details || child.personality" class="child-card__details">
      {{ child.details || child.personality }}
    </p>
    <ul v-if="tags.length" class="tags" role="list" aria-label="Huvid ja lemmikud">
      <li v-for="tag in tags" :key="tag">{{ tag }}</li>
    </ul>
    <div class="child-card__actions">
      <button type="button" class="icon-btn" :aria-label="`Muuda ${nameCase(child, 'genitive')} profiili`" @click="$emit('edit')">
        <Pencil :size="16" aria-hidden="true" /> Muuda
      </button>
      <button type="button" class="icon-btn icon-btn--danger" :aria-label="`Kustuta ${nameCase(child, 'genitive')} profiil`" @click="$emit('remove')">
        <Trash2 :size="16" aria-hidden="true" /> Kustuta
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
.child-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  height: 100%;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
.tone-lavender {
  --tone-soft: var(--lavender-soft);
  --tone-ink: var(--lavender-ink);
}
.tone-coral {
  --tone-soft: var(--coral-soft);
  --tone-ink: var(--coral-ink);
}
.tone-sage {
  --tone-soft: var(--sage-soft);
  --tone-ink: var(--sage-ink);
}
.tone-gold {
  --tone-soft: var(--gold-soft);
  --tone-ink: #8a5f10;
}
.child-card__head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.avatar {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--tone-soft);
  color: var(--tone-ink);
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
}
.child-card__id {
  h3 {
    margin: 0;
    font-size: 1.25rem;
  }
  p {
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink-soft);
  }
}
.child-card__details {
  margin: 0;
  font-size: 0.93rem;
  color: var(--ink-soft);
  line-height: 1.5;
}
.tags {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  li {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: var(--tone-soft);
    color: var(--tone-ink);
    font-size: 0.8rem;
    font-weight: 600;
  }
}
.child-card__actions {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.5rem;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    border-color: var(--lavender);
    color: var(--lavender-ink);
  }
}
.icon-btn--danger:hover {
  border-color: rgba(179, 38, 30, 0.4);
  color: var(--danger);
  background: #fdecea;
}
</style>
