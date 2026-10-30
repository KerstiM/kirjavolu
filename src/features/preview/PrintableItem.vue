<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { Check, Pencil, RefreshCw, X } from 'lucide-vue-next'
import type { CertificateStyle, GeneratedItem } from '../../domain/models'

const props = defineProps<{
  item: GeneratedItem
  certificateStyle?: CertificateStyle
  busy?: boolean
}>()
const emit = defineEmits<{
  save: [patch: Pick<GeneratedItem, 'heading' | 'body' | 'signature'>]
  regenerate: []
}>()

const editing = ref(false)
const draft = reactive({ heading: '', body: '', signature: '' })
const bodyField = ref<HTMLTextAreaElement | null>(null)

const paragraphs = computed(() => props.item.body.split(/\n{2,}/).filter((p) => p.trim()))
const kindClass = computed(() => [
  `paper--${props.item.kind}`,
  props.item.kind === 'certificate' ? `cert--${props.certificateStyle ?? 'magical'}` : '',
])
const bodyRows = computed(() => Math.min(18, Math.max(4, Math.ceil(draft.body.length / 60) + draft.body.split('\n').length)))

async function startEdit(): Promise<void> {
  draft.heading = props.item.heading
  draft.body = props.item.body
  draft.signature = props.item.signature ?? ''
  editing.value = true
  await nextTick()
  bodyField.value?.focus()
}

function save(): void {
  emit('save', {
    heading: draft.heading.trim(),
    body: draft.body.trim(),
    signature: draft.signature.trim() || undefined,
  })
  editing.value = false
}
</script>

