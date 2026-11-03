<script setup lang="ts">
import { ref, watch } from 'vue'
import { CalendarDays } from 'lucide-vue-next'

/**
 * A date always shown the Estonian way, 24.12.2026. The browser's own date field takes its
 * format from the computer's language (12/24/2026 on an English one), which a page cannot
 * change; here the text field is ours and the calendar button opens the browser's picker.
 * The model stays an ISO date (2026-12-24), as everywhere else in the app.
 */
const props = defineProps<{ id?: string; min?: string; max?: string; describedBy?: string; label?: string }>()
const model = defineModel<string>({ required: true })

const toText = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return match ? `${match[3]}.${match[2]}.${match[1]}` : ''
}
/** "24.12.2026", "24.12.26", "24/12/2026" or "24-12-2026" → ISO; null when it is not a real date. */
function toIso(text: string): string | null {
  const match = /^\s*(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})\s*$/.exec(text)
  if (!match) return null
  const [day, month] = [Number(match[1]), Number(match[2])]
  const year = match[3]!.length === 2 ? 2000 + Number(match[3]) : Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date.toISOString().slice(0, 10)
}

const text = ref(toText(model.value))
const invalid = ref(false)
watch(model, (value) => {
  text.value = toText(value)
  invalid.value = false
})

function commit(): void {
  if (!text.value.trim()) {
    invalid.value = false
    model.value = ''
    return
  }
  const iso = toIso(text.value)
  const outside = !!iso && ((!!props.min && iso < props.min) || (!!props.max && iso > props.max))
  invalid.value = !iso || outside
  if (iso && !outside) {
    model.value = iso
    text.value = toText(iso)
  }
}

const picker = ref<HTMLInputElement | null>(null)
function openPicker(): void {
  const input = picker.value
  if (!input) return
  try {
    input.showPicker()
  } catch {
    // Older browsers without showPicker: focusing still opens it on most phones.
    input.focus()
  }
}
</script>

<template>
  <span class="date-input" :class="{ 'is-invalid': invalid }">
    <input
      :id="id"
      v-model="text"
      class="input date-input__text"
      type="text"
      inputmode="numeric"
      placeholder="pp.kk.aaaa"
      autocomplete="off"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      @change="commit"
      @blur="commit"
    />
    <button type="button" class="date-input__open" :aria-label="label ? `${label}: ava kalender` : 'Ava kalender'" @click="openPicker">
      <CalendarDays :size="18" aria-hidden="true" />
    </button>
    <input
      ref="picker"
      v-model="model"
      class="date-input__picker"
      type="date"
      tabindex="-1"
      aria-hidden="true"
      :min="min"
      :max="max"
    />
  </span>
</template>

<style scoped lang="scss">
.date-input {
  position: relative;
  display: flex;
  align-items: stretch;
  min-width: 0;
}
.date-input__text {
  flex: 1;
  min-width: 0;
  padding-right: 2.75rem;
  font-variant-numeric: tabular-nums;
}
.is-invalid .date-input__text {
  border-color: var(--danger);
}
.date-input__open {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  transform: translateY(-50%);
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--ink-soft);
  cursor: pointer;
  &:hover {
    background: var(--bg-deep);
    color: var(--ink);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
  }
}
// The browser's picker opens from here; it is never seen or reached with Tab.
.date-input__picker {
  position: absolute;
  right: 0.35rem;
  bottom: 0;
  width: 2.1rem;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
