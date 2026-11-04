<script setup lang="ts">
import { computed } from 'vue'
import { LISTED_TOPICS, TOPIC_GROUPS, type Topic, type TopicId, type TopicNotes } from '../../data/topics'

/**
 * Broad topics from the list, grouped; the letters have real stories for each of them.
 * A picked topic opens one optional field for the child's own favourite ("korvpall").
 */
const model = defineModel<TopicId[]>({ required: true })
const notes = defineModel<TopicNotes>('notes', { default: () => ({}) })
/** Most topics that may be picked, e.g. 3 in the quick profile; the rest are disabled once reached. */
const props = defineProps<{ max?: number }>()

const groups = TOPIC_GROUPS.map((group) => ({
  ...group,
  topics: LISTED_TOPICS.filter((topic) => topic.group === group.id),
}))

const picked = computed(() => new Set(model.value))
const full = computed(() => props.max !== undefined && model.value.length >= props.max)

function toggle(id: TopicId): void {
  model.value = picked.value.has(id) ? model.value.filter((existing) => existing !== id) : [...model.value, id]
}

function pickedIn(topics: Topic[]): Topic[] {
  return topics.filter((topic) => picked.value.has(topic.id))
}

function setNote(id: TopicId, text: string): void {
  notes.value = { ...notes.value, [id]: text }
}
</script>

<template>
  <div class="topics">
    <fieldset v-for="group in groups" :key="group.id" class="topics__group">
      <legend class="topics__legend">{{ group.label }}</legend>
      <div class="topics__options">
        <label
          v-for="topic in group.topics"
          :key="topic.id"
          class="topics__option"
          :class="{ 'is-active': picked.has(topic.id), 'is-disabled': full && !picked.has(topic.id) }"
        >
          <input
            type="checkbox"
            class="visually-hidden"
            :checked="picked.has(topic.id)"
            :disabled="full && !picked.has(topic.id)"
            @change="toggle(topic.id)"
          />
          <span>{{ topic.label }}</span>
        </label>
      </div>
      <div v-if="pickedIn(group.topics).length" class="topics__notes">
        <label v-for="topic in pickedIn(group.topics)" :key="topic.id" class="topics__note">
          <span class="topics__note-label">{{ topic.label }}</span>
          <input
            class="input topics__note-input"
            type="text"
            autocomplete="off"
            :aria-label="`${topic.label}: täpsustus (valikuline)`"
            :placeholder="topic.hint"
            :value="notes[topic.id] ?? ''"
            @input="setNote(topic.id, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </fieldset>
  </div>
</template>

<style scoped lang="scss">
.topics {
  display: grid;
  gap: 0.9rem 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
}
.topics__group {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.topics__legend {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-bottom: 0.4rem;
  padding: 0;
}
.topics__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.topics__option {
  padding: 0.4rem 0.8rem;
  border: 1.5px solid var(--line-strong);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--lavender);
  }
  &.is-active {
    background: var(--lavender-soft);
    border-color: var(--lavender);
    color: var(--lavender-ink);
    font-weight: 600;
  }
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      border-color: var(--line-strong);
    }
  }
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.topics__notes {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.5rem;
}
.topics__note {
  display: grid;
  grid-template-columns: fit-content(10rem) minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
}
.topics__note-label {
  font-size: 0.8rem;
  color: var(--lavender-ink);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.topics__note-input {
  padding-block: 0.35rem;
  font-size: 0.9rem;
}
// On a phone a long topic name would squeeze the field: the name goes above it.
@media (max-width: 480px) {
  .topics__note {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.2rem;
  }
}
</style>
