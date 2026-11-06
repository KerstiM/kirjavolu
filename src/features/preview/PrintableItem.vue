<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, RefreshCw, Scissors } from 'lucide-vue-next'
import type { CertificateStyle, GeneratedItem, PatternId } from '../../domain/models'
import type { PuzzleGrid } from '../../domain/puzzleGrid'
import PatternBackground from './decoration/PatternBackground.vue'
import PuzzlePiece from './decoration/PuzzlePiece.vue'
import CompanionFigure from '../../components/brand/companion/CompanionFigure.vue'
import type { CompanionId } from '../../domain/models'

const props = defineProps<{
  item: GeneratedItem
  certificateStyle?: CertificateStyle
  busy?: boolean
  pattern?: PatternId | null
  inkSaver?: boolean
  backgroundUrl?: string | null
  backgroundOpacity?: number
  piece?: { imageUrl: string; grid: PuzzleGrid; index: number; maxCm: number } | null
  uppercase?: boolean
  /** Smaller text (14 px instead of 16 px). */
  smaller?: boolean
  /** A sample to look at: no editing tools. */
  readonly?: boolean
  /** Written by the AI: it can be edited by hand, but has no template variants. */
  noVariants?: boolean
  /** Printed text size (pt), so the letter fits its sheet; see printFit.ts. */
  printPt?: number
  /** No other variant of this text exists: "Uus variant" stays in sight, but off. */
  noVariant?: boolean
  /** Too long for a half page: a "Lühenda" button opens the editor with the extra text marked. */
  shorten?: boolean
  /** A character under the letter, bottom right, with its exclamation. */
  companion?: { id: CompanionId; pose: number; line: string } | null
}>()
const emit = defineEmits<{ edit: []; regenerate: []; shorten: [] }>()

// A letter on its own has no label, so the tools name it by its greeting.
const name = computed(() => props.item.label || props.item.heading || 'kiri')
const paragraphs = computed(() => props.item.body.split(/\n{2,}/).filter((p) => p.trim()))
const kindClass = computed(() => [
  `paper--${props.item.kind}`,
  props.item.kind === 'certificate' ? `cert--${props.certificateStyle ?? 'magical'}` : '',
  {
    'has-backdrop': !!props.backgroundUrl || (!!props.pattern && !props.inkSaver),
    'has-frame': !!props.pattern && props.inkSaver,
    'is-upper': !!props.uppercase,
    'is-smaller': !!props.smaller,
    'has-companion': !!props.companion,
  },
])
</script>

<template>
  <article class="paper" :class="kindClass" :style="printPt ? { '--print-pt': `${printPt}pt` } : undefined">
    <img
      v-if="backgroundUrl"
      :src="backgroundUrl"
      alt=""
      class="paper__bg-image"
      :style="{ opacity: backgroundOpacity ?? 0.25 }"
    />
    <PatternBackground v-else-if="pattern" :pattern="pattern" :ink-saver="!!inkSaver" />
    <div v-if="!readonly" class="paper__tools no-print">
      <span v-if="item.edited" class="edited-badge">Muudetud</span>
      <button type="button" class="tool" :aria-label="`Muuda: ${name}`" @click="emit('edit')">
        <Pencil :size="15" aria-hidden="true" /><span>Muuda</span>
      </button>
      <button
        v-if="!noVariants"
        type="button"
        class="tool"
        :disabled="busy || noVariant"
        :title="noVariant ? 'Sellel kirjal teist varianti pole. Muuda teksti nupuga „Muuda“.' : undefined"
        :aria-label="noVariant ? `Uus variant: ${name} – teist varianti pole` : `Uus variant: ${name}`"
        @click="emit('regenerate')"
      >
        <RefreshCw :size="15" aria-hidden="true" :class="{ spin: busy }" /><span>Uus variant</span>
      </button>
      <button v-if="shorten" type="button" class="tool tool--shorten" :aria-label="`Lühenda: ${name}`" @click="emit('shorten')">
        <Scissors :size="15" aria-hidden="true" /><span>Lühenda</span>
      </button>
    </div>

    <div class="paper__content">
      <p v-if="item.label" class="paper__label">{{ item.label }}</p>
      <h3 v-if="item.heading" class="paper__heading">{{ item.heading }}</h3>
      <div class="paper__body">
        <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
      </div>
      <p v-if="item.signature" class="paper__signature">{{ item.signature }}</p>
      <div v-if="companion" class="paper__companion">
        <p class="paper__bubble">{{ companion.line }}</p>
        <CompanionFigure :id="companion.id" :pose="companion.pose" :size="76" />
      </div>
    </div>
    <PuzzlePiece v-if="piece" v-bind="piece" class="paper__piece" />
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
    cursor: not-allowed;
  }
  &--shorten {
    border-color: rgba(179, 38, 30, 0.35);
    color: var(--danger);
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
  .is-smaller & {
    font-size: 0.875rem;
  }
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
// The companion sits right under the signature, bottom right of the text. At the foot of the
// sheet it was the first thing cut when a browser broke the lines a little differently.
.paper__companion {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  break-inside: avoid;
  page-break-inside: avoid;
}
.paper__bubble {
  position: relative;
  max-width: 15rem;
  margin: 0 0.4rem 1.6rem 0;
  padding: 0.5rem 0.85rem;
  border: 1.5px solid var(--lavender-mid, #afa9ec);
  border-radius: 14px 14px 4px 14px;
  background: var(--lavender-soft, #eeedfe);
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--lavender-ink, #3c3489);
}
// Decoration layers: content sits above the background on a soft white panel.
.paper__bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
}
.paper__content,
.paper__piece,
.paper__tools {
  position: relative;
  z-index: 1;
}
.paper__tools {
  position: absolute;
  z-index: 2;
}
.has-backdrop .paper__content {
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
}
.has-frame {
  padding: 2.8rem;
}
.paper {
  // Clip, not hidden: a clipped box still grows with its text, a scroll box would cut it.
  overflow: clip;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.is-upper .paper__body,
.is-upper .paper__signature {
  text-transform: uppercase;
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


@media (max-width: 560px) {
  .paper {
    padding: 2.6rem 1.25rem 1.5rem;
  }
  .paper__label {
    padding-right: 0;
  }
}

@media print {
  // A signature never starts a page of its own.
  .paper__signature {
    break-before: avoid;
    page-break-before: avoid;
  }
  .paper__body p:last-child {
    break-after: avoid;
    page-break-after: avoid;
  }
  .paper {
    box-shadow: none;
    border-radius: 0;
    padding: 9mm 10mm 8mm;
    font-size: var(--print-pt, 12pt);
  }
  .paper__body p {
    font-size: var(--print-pt, 12pt);
    line-height: 1.55;
  }
  .paper__heading {
    font-size: calc(var(--print-pt, 12pt) * 1.5);
  }
  .paper__companion {
    padding-top: 2mm;
  }
  .paper__bubble {
    font-size: 9.5pt;
    margin-bottom: 7mm;
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
