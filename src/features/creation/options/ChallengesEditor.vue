<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import type { ChallengeKind, ChildChallenge, ChildProfile } from '../../../domain/models'
import { CHALLENGES } from '../../../data/templates/challenges'
import { ageBand } from '../../../domain/generators/audience'
import { addDays } from '../../../domain/text/estonian'
import { createId } from '../../../utils/id'

/** Personal challenges, e.g. sweets-free days; an older sibling supports in secret. */
const props = defineProps<{ children: ChildProfile[]; startDate: string; count: number }>()
const challenges = defineModel<ChildChallenge[] | undefined>({ required: true })

const readers = computed(() => props.children.filter((child) => ageBand(child) !== 'toddler'))
const kinds = Object.entries(CHALLENGES) as [ChallengeKind, (typeof CHALLENGES)[ChallengeKind]][]
const list = computed(() => challenges.value ?? [])
const lastDate = computed(() => (props.startDate ? addDays(props.startDate, props.count - 1) : ''))

function add(): void {
  const child = readers.value[readers.value.length - 1]
  if (!child || !props.startDate) return
  const start = addDays(props.startDate, Math.min(props.count - 3, 10))
  challenges.value = [
    ...list.value,
    { id: createId(), childId: child.id, kind: 'no-sweets', start, end: addDays(start, 2), title: '' },
  ]
}

function patch(id: string, change: Partial<ChildChallenge>): void {
  challenges.value = list.value.map((challenge) => (challenge.id === id ? { ...challenge, ...change } : challenge))
}

function remove(id: string): void {
  challenges.value = list.value.filter((challenge) => challenge.id !== id)
}
</script>

<template>
  <fieldset v-if="readers.length > 0" class="challenges">
    <legend>Lapse väljakutsed</legend>
    <p class="challenges__hint">
      Näiteks kommideta päevad. Laps saab esimesel päeval kutse ja viimasel
      {{ children.length > 1 ? 'kiituse, vanem õde või vend aga salajase palve teda toetada.' : 'kiituse.' }}
    </p>
    <div v-for="challenge in list" :key="challenge.id" class="challenge">
      <label class="challenge__field">
        <span class="challenge__label">Laps</span>
        <select class="select" :value="challenge.childId" @change="patch(challenge.id, { childId: ($event.target as HTMLSelectElement).value })">
          <option v-for="child in readers" :key="child.id" :value="child.id">{{ child.name }}</option>
        </select>
      </label>
      <label class="challenge__field">
        <span class="challenge__label">Väljakutse</span>
        <select class="select" :value="challenge.kind" @change="patch(challenge.id, { kind: ($event.target as HTMLSelectElement).value as ChallengeKind })">
          <option v-for="[kind, template] in kinds" :key="kind" :value="kind">{{ template.label }}</option>
        </select>
      </label>
      <label class="challenge__field">
        <span class="challenge__label">Algus</span>
        <input class="input" type="date" :value="challenge.start" :min="startDate" :max="lastDate" @input="patch(challenge.id, { start: ($event.target as HTMLInputElement).value })" />
      </label>
      <label class="challenge__field">
        <span class="challenge__label">Lõpp</span>
        <input class="input" type="date" :value="challenge.end" :min="challenge.start || startDate" :max="lastDate" @input="patch(challenge.id, { end: ($event.target as HTMLInputElement).value })" />
      </label>
      <button type="button" class="challenge__remove" :aria-label="`Eemalda väljakutse ${CHALLENGES[challenge.kind].label}`" @click="remove(challenge.id)">
        <Trash2 :size="16" aria-hidden="true" />
      </button>
      <label v-if="challenge.kind === 'custom'" class="challenge__field challenge__field--wide">
        <span class="challenge__label">Mis väljakutse?</span>
        <input class="input" type="text" :value="challenge.title" placeholder="nt magan oma voodis" @input="patch(challenge.id, { title: ($event.target as HTMLInputElement).value })" />
      </label>
    </div>
    <button type="button" class="challenges__add" :disabled="!startDate" @click="add">
      <Plus :size="16" aria-hidden="true" /> Lisa väljakutse
    </button>
  </fieldset>
</template>

<style scoped lang="scss">
.challenges {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  legend {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.35rem;
    padding: 0;
  }
}
.challenges__hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.challenge {
  display: grid;
  grid-template-columns: 8rem 11rem 10rem 10rem auto;
  gap: 0.5rem 0.6rem;
  align-items: end;
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
.challenge__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.challenge__field--wide {
  grid-column: 1 / -1;
}
.challenge__label {
  font-size: 0.8rem;
  font-weight: 600;
}
.challenge__remove {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--ink-faint);
  cursor: pointer;
  &:hover {
    color: var(--danger);
    border-color: rgba(179, 38, 30, 0.35);
  }
}
.challenges__add {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.9rem;
  border: 1.5px dashed var(--line-strong);
  border-radius: 999px;
  background: transparent;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--lavender-ink);
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: var(--lavender);
    background: var(--lavender-soft);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
@media (max-width: 760px) {
  .challenge {
    grid-template-columns: 1fr 1fr auto;
  }
}
</style>
