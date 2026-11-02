<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RefreshCw, Sparkles, X } from 'lucide-vue-next'
import type { GeneratedItem } from '../../domain/models'

type Text = Pick<GeneratedItem, 'heading' | 'body' | 'signature'>

/**
 * Editor for one item, opened from the card's "Muuda" button in every layout.
 * Changes apply only when saved. An AI letter can also be rewritten by the AI as the parent
 * asks: the new text lands in the fields, and "Salvesta" keeps it, "Tühista" keeps the old one.
 */
const props = defineProps<{
  item: GeneratedItem
  title: string
  busy?: boolean
  fitHint?: boolean
  noVariants?: boolean
  /** Rewrites the letter with the AI; throws an Error whose message is shown to the parent. */
  aiFix?: (wish: string) => Promise<Text>
  /** Under the AI field, e.g. how many fixes are left, or why there are none. */
  aiNote?: string
}>()
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

const wish = ref('')
const fixing = ref(false)
const fixError = ref('')
const fixed = ref(false)

async function fixWithAi(): Promise<void> {
  if (!props.aiFix || fixing.value || !wish.value.trim()) return
  fixing.value = true
  fixError.value = ''
  try {
    const letter = await props.aiFix(wish.value.trim())
    Object.assign(draft, { heading: letter.heading, body: letter.body, signature: letter.signature ?? draft.signature })
    fixed.value = true
    wish.value = ''
  } catch (error) {
    fixError.value = error instanceof Error ? error.message : 'Midagi läks valesti. Proovi uuesti.'
  } finally {
    fixing.value = false
  }
}

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
        <p v-if="aiFix || aiNote" class="dialog__hint">Muuda teksti ise: see on alati tasuta.</p>
        <label class="dialog__label" for="item-editor-heading">Pöördumine või pealkiri</label>
        <input id="item-editor-heading" v-model="draft.heading" class="input" type="text" />
        <label class="dialog__label" for="item-editor-body">Tekst</label>
        <textarea id="item-editor-body" ref="bodyField" v-model="draft.body" class="textarea" :rows="rows" />
        <p class="dialog__hint">
          Tühi rida alustab uut lõiku.<template v-if="fitHint">{{ ' ' }}{{ words }} sõna – kaardile mahub mugavalt umbes 70–100 sõna.</template>
        </p>
        <template v-if="item.signature !== undefined">
          <label class="dialog__label" for="item-editor-signature">Allkiri</label>
          <textarea id="item-editor-signature" v-model="draft.signature" class="textarea" rows="2" />
        </template>
        <section v-if="aiFix || aiNote" class="ai-fix" aria-labelledby="ai-fix-title">
          <h3 id="ai-fix-title" class="ai-fix__title">
            Palu päkapikul muuta <span class="ai-fix__tag">Jõulupass</span>
          </h3>
          <template v-if="aiFix">
            <label class="visually-hidden" for="item-editor-wish">Mida päkapikk peaks muutma?</label>
            <textarea
              id="item-editor-wish"
              v-model="wish"
              class="textarea"
              rows="2"
              maxlength="500"
              placeholder="Mida päkapikk peaks muutma? Näiteks: tee lühemaks; Liisi on beebi, ta ei räägi veel"
              :disabled="fixing"
            />
            <div class="ai-fix__row">
              <button type="button" class="action" :disabled="fixing || !wish.trim()" @click="fixWithAi">
                <Sparkles :size="15" aria-hidden="true" /> {{ fixing ? 'Päkapikk kirjutab ümber…' : 'Palu päkapikul muuta' }}
              </button>
              <span v-if="aiNote" class="dialog__hint">{{ aiNote }}</span>
            </div>
          </template>
          <p v-else class="dialog__hint">{{ aiNote }}</p>
          <p v-if="fixed" class="ai-fix__done" role="status">
            Päkapikk kirjutas teksti ümber. Salvesta, kui see sobib, või vajuta „Tühista“, et jätta vana.
          </p>
          <p v-if="fixError" class="ai-fix__error" role="alert">{{ fixError }}</p>
        </section>
        <footer class="dialog__actions">
          <button v-if="!noVariants" type="button" class="action action--ghost" :disabled="busy" @click="emit('regenerate')">
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
.ai-fix {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem 1rem;
  border: 1.5px dashed var(--coral);
  border-radius: var(--radius-sm);
  background: var(--surface);
  h3 {
    margin: 0;
  }
}
.ai-fix__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.95rem;
}
.ai-fix__tag {
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  background: var(--coral-soft);
  color: var(--coral-ink);
  font-size: 0.75rem;
  font-weight: 700;
}
.ai-fix__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
}
.ai-fix__done,
.ai-fix__error {
  margin: 0;
  font-size: 0.85rem;
}
.ai-fix__error {
  color: var(--danger);
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
// On a phone "Uus variant" and "Tühista" share a row and "Salvesta" gets the full width below.
@media (max-width: 520px) {
  .dialog__actions .action {
    flex: 1;
    justify-content: center;
  }
  .dialog__actions .action--primary {
    flex-basis: 100%;
  }
  .dialog__spacer {
    display: none;
  }
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
