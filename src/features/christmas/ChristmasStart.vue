<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import TopicPicker from '../children/TopicPicker.vue'
import type { TopicId } from '../../data/topics'
import Mascot from '../../components/brand/Mascot.vue'
import { CHRISTMAS_ROOT, DESIGN_KEY } from '../../components/brand/design'
import { emptyChildDraft, useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import { readingLevelForAge } from '../../domain/generators/audience'
import { templateGenerator } from '../../domain/generators/templateGenerator'
import { DEFAULT_GENERAL, defaultOptions } from '../../domain/defaults'
import type { ChildProfile } from '../../domain/models'
import { track } from '../../app/analytics'
import JourneySteps from './JourneySteps.vue'

/**
 * /joulukirjad: the Christmas letters. One question (who is it for: one child or several) and
 * the 24 free letters are ready at once, as a linked family series for siblings; making them
 * more personal is offered on the next page. A child already in this browser needs no typing.
 */
provide(DESIGN_KEY, 'new')
const router = useRouter()
const children = useChildrenStore()
const creations = useCreationsStore()

// Several children make one linked family series, as in the wizard.
const pickedIds = ref<string[]>(children.children[0] ? [children.children[0].id] : [])
const name = ref('')
const age = ref<number | ''>('')
const adding = ref(children.children.length === 0)
const error = ref('')
const busy = ref(false)

const picked = computed(() => children.children.filter((child) => pickedIds.value.includes(child.id)))
function toggle(id: string): void {
  pickedIds.value = pickedIds.value.includes(id) ? pickedIds.value.filter((other) => other !== id) : [...pickedIds.value, id]
}
const count = computed(() => picked.value.length + (adding.value ? 1 : 0))

// Optional, but each picked topic brings its own hand-written stories into the free letters.
// Asked here only for one child; with several, each brings the topics of its own profile.
const single = computed(() => (count.value === 1 ? (adding.value ? null : picked.value[0]) : undefined))
const topics = ref<TopicId[]>([])
watch(single, (child) => (topics.value = [...(child?.topics ?? [])]), { immediate: true })

onMounted(() => track('christmas_start', {}))

function childrenForLetters(): ChildProfile[] | null {
  if (!count.value) {
    error.value = 'Vali, kellele kirjad on.'
    return null
  }
  const chosen = picked.value.map((child) => {
    if (!single.value) return child
    const { id, createdAt: _created, updatedAt: _updated, ...profile } = child
    children.update(id, { ...profile, topics: topics.value })
    return children.byId(id) ?? child
  })
  if (!adding.value) return chosen
  const added = newChild()
  return added ? [...chosen, added] : null
}

function newChild(): ChildProfile | null {
  const trimmed = name.value.trim()
  const years = Number(age.value)
  if (!trimmed) {
    error.value = 'Kirjuta lapse nimi.'
    return null
  }
  if (age.value === '' || !Number.isInteger(years) || years < 0 || years > 14) {
    error.value = 'Kirjuta lapse vanus (0–14).'
    return null
  }
  track('child_added', { from: 'wizard' })
  return children.add({
    ...emptyChildDraft(),
    name: trimmed,
    age: years,
    readingLevel: readingLevelForAge(years),
    topics: single.value === null ? topics.value : [],
  })
}

async function start(): Promise<void> {
  if (busy.value) return
  error.value = ''
  const chosen = childrenForLetters()
  if (!chosen) return
  busy.value = true
  try {
    const content = await templateGenerator.generate({
      contentType: 'letter',
      children: chosen.map((child) => ({ ...child })),
      occasionId: 'christmas',
      general: { ...DEFAULT_GENERAL },
      seed: Date.now() % 2147483647,
      options: defaultOptions('christmas').letter,
    })
    creations.add(content)
    track('free_generated', { type: 'letter', occasion: 'christmas', items: content.items.length })
    await router.push(`${CHRISTMAS_ROOT}/${content.id}`)
  } catch {
    error.value = 'Kirjade tegemine ei õnnestunud. Proovi uuesti.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="design-new christmas">
    <section class="container section christmas-start" aria-labelledby="christmas-title">
      <Mascot mood="wave" :size="88" />
      <h1 id="christmas-title">Päkapikk kirjutab sinu lapsele 24 jõulukirja</h1>
      <p class="christmas-start__lead">Üks kiri igaks hommikuks 1.–24. detsembrini. Prindi välja ja peida sussi sisse. Tasuta.</p>
      <JourneySteps :current="1" />

      <form class="christmas-start__form" novalidate @submit.prevent="start">
        <fieldset v-if="children.children.length" class="christmas-start__kids">
          <legend>Kellele? <span class="christmas-start__optional">võid valida mitu</span></legend>
          <label v-for="child in children.children" :key="child.id" class="kid" :class="{ 'is-active': pickedIds.includes(child.id) }">
            <input type="checkbox" class="visually-hidden" :checked="pickedIds.includes(child.id)" @change="toggle(child.id)" />
            {{ child.name }}
          </label>
          <label class="kid" :class="{ 'is-active': adding }">
            <input v-model="adding" type="checkbox" class="visually-hidden" />
            + Uus laps
          </label>
        </fieldset>
        <p v-if="count > 1" class="christmas-start__family">
          Õed-vennad saavad seotud kirjad: sama päkapikumaailm, igaühele oma abiline ja vahel ühine ülesanne.
        </p>
        <p v-else class="christmas-start__who">Kellele?</p>

        <div v-if="adding" class="christmas-start__new">
          <label class="field">
            <span>Lapse nimi</span>
            <input v-model="name" class="input" type="text" autocomplete="off" enterkeyhint="next" />
          </label>
          <label class="field">
            <span>Vanus</span>
            <input v-model.number="age" class="input" type="number" min="0" max="14" inputmode="numeric" enterkeyhint="go" />
          </label>
        </div>

        <!-- Folded, so the button stays in sight; the summary says what picking a topic brings. -->
        <details v-if="count <= 1" class="christmas-start__topics">
          <summary>
            Mis lapsele meeldib?
            <span class="christmas-start__optional">
              {{ topics.length ? `${topics.length} valitud` : 'valikuline, siis tulevad kirjadesse tema lood' }}
            </span>
          </summary>
          <p class="christmas-start__hint">Iga teema kohta on kirjades valmis lood, näiteks päkapikk proovib ise jalgpalli.</p>
          <TopicPicker v-model="topics" />
        </details>

        <p v-if="error" class="christmas-start__error" role="alert">{{ error }}</p>
        <BaseButton type="submit" size="lg" :disabled="busy">
          {{ busy ? 'Päkapikk kirjutab…' : count > 1 ? `Loo ${count} lapsele tasuta kirjad` : 'Loo tasuta kirjad' }} <ArrowRight aria-hidden="true" />
        </BaseButton>
      </form>
      <p class="christmas-start__note">Kontot pole vaja. Lapse andmed ja kirjad jäävad sinu brauserisse.</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.christmas-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  max-width: 36rem;
  text-align: center;
  h1 {
    margin: 0;
    font-size: clamp(1.7rem, 5vw, 2.5rem);
    text-wrap: balance;
  }
}
.christmas-start__lead {
  margin: 0;
  color: var(--ink-soft);
}
.christmas-start__form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  align-self: stretch;
  padding: 1.25rem;
  border: 2px solid #f0e2cf;
  border-radius: 16px;
  background: #fff;
  @media (max-width: 480px) {
    padding: 1rem;
    :deep(.btn) {
      align-self: stretch;
      justify-content: center;
    }
  }
}
.christmas-start__kids {
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
.christmas-start__who {
  margin: 0;
  font-weight: 600;
}
.kid {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
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
.christmas-start__new {
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
.christmas-start__family {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.christmas-start__topics {
  align-self: stretch;
  text-align: left;
  summary {
    cursor: pointer;
    font-weight: 600;
    padding-block: 0.35rem;
  }
}
.christmas-start__optional {
  font-weight: 400;
  color: var(--ink-faint);
}
.christmas-start__hint {
  margin: 0.4rem 0 0.75rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.christmas-start__error {
  margin: 0;
  color: var(--danger);
}
.christmas-start__note {
  margin: 0;
  color: var(--ink-faint);
  font-size: 0.9rem;
}
</style>
