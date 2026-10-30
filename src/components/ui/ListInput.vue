<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Text input for short lists. Entries are separated by commas; the model is a
 * string array so domain code never has to parse text.
 */
const props = defineProps<{ id: string; placeholder?: string; describedBy?: string }>()
const model = defineModel<string[]>({ required: true })

const text = ref(model.value.join(', '))

watch(model, (value) => {
  const parsed = parse(text.value)
  if (parsed.join('|') !== value.join('|')) text.value = value.join(', ')
})

function parse(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function onInput(event: Event): void {
  text.value = (event.target as HTMLInputElement).value
  model.value = parse(text.value)
}
</script>

<template>
  <input
    :id="props.id"
    class="input"
    type="text"
    :value="text"
    :placeholder="placeholder"
    :aria-describedby="describedBy"
    @input="onInput"
  />
</template>
