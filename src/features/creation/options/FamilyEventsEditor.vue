<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import type { ChildProfile, EventKind, FamilyEvent } from '../../../domain/models'
import { EVENT_TEMPLATES } from '../../../data/templates/events'
import { eventIndex } from '../../../domain/generators/familyEvents'
import { addDays, formatDayMonth } from '../../../domain/text/estonian'
import { createId } from '../../../utils/id'

/** Family events with dates; the letter of that day talks about the event. */
const props = defineProps<{ children: ChildProfile[]; startDate: string; count: number }>()
const events = defineModel<FamilyEvent[] | undefined>('events', { required: true })
const sundaySweets = defineModel<boolean | undefined>('sundaySweets', { required: true })

const kinds = Object.entries(EVENT_TEMPLATES) as [EventKind, (typeof EVENT_TEMPLATES)[EventKind]][]
const lastDate = computed(() => (props.startDate ? addDays(props.startDate, props.count - 1) : ''))
const list = computed(() => events.value ?? [])

function add(): void {
  const date = props.startDate ? addDays(props.startDate, Math.min(props.count - 1, list.value.length * 3 + 4)) : ''
  events.value = [...list.value, { id: createId(), date, kind: 'forest', title: '', participants: [] }]
}

function patch(id: string, change: Partial<FamilyEvent>): void {
  events.value = list.value.map((event) => (event.id === id ? { ...event, ...change } : event))
}

function remove(id: string): void {
  events.value = list.value.filter((event) => event.id !== id)
}

function toggleParticipant(event: FamilyEvent, childId: string): void {
  // An empty list means everybody; the first unticked child turns it into an explicit list.
  const current = event.participants.length === 0 ? props.children.map((c) => c.id) : event.participants
  const next = current.includes(childId) ? current.filter((id) => id !== childId) : [...current, childId]
  patch(event.id, { participants: next.length === props.children.length ? [] : next })
}

function isIn(event: FamilyEvent, childId: string): boolean {
  return event.participants.length === 0 || event.participants.includes(childId)
}

function outOfRange(event: FamilyEvent): boolean {
  return !!event.date && eventIndex(event, props.startDate, props.count) === null
}
</script>

<template>
  <fieldset class="events">
    <legend>Pere sündmused</legend>
    <p class="events__hint">
      Lisa päevad, mil midagi erilist juhtub. Selle päeva kiri räägib sündmusest – iga laps omal moel.
      <template v-if="startDate">Kirjad on vahemikus {{ formatDayMonth(startDate) }} – {{ formatDayMonth(lastDate) }}.</template>
    </p>
    <p v-if="!startDate" class="events__warn">Sündmuste jaoks vali ülal esimese kirja kuupäev.</p>

    <div v-for="event in list" :key="event.id" class="event">
      <label class="event__field">
        <span class="event__label">Kuupäev</span>
        <input
          class="input"
          type="date"
          :value="event.date"
          :min="startDate"
          :max="lastDate"
          @input="patch(event.id, { date: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="event__field">
        <span class="event__label">Sündmus</span>
        <select class="select" :value="event.kind" @change="patch(event.id, { kind: ($event.target as HTMLSelectElement).value as EventKind })">
          <option v-for="[kind, template] in kinds" :key="kind" :value="kind">{{ template.label }}</option>
        </select>
      </label>
      <label class="event__field event__field--wide">
        <span class="event__label">Täpsustus (valikuline)</span>
        <input
          class="input"
          type="text"
          :value="event.title"
          :placeholder="EVENT_TEMPLATES[event.kind].placeholder"
          @input="patch(event.id, { title: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <button type="button" class="event__remove" :aria-label="`Eemalda sündmus ${EVENT_TEMPLATES[event.kind].label}`" @click="remove(event.id)">
        <Trash2 :size="16" aria-hidden="true" />
      </button>
      <div v-if="children.length > 1" class="event__who" role="group" :aria-label="`${EVENT_TEMPLATES[event.kind].label}: osalejad`">
        <label v-for="child in children" :key="child.id" class="check">
          <input type="checkbox" :checked="isIn(event, child.id)" @change="toggleParticipant(event, child.id)" />
          <span>{{ child.name }}</span>
        </label>
      </div>
      <p v-if="outOfRange(event)" class="events__warn event__note">See kuupäev jääb kirjade vahemikust välja.</p>
    </div>

    <button type="button" class="events__add" :disabled="!startDate" @click="add">
      <Plus :size="16" aria-hidden="true" /> Lisa sündmus
    </button>

    <label class="check events__rule">
      <input type="checkbox" :checked="!!sundaySweets" @change="sundaySweets = !sundaySweets" />
      <span>Maiustused ainult pühapäeviti – pühapäeva kirjades on komm, teistel päevadel midagi muud</span>
    </label>
  </fieldset>
</template>

<style scoped lang="scss">
.events {
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
.events__hint,
.events__warn {
  margin: 0;
  font-size: 0.85rem;
}
.events__hint {
  color: var(--ink-soft);
}
.events__warn {
  color: #7a5410;
}
.event {
  display: grid;
  grid-template-columns: 10rem 12rem 1fr auto;
  gap: 0.5rem 0.6rem;
  align-items: end;
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
.event__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.event__label {
  font-size: 0.8rem;
  font-weight: 600;
}
.event__remove {
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
.event__who {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.event__note {
  grid-column: 1 / -1;
}
.events__add {
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
.events__rule {
  align-self: flex-start;
  margin-top: 0.4rem;
}
@media (max-width: 720px) {
  .event {
    grid-template-columns: 1fr 1fr auto;
  }
  .event__field--wide {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}
// On a phone the date shares a row with the remove button; the event and its detail get full rows.
@media (max-width: 520px) {
  .event {
    grid-template-columns: 1fr auto;
  }
  .event__remove {
    grid-column: 2;
    grid-row: 1;
  }
  .event__field:not(:first-child) {
    grid-column: 1 / -1;
    grid-row: auto;
  }
}
</style>
