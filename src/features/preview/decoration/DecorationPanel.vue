<script setup lang="ts">
import { computed, ref } from 'vue'
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import type { Decoration, OccasionId, PatternId } from '../../../domain/models'
import { isSuggestedPattern, PATTERN_LABELS, patternsFor } from '../../../domain/patterns'
import { computeGrid } from '../../../domain/puzzleGrid'
import { saveImage } from '../../../utils/imageStore'
import PatternBackground from './PatternBackground.vue'

const props = defineProps<{
  decoration: Decoration
  occasionId: OccasionId
  itemCount: number
  imageUrl: string | null
  /** On the puzzle poster the picture always spans the whole poster. */
  poster?: boolean
}>()
const emit = defineEmits<{ update: [decoration: Decoration] }>()

type BackgroundChoice = 'none' | 'image' | PatternId

const uploading = ref(false)
const error = ref('')
const patterns = computed(() => patternsFor(props.occasionId))
const background = computed<BackgroundChoice>(() =>
  props.decoration.imageAsBackground && props.decoration.image ? 'image' : (props.decoration.pattern ?? 'none'),
)
const grid = computed(() =>
  props.decoration.image ? computeGrid(props.itemCount, props.decoration.image.width / props.decoration.image.height) : null,
)

function update(patch: Partial<Decoration>): void {
  emit('update', { ...props.decoration, ...patch })
}

function chooseBackground(choice: BackgroundChoice): void {
  if (choice === 'image') update({ imageAsBackground: true, pattern: null })
  else update({ imageAsBackground: false, pattern: choice === 'none' ? null : choice })
}

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Vali pildifail (JPG, PNG või WebP).'
    return
  }
  uploading.value = true
  error.value = ''
  try {
    const image = await saveImage(file)
    // A fresh picture becomes the puzzle by default – that is the main reason to upload one.
    update({ image, puzzle: true })
  } catch {
    error.value = 'Pilti ei õnnestunud salvestada. Proovi teist pilti või teist brauserit.'
  } finally {
    uploading.value = false
  }
}

function removeImage(): void {
  update({ image: null, imageAsBackground: false, puzzle: false })
}
</script>

