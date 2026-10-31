<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RefreshCw, X } from 'lucide-vue-next'
import type { GeneratedItem } from '../../domain/models'

/**
 * Editor for one item, opened from the card's "Muuda" button in every layout.
 * Changes apply only when saved.
 */
const props = defineProps<{ item: GeneratedItem; title: string; busy?: boolean; fitHint?: boolean }>()
const emit = defineEmits<{
  save: [patch: Pick<GeneratedItem, 'heading' | 'body' | 'signature'>]
  regenerate: []
  close: []
}>()

const draft = reactive({
  heading: props.item.heading,
  body: props.item.body,
  signature: props.item.signature ?? '',
})
const bodyField = ref<HTMLTextAreaElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const rows = computed(() => Math.min(16, Math.max(5, Math.ceil(draft.body.length / 55) + draft.body.split('\n').length)))
const words = computed(() => draft.body.trim().split(/\s+/).filter(Boolean).length)
let previousFocus: Element | null = null

function save(): void {
  emit('save', {
    heading: draft.heading.trim(),
    body: draft.body.trim(),
    signature: draft.signature.trim() || undefined,
  })
}

// Keep keyboard focus inside the dialog while it is open.
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>('button, input, textarea')].filter((el) => !el.hasAttribute('disabled'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

onMounted(async () => {
  previousFocus = document.activeElement
  await nextTick()
  bodyField.value?.focus()
})
onBeforeUnmount(() => {
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <div class="backdrop no-print" @click.self="emit('close')">
    <div
      ref="dialog"
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-editor-title"
      @keydown="onKeydown"
    >
      <header class="dialog__head">
        <h2 id="item-editor-title">Muuda: {{ title }}</h2>
        <button type="button" class="dialog__close" aria-label="Sulge" @click="emit('close')"><X :size="18" /></button>
      </header>
      <form class="dialog__form" @submit.prevent="save">
        <label class="dialog__label" for="item-editor-heading">Pöördumine või pealkiri</label>
        <input id="item-editor-heading" v-model="draft.heading" class="input" type="text" />
        <label class="dialog__label" for="item-editor-body">Tekst</label>
        <textarea id="item-editor-body" ref="bodyField" v-model="draft.body" class="textarea" :rows="rows" />
        <p class="dialog__hint">
          Tühi rida alustab uut lõiku.<template v-if="fitHint"> {{ words }} sõna – kaardile mahub mugavalt umbes 70–100 sõna.</template>
        </p>
        <template v-if="item.signature !== undefined">
          <label class="dialog__label" for="item-editor-signature">Allkiri</label>
          <textarea id="item-editor-signature" v-model="draft.signature" class="textarea" rows="2" />
        </template>
        <footer class="dialog__actions">
          <button type="button" class="action action--ghost" :disabled="busy" @click="emit('regenerate')">
            <RefreshCw :size="15" aria-hidden="true" /> Uus variant
          </button>
          <span class="dialog__spacer" />
          <button type="button" class="action" @click="emit('close')">Tühista</button>
          <button type="submit" class="action action--primary">Salvesta</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(42, 36, 51, 0.45);
}
.dialog {
  width: min(640px, 100%);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lift);
  font-family: var(--font-body);
}
.dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem 0;
  h2 {
    font-size: 1.2rem;
    margin: 0;
  }
}
.dialog__close {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  &:hover {
    background: var(--bg-deep);
  }
}
.dialog__form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem 1.25rem 1.25rem;
}
.dialog__label {
  margin-top: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.dialog__hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.dialog__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.dialog__spacer {
  flex: 1;
}
.action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1.1rem;
  border: 1.5px solid var(--line-strong);
  border-radius: 999px;
  background: var(--surface);
  font-weight: 600;
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: var(--lavender);
    color: var(--lavender-ink);
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
}
.action--ghost {
  border-style: dashed;
}
.action--primary {
  background: var(--lavender);
  border-color: var(--lavender);
  color: #fff;
  &:hover:not(:disabled) {
    background: var(--lavender-ink);
    color: #fff;
  }
}
</style>
