<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { X } from 'lucide-vue-next'

/**
 * Modal dialog: keyboard focus stays inside, Escape and the backdrop close it, and
 * focus returns to where it was. The first field with `autofocus` gets focus on open.
 */
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

const titleId = useId()
const dialog = ref<HTMLElement | null>(null)
let previousFocus: Element | null = null

function focusable(): HTMLElement[] {
  if (!dialog.value) return []
  return [...dialog.value.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]')].filter(
    (el) => !el.hasAttribute('disabled'),
  )
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return
  const all = focusable()
  const first = all[0]
  const last = all[all.length - 1]
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
  const target = dialog.value?.querySelector<HTMLElement>('[autofocus]') ?? focusable()[0]
  target?.focus()
})
onBeforeUnmount(() => {
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <div class="backdrop no-print" @click.self="emit('close')">
    <div ref="dialog" class="dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId" @keydown="onKeydown">
      <header class="dialog__head">
        <h2 :id="titleId">{{ title }}</h2>
        <button type="button" class="dialog__close" aria-label="Sulge" @click="emit('close')"><X :size="18" /></button>
      </header>
      <div class="dialog__body">
        <slot />
      </div>
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
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lift);
  font-family: var(--font-body);
}
.dialog__head {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem 0.5rem;
  background: var(--surface);
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
.dialog__body {
  padding: 0.25rem 1.25rem 1.25rem;
}
// On a phone the dialog is a sheet from the bottom edge, closer to the thumb.
@media (max-width: 520px) {
  .backdrop {
    place-items: end stretch;
    padding: 0;
  }
  .dialog {
    width: 100%;
    max-height: 92vh;
    max-height: 92dvh;
    border-radius: var(--radius) var(--radius) 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