<template>
  <section class="decor no-print" aria-labelledby="decor-title">
    <h2 id="decor-title" class="decor__title">Kujundus</h2>

    <fieldset class="decor__group">
      <legend>Taust</legend>
      <div class="swatches">
        <label class="swatch" :class="{ 'is-active': background === 'none' }">
          <input type="radio" class="visually-hidden" name="bg" :checked="background === 'none'" @change="chooseBackground('none')" />
          <span class="swatch__preview swatch__preview--none" aria-hidden="true" />
          <span>Puudub</span>
        </label>
        <label v-for="pattern in patterns" :key="pattern" class="swatch" :class="{ 'is-active': background === pattern }">
          <input type="radio" class="visually-hidden" name="bg" :checked="background === pattern" @change="chooseBackground(pattern)" />
          <span class="swatch__preview" aria-hidden="true"><PatternBackground :pattern="pattern" :ink-saver="false" /></span>
          <span>{{ PATTERN_LABELS[pattern] }}<span v-if="isSuggestedPattern(occasionId, pattern)" class="visually-hidden"> (sobib sündmusega)</span></span>
          <span v-if="isSuggestedPattern(occasionId, pattern)" class="swatch__star" aria-hidden="true">★</span>
        </label>
        <label v-if="decoration.image && imageUrl && !poster" class="swatch" :class="{ 'is-active': background === 'image' }">
          <input type="radio" class="visually-hidden" name="bg" :checked="background === 'image'" @change="chooseBackground('image')" />
          <span class="swatch__preview" aria-hidden="true"><img :src="imageUrl" alt="" /></span>
          <span>Oma pilt</span>
        </label>
      </div>
      <label v-if="decoration.pattern" class="check">
        <input type="checkbox" :checked="decoration.inkSaver" @change="update({ inkSaver: !decoration.inkSaver })" />
        <span>Säästa tinti – muster ainult raamina</span>
      </label>
      <label v-if="background === 'image'" class="range-field">
        <span>Pildi heledus</span>
        <input
          type="range"
          class="range"
          min="0.1"
          max="0.6"
          step="0.05"
          :value="decoration.imageOpacity"
          aria-label="Taustapildi tugevus"
          @input="update({ imageOpacity: Number(($event.target as HTMLInputElement).value) })"
        />
      </label>
    </fieldset>

    <fieldset class="decor__group">
      <legend>Oma pilt ja pusle</legend>
      <p class="decor__hint">
        Laadi üles pere foto või lapse joonistus. Pilt jääb ainult sinu seadmesse. Pusle puhul saab iga osa
        väljalõigatava tüki – kui kõik on koos, tuleb välja terve pilt.
      </p>
      <div class="upload-row">
        <label class="upload" :class="{ 'is-busy': uploading }">
          <input type="file" accept="image/*" class="visually-hidden" :disabled="uploading" @change="onFile" />
          <ImagePlus :size="18" aria-hidden="true" />
          <span>{{ uploading ? 'Laen…' : decoration.image ? 'Vaheta pilti' : 'Laadi pilt üles' }}</span>
        </label>
        <button v-if="decoration.image" type="button" class="remove" @click="removeImage">
          <Trash2 :size="16" aria-hidden="true" /> Eemalda pilt
        </button>
      </div>
      <p v-if="error" class="decor__error" role="alert">{{ error }}</p>
      <p v-if="poster && decoration.image" class="decor__hint" role="status">
        Pusleplakatil on see pilt kogu plakati taust – kui kõik kaardid on koos, tuleb pilt välja.
      </p>
      <template v-if="decoration.image && grid && !poster">
        <label class="check">
          <input type="checkbox" :checked="decoration.puzzle" @change="update({ puzzle: !decoration.puzzle })" />
          <span>Tee pildist pusle</span>
        </label>
        <p v-if="decoration.puzzle" class="decor__hint" role="status">
          {{ itemCount }} osa → {{ grid.cells }} tükki ({{ grid.cols }} × {{ grid.rows }}).
          <template v-if="grid.cells > itemCount">
            {{ grid.cells - itemCount }} lisatükki on lapsevanema lehel – anna need koos viimasega.
          </template>
          Kokkupaneku juhend on lapsevanema lehel.
        </p>
        <p v-if="decoration.puzzle && decoration.image.width < 1200" class="decor__warn">
          Pilt on üsna väikese eraldusvõimega, prinditud tükid võivad jääda veidi uduseks.
        </p>
      </template>
    </fieldset>
  </section>
</template>

<style scoped lang="scss">
.decor {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.decor__title {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}
.decor__group {
  border: 0;
  padding: 0;
  margin: 0 0 1rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  legend {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    padding: 0;
  }
}
.decor__hint,
.decor__warn,
.decor__error {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
}
.decor__hint {
  color: var(--ink-soft);
}
.decor__warn {
  color: #7a5410;
}
.decor__error {
  color: var(--danger);
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.swatch {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 4.75rem;
  padding: 0.4rem 0.3rem;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 500;
  text-align: center;
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
.swatch__preview {
  position: relative;
  display: block;
  width: 3.4rem;
  height: 2.6rem;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--line);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.swatch__preview--none {
  background: linear-gradient(135deg, #fff 47%, var(--line-strong) 48%, var(--line-strong) 52%, #fff 53%);
}
.swatch__star {
  position: absolute;
  top: 0.2rem;
  right: 0.35rem;
  color: #d9a441;
  font-size: 0.8rem;
}
.range-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  .range {
    max-width: 14rem;
  }
}
.upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.upload,
.remove {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.upload {
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
.remove {
  background: transparent;
  border: 1.5px solid var(--line);
  color: var(--ink-soft);
  &:hover {
    color: var(--danger);
    border-color: rgba(179, 38, 30, 0.35);
  }
}
.check {
  align-self: flex-start;
}
</style>
