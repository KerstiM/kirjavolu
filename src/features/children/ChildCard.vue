<script setup lang="ts">
import { pickedTopics } from '../../data/topics'
import { computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { ChildProfile } from '../../domain/models'
import { READING_LEVEL_LABELS } from '../../domain/models'
import { ageLabel, nameCase } from '../../domain/text/estonian'
import { useDesign } from '../../components/brand/design'

const props = defineProps<{ child: ChildProfile }>()
defineEmits<{ edit: []; remove: [] }>()

// In the new design the profile is an address label, tilted a little like those in the wizard.
const design = useDesign()
const tilt = computed(() => [-0.8, 0.6, -0.4, 0.9][props.child.name.length % 4])

const palette = ['lavender', 'coral', 'sage', 'gold'] as const
const tone = computed(() => palette[props.child.name.length % palette.length])
const tags = computed(() =>
  [...pickedTopics(props.child).map((topic) => topic.label), ...props.child.interests, ...props.child.favorites, ...props.child.foods].slice(0, 6),
)
</script>

<template>
  <article
    class="child-card"
    :class="[`tone-${tone}`, { 'child-card--label': design === 'new' }]"
    :style="design === 'new' ? { '--tilt': `${tilt}deg` } : undefined"
  >
    <div class="child-card__head">
      <span class="avatar" aria-hidden="true">{{ child.name.charAt(0) }}</span>
      <div class="child-card__id">
        <span v-if="design === 'new'" class="child-card__to" aria-hidden="true">Kellele:</span>
        <h3>{{ child.name }}</h3>
        <p>{{ ageLabel(child.age) }} · {{ READING_LEVEL_LABELS[child.readingLevel] }}</p>
      </div>
    </div>
    <p v-if="child.details || child.personality" class="child-card__details">
      {{ child.details || child.personality }}
    </p>
    <ul v-if="tags.length" class="tags" role="list" aria-label="Huvid ja lemmikud">
      <li v-for="tag in tags" :key="tag">{{ tag }}</li>
    </ul>
    <div class="child-card__actions">
      <button type="button" class="icon-btn" :aria-label="`Muuda ${nameCase(child, 'genitive')} profiili`" @click="$emit('edit')">
        <Pencil :size="16" aria-hidden="true" /> Muuda
      </button>
      <button type="button" class="icon-btn icon-btn--danger" :aria-label="`Kustuta ${nameCase(child, 'genitive')} profiil`" @click="$emit('remove')">
        <Trash2 :size="16" aria-hidden="true" /> Kustuta
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
.child-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  height: 100%;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
.tone-lavender {
  --tone-soft: var(--lavender-soft);
  --tone-ink: var(--lavender-ink);
}
.tone-coral {
  --tone-soft: var(--coral-soft);
  --tone-ink: var(--coral-ink);
}
.tone-sage {
  --tone-soft: var(--sage-soft);
  --tone-ink: var(--sage-ink);
}
.tone-gold {
  --tone-soft: var(--gold-soft);
  --tone-ink: #8a5f10;
}
.child-card__head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.avatar {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--tone-soft);
  color: var(--tone-ink);
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
}
.child-card__id {
  h3 {
    margin: 0;
    font-size: 1.25rem;
  }
  p {
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink-soft);
  }
}
.child-card__details {
  margin: 0;
  font-size: 0.93rem;
  color: var(--ink-soft);
  line-height: 1.5;
}
.tags {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  li {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: var(--tone-soft);
    color: var(--tone-ink);
    font-size: 0.8rem;
    font-weight: 600;
  }
}
.child-card__actions {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.5rem;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    border-color: var(--lavender);
    color: var(--lavender-ink);
  }
}
// --- new design: address label ----------------------------------------------
.child-card--label {
  border: 2px solid #f0e2cf;
  border-radius: 10px;
  background: #fffdf8;
  box-shadow: none;
  transform: rotate(var(--tilt));
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease;
  &:hover,
  &:focus-within {
    transform: rotate(0) translateY(-3px);
    box-shadow: 0 5px 0 #f0e2cf;
  }
  .child-card__head {
    align-items: flex-start;
  }
  // The initial sits in a postmark instead of a plain circle.
  .avatar {
    order: 2;
    margin-left: auto;
    background: none;
    border: 2.5px solid var(--tone-ink);
    box-shadow:
      inset 0 0 0 3px #fffdf8,
      inset 0 0 0 5px var(--tone-ink);
    font-family: var(--font-print);
    transform: rotate(-12deg);
    opacity: 0.85;
  }
  .child-card__id {
    flex: 1;
    min-width: 0;
    h3 {
      padding-bottom: 0.15rem;
      border-bottom: 2px dashed #ead8bf;
      font-family: var(--font-print);
      font-size: 1.45rem;
      font-weight: 600;
      line-height: 1.4;
    }
    p {
      margin-top: 0.3rem;
    }
  }
  .icon-btn {
    border-width: 2px;
    background: #fff;
  }
  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }
}
.child-card__to {
  color: var(--ink-faint);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.icon-btn--danger:hover {
  border-color: rgba(179, 38, 30, 0.4);
  color: var(--danger);
  background: #fdecea;
}
</style>