<template>
  <article class="paper" :class="kindClass">
    <div class="paper__tools no-print">
      <span v-if="item.edited" class="edited-badge">Muudetud</span>
      <template v-if="!editing">
        <button type="button" class="tool" :aria-label="`Muuda: ${item.label}`" @click="startEdit">
          <Pencil :size="15" aria-hidden="true" /><span>Muuda</span>
        </button>
        <button
          type="button"
          class="tool"
          :disabled="busy"
          :aria-label="`Uus variant: ${item.label}`"
          @click="emit('regenerate')"
        >
          <RefreshCw :size="15" aria-hidden="true" :class="{ spin: busy }" /><span>Uus variant</span>
        </button>
      </template>
    </div>

    <form v-if="editing" class="editor no-print" @submit.prevent="save" @keydown.esc="editing = false">
      <label class="editor__label" :for="`h-${item.id}`">Pealkiri</label>
      <input :id="`h-${item.id}`" v-model="draft.heading" class="input" type="text" />
      <label class="editor__label" :for="`b-${item.id}`">Tekst</label>
      <textarea :id="`b-${item.id}`" ref="bodyField" v-model="draft.body" class="textarea" :rows="bodyRows" />
      <p class="editor__hint">Tühi rida alustab uut lõiku.</p>
      <template v-if="item.signature !== undefined">
        <label class="editor__label" :for="`s-${item.id}`">Allkiri</label>
        <textarea :id="`s-${item.id}`" v-model="draft.signature" class="textarea" rows="2" />
      </template>
      <div class="editor__actions">
        <button type="button" class="tool" @click="editing = false"><X :size="15" aria-hidden="true" /> Tühista</button>
        <button type="submit" class="tool tool--primary"><Check :size="15" aria-hidden="true" /> Salvesta</button>
      </div>
    </form>

    <div v-else class="paper__content">
      <p v-if="item.label" class="paper__label">{{ item.label }}</p>
      <h3 v-if="item.heading" class="paper__heading">{{ item.heading }}</h3>
      <div class="paper__body">
        <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
      </div>
      <p v-if="item.signature" class="paper__signature">{{ item.signature }}</p>
      <span class="paper__ornament" aria-hidden="true">✦</span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.paper {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  padding: 2rem 2rem 1.75rem;
  font-family: var(--font-print);
  color: #2b2433;
  break-inside: avoid;
  page-break-inside: avoid;
}
.paper__tools {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-body);
  opacity: 0.85;
  transition: opacity 0.15s ease;
  .paper:hover &,
  &:focus-within {
    opacity: 1;
  }
}
.tool {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ink-soft);
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
.tool--primary {
  background: var(--lavender);
  border-color: var(--lavender);
  color: #fff;
  &:hover:not(:disabled) {
    color: #fff;
    background: var(--lavender-ink);
  }
}
.edited-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--gold-soft);
  color: #7a5410;
  font-size: 0.72rem;
  font-weight: 600;
}
.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.paper__label {
  margin: 0 0 0.35rem;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--coral-ink);
  padding-right: 9rem;
}
.paper__heading {
  font-family: var(--font-print);
  font-weight: 600;
  font-size: 1.45rem;
  margin: 0 0 0.9rem;
  color: var(--lavender-ink);
}
.paper__body p {
  margin: 0 0 0.75em;
  font-size: 1.02rem;
  line-height: 1.65;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.paper__signature {
  margin: 0.75rem 0 0;
  text-align: right;
  white-space: pre-line;
  font-weight: 500;
}
.paper__ornament {
  position: absolute;
  bottom: 0.7rem;
  left: 1rem;
  color: var(--gold);
  font-size: 1rem;
}

// Content-type specific looks
.paper--clue,
.paper--activity,
.paper--puzzle {
  border-style: dashed;
  border-color: var(--line-strong);
}
.paper--clue .paper__heading,
.paper--activity .paper__heading {
  color: var(--coral-ink);
}
.paper--puzzle .paper__body p:nth-child(n + 2) {
  font-size: 1.08rem;
}
.paper--certificate {
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  min-height: 24rem;
  justify-content: center;
  .paper__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .paper__label {
    padding-right: 0;
  }
  .paper__heading {
    font-size: 2.3rem;
    margin-bottom: 1.25rem;
  }
  .paper__body p:nth-child(2) {
    font-size: 2rem;
    font-weight: 600;
    color: var(--ink);
    margin: 0.2em 0 0.5em;
  }
  .paper__signature {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 0.6rem;
    border-top: 1px solid var(--line-strong);
    min-width: 12rem;
  }
}
.cert--magical {
  border: 3px double var(--lavender-mid);
  background:
    radial-gradient(circle at 10% 10%, var(--lavender-soft), transparent 30%),
    radial-gradient(circle at 90% 90%, var(--gold-soft), transparent 30%),
    #fff;
}
.cert--classic {
  border: 6px double #c9b98f;
  .paper__heading {
    color: #6b5a2e;
    letter-spacing: 0.04em;
  }
}
.cert--playful {
  border: 4px dashed var(--coral);
  .paper__heading {
    color: var(--coral-ink);
  }
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-family: var(--font-body);
  padding-top: 1.25rem;
}
.editor__label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.4rem;
}
.editor__hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

@media (max-width: 560px) {
  .paper {
    padding: 2.6rem 1.25rem 1.5rem;
  }
  .paper__label {
    padding-right: 0;
  }
}

@media print {
  .paper {
    box-shadow: none;
    border-radius: 0;
    padding: 9mm 10mm 8mm;
    font-size: 12pt;
  }
  .paper__body p {
    font-size: 12pt;
    line-height: 1.55;
  }
  .paper__heading {
    font-size: 18pt;
  }
  .paper__label {
    font-size: 8.5pt;
    padding-right: 0;
  }
  .paper--certificate {
    min-height: 245mm;
    .paper__heading {
      font-size: 34pt;
    }
    .paper__body p {
      font-size: 14pt;
    }
    .paper__body p:nth-child(2) {
      font-size: 30pt;
    }
  }
  .paper--letter,
  .paper--story-page {
    border: 0;
  }
}
</style>
