<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import TopicPicker from '../children/TopicPicker.vue'
import type { TopicId } from '../../data/topics'
import Mascot from '../../components/brand/Mascot.vue'
import { DESIGN_KEY } from '../../components/brand/design'
import { emptyChildDraft, useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import { readingLevelForAge } from '../../domain/generators/audience'
import { templateGenerator } from '../../domain/generators/templateGenerator'
import { DEFAULT_GENERAL, defaultOptions } from '../../domain/defaults'
import type { ChildProfile } from '../../domain/models'
import { track } from '../../app/analytics'

/**
 * /ud2/alusta: the short Christmas journey, started from the home page at /ud2. One question
 * (who is it for), and the 24 free letters
 * are ready at once; making them personal with the Jõulupass happens on the next page,
 * beside the letters.
 */
provide(DESIGN_KEY, 'new')
const router = useRouter()
const children = useChildrenStore()
const creations = useCreationsStore()

const pickedId = ref(children.children[0]?.id ?? '')
const name = ref('')
const age = ref<number | ''>('')
const adding = ref(children.children.length === 0)
const error = ref('')
const busy = ref(false)

const picked = computed(() => (adding.value ? undefined : children.children.find((child) => child.id === pickedId.value)))

// Optional, but each picked topic brings its own hand-written stories into the free letters.
const topics = ref<TopicId[]>([])
watch(picked, (child) => (topics.value = [...(child?.topics ?? [])]), { immediate: true })

function childForLetters(): ChildProfile | null {
  if (picked.value) {
    const { id, createdAt: _created, updatedAt: _updated, ...profile } = picked.value
    children.update(id, { ...profile, topics: topics.value })
    return children.byId(id) ?? picked.value
  }
  const trimmed = name.value.trim()
  const years = Number(age.value)
  if (!trimmed) {
    error.value = 'Kirjuta lapse nimi.'
    return null
  }
  if (!Number.isInteger(years) || years < 0 || years > 14) {
    error.value = 'Vanus peab olema täisarv 0–14.'
    return null
  }
  track('child_added', { from: 'wizard' })
  return children.add({
    ...emptyChildDraft(),
    name: trimmed,
    age: years,
    readingLevel: readingLevelForAge(years),
    topics: topics.value,
  })
}

async function start(): Promise<void> {
  if (busy.value) return
  error.value = ''
  const child = childForLetters()
  if (!child) return
  busy.value = true
  try {
    const content = await templateGenerator.generate({
      contentType: 'letter',
      children: [{ ...child }],
      occasionId: 'christmas',
      general: { ...DEFAULT_GENERAL },
      seed: Date.now() % 2147483647,
      options: defaultOptions('christmas').letter,
    })
    creations.add(content)
    await router.push(`/ud2/kirjad/${content.id}`)
  } catch {
    error.value = 'Kirjade tegemine ei õnnestunud. Proovi uuesti.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="design-new ud2">
    <section class="container section ud2-start" aria-labelledby="ud2-title">
      <Mascot mood="wave" :size="96" />
      <h1 id="ud2-title">Päkapikk kirjutab sinu lapsele 24 jõulukirja</h1>
      <p class="ud2-start__lead">Üks kiri igaks hommikuks 1.–24. detsembrini. Prindi ja peida. Tasuta.</p>

      <form class="ud2-start__form" novalidate @submit.prevent="start">
        <fieldset v-if="children.children.length" class="ud2-start__kids">
          <legend>Kellele?</legend>
          <label v-for="child in children.children" :key="child.id" class="kid" :class="{ 'is-active': !adding && pickedId === child.id }">
            <input v-model="pickedId" type="radio" name="ud2-child" :value="child.id" class="visually-hidden" @change="adding = false" />
            {{ child.name }}
          </label>
          <label class="kid" :class="{ 'is-active': adding }">
            <input type="radio" name="ud2-child" class="visually-hidden" :checked="adding" @change="adding = true" />
            + Uus laps
          </label>
        </fieldset>

        <div v-if="adding" class="ud2-start__new">
          <label class="field">
            <span>Lapse nimi</span>
            <input v-model="name" class="input" type="text" autocomplete="off" />
          </label>
          <label class="field field--age">
            <span>Vanus</span>
            <input v-model.number="age" class="input" type="number" min="0" max="14" inputmode="numeric" />
          </label>
        </div>

        <!-- Folded, so the button stays in sight; the summary says what picking a topic brings. -->
        <details class="ud2-start__topics">
          <summary>
            Mis lapsele meeldib?
            <span class="ud2-start__optional">
              {{ topics.length ? `${topics.length} valitud` : 'valikuline, siis tulevad kirjadesse tema lood' }}
            </span>
          </summary>
          <p class="ud2-start__hint">Iga teema kohta on kirjades valmis lood, näiteks päkapikk proovib ise jalgpalli.</p>
          <TopicPicker v-model="topics" />
        </details>

        <p v-if="error" class="ud2-start__error" role="alert">{{ error }}</p>
        <BaseButton type="submit" size="lg" :disabled="busy">
          {{ busy ? 'Päkapikk kirjutab…' : 'Vaata kirju' }} <ArrowRight aria-hidden="true" />
        </BaseButton>
      </form>
      <p class="ud2-start__note">Jõulupassiga saad need hiljem päriselt lapse, tema pere ja detsembri plaanide kohta.</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.ud2-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 36rem;
  text-align: center;
  h1 {
    margin: 0;
    font-size: clamp(1.7rem, 5vw, 2.5rem);
    text-wrap: balance;
  }
}
.ud2-start__lead {
  margin: 0;
  color: var(--ink-soft);
}
.ud2-start__form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  align-self: stretch;
  margin-top: 0.5rem;
  padding: 1.25rem;
  border: 2px solid #f0e2cf;
  border-radius: 16px;
  background: #fff;
}
.ud2-start__kids {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  border: 0;
  legend {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
}
.kid {
  padding: 0.45rem 1rem;
  border: 2px solid var(--lavender-mid);
  border-radius: 999px;
  cursor: pointer;
  &.is-active {
    border-color: var(--lavender);
    background: var(--lavender-soft);
    color: var(--lavender-ink);
    font-weight: 600;
  }
  &:focus-within {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
}
.ud2-start__new {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 0.75rem;
  align-self: stretch;
  text-align: left;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.ud2-start__topics {
  align-self: stretch;
  text-align: left;
  summary {
    cursor: pointer;
    font-weight: 600;
  }
}
.ud2-start__optional {
  font-weight: 400;
  color: var(--ink-faint);
}
.ud2-start__hint {
  margin: 0.4rem 0 0.75rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.ud2-start__error {
  margin: 0;
  color: var(--danger);
}
.ud2-start__note {
  margin: 0;
  color: var(--ink-faint);
  font-size: 0.9rem;
}
</style>
