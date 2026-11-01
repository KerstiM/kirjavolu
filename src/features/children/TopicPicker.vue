<script setup lang="ts">
import { computed } from 'vue'
import { TOPIC_GROUPS, TOPICS, type TopicId } from '../../data/topics'

/** Topics from the list, grouped; the letters have real stories for each of them. */
const model = defineModel<TopicId[]>({ required: true })

const groups = TOPIC_GROUPS.map((group) => ({
  ...group,
  topics: TOPICS.filter((topic) => topic.group === group.id),
}))

const picked = computed(() => new Set(model.value))

function toggle(id: TopicId): void {
  model.value = picked.value.has(id) ? model.value.filter((existing) => existing !== id) : [...model.value, id]
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
          :class="{ 'is-active': picked.has(topic.id) }"
        >
          <input
            type="checkbox"
            class="visually-hidden"
            :checked="picked.has(topic.id)"
            @change="toggle(topic.id)"
          />
          <span>{{ topic.label }}</span>
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
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
</style>
