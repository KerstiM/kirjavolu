<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus } from 'lucide-vue-next'
import type { ChildBackground, ChildDecoration, Decoration } from '../../../domain/models'
import { saveImage } from '../../../utils/imageStore'

/**
 * Per child: the shared background, none, or an own picture. Shown when every child
 * gets their own sheets (a linked family series), so each poster can differ.
 */
const props = defineProps<{
  children: { id: string; name: string; mini: boolean }[]
  decoration: Decoration
  /** Loaded own pictures, by image id. */
  imageUrls: Record<string, string>
}>()
const emit = defineEmits<{ update: [decoration: Decoration] }>()

const CHOICES: { value: ChildBackground; label: string }[] = [
  { value: 'shared', label: 'Ühine taust' },
  { value: 'none', label: 'Ilma taustata' },
  { value: 'image', label: 'Oma pilt' },
]

const uploading = ref<string | null>(null)
const error = ref('')

function own(childId: string): ChildDecoration {
  return props.decoration.childDecorations?.[childId] ?? { background: 'shared', image: null }
}

function set(childId: string, patch: Partial<ChildDecoration>): void {
  emit('update', {
    ...props.decoration,
    childDecorations: { ...props.decoration.childDecorations, [childId]: { ...own(childId), ...patch } },
  })
}

async function onFile(childId: string, event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Vali pildifail (JPG, PNG või WebP).'
    return
  }
  uploading.value = childId
  error.value = ''
  try {
    set(childId, { background: 'image', image: await saveImage(file) })
  } catch {
    error.value = 'Pilti ei õnnestunud salvestada. Proovi teist pilti või teist brauserit.'
  } finally {
    uploading.value = null
  }
}
</script>

<template>
  <section class="kids no-print" aria-labelledby="kids-title">
    <h2 id="kids-title" class="kids__title">Iga lapse taust</h2>
    <p class="kids__hint">Igale lapsele võib valida oma pildi või jätta tema lehed ilma taustata.</p>
    <fieldset v-for="child in children" :key="child.id" class="kid">
      <legend class="kid__name">
        {{ child.name }}<span v-if="child.mini" class="kid__tag"> · väikelapse kaardid</span>
      </legend>
      <div class="kid__row">
        <div class="kid__choices">
          <label v-for="choice in CHOICES" :key="choice.value" class="chip" :class="{ 'is-active': own(child.id).background === choice.value }">
            <input
              type="radio"
              class="visually-hidden"
              :name="`kid-bg-${child.id}`"
              :checked="own(child.id).background === choice.value"
              @change="set(child.id, { background: choice.value })"
            />
            {{ choice.label }}
          </label>
        </div>
        <template v-if="own(child.id).background === 'image'">
          <img v-if="own(child.id).image && imageUrls[own(child.id).image!.id]" :src="imageUrls[own(child.id).image!.id]" alt="" class="kid__thumb" />
          <label class="upload" :class="{ 'is-busy': uploading === child.id }">
            <input type="file" accept="image/*" class="visually-hidden" :disabled="uploading === child.id" @change="(e) => onFile(child.id, e)" />
            <ImagePlus :size="16" aria-hidden="true" />
            <span>{{ uploading === child.id ? 'Laen…' : own(child.id).image ? 'Vaheta pilti' : 'Laadi pilt üles' }}</span>
          </label>
        </template>
      </div>
    </fieldset>
    <p v-if="error" class="kids__error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped lang="scss">
.kids {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.kids__title {
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}
.kids__hint,
.kids__error {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--ink-soft);
}
.kids__error {
  color: var(--danger);
}
.kid {
  border: 0;
  padding: 0;
  margin: 0 0 0.9rem;
  min-width: 0;
}
.kid__name {
  padding: 0;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
}
.kid__tag {
  font-weight: 400;
  color: var(--ink-soft);
}
.kid__row,
.kid__choices {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.chip {
  padding: 0.4rem 0.85rem;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    border-color: var(--line-strong);
  }
  &.is-active {
    border-color: var(--lavender);
    box-shadow: 0 0 0 3px var(--lavender-soft);
  }
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.kid__thumb {
  width: 3rem;
  height: 2.3rem;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--line);
}
.upload {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  border: 1.5px solid var(--lavender-mid);
  &:hover {
    border-color: var(--lavender);
  }
  &:has(input:focus-visible) {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  &.is-busy {
    opacity: 0.7;
    cursor: wait;
  }
}
</style>
