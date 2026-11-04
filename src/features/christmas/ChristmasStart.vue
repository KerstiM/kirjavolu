<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Plus, X } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import TopicPicker from '../children/TopicPicker.vue'
import ListInput from '../../components/ui/ListInput.vue'
import { readDecember, writeDecember } from '../pass/passLetters'
import type { TopicId, TopicNotes } from '../../data/topics'
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
// The ones picked last time come back selected, so a child edited on the Lapsed page is still there.
const PICKED_KEY = 'kirjavolu.joulukirjad.valitud'
function rememberedPick(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(PICKED_KEY) ?? '[]') as unknown
    const ids = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string' && !!children.byId(id)) : []
    if (ids.length) return ids
  } catch {
    // Without storage the first child is picked, as for a new visitor.
  }
  return children.children[0] ? [children.children[0].id] : []
}
const pickedIds = ref<string[]>(rememberedPick())
watch(pickedIds, (ids) => {
  try {
    localStorage.setItem(PICKED_KEY, JSON.stringify(ids))
  } catch {
    // Remembering is a convenience only.
  }
})
/** New children typed in here, any number of them: all are saved when the letters are made. */
interface NewKid {
  key: number
  name: string
  age: number | ''
}
let nextKey = 0
const blankKid = (): NewKid => ({ key: nextKey++, name: '', age: '' })
const newKids = ref<NewKid[]>(children.children.length === 0 ? [blankKid()] : [])
const adding = computed(() => newKids.value.length > 0)
function addKid(): void {
  newKids.value = [...newKids.value, blankKid()]
}
function removeKid(key: number): void {
  newKids.value = newKids.value.filter((kid) => kid.key !== key)
}
/** The "+ Uus laps" chip: on adds a row, off takes the typed rows away. */
function toggleAdding(on: boolean): void {
  newKids.value = on ? [blankKid()] : []
}
const error = ref('')
const busy = ref(false)

const picked = computed(() => children.children.filter((child) => pickedIds.value.includes(child.id)))
function toggle(id: string): void {
  pickedIds.value = pickedIds.value.includes(id) ? pickedIds.value.filter((other) => other !== id) : [...pickedIds.value, id]
}
// A row nobody has typed in yet does not count, so the button never says more than there are.
const typed = (kid: NewKid) => kid.name.trim() !== '' || kid.age !== ''
const filledKids = computed(() => newKids.value.filter(typed))
const count = computed(() => picked.value.length + filledKids.value.length)

// Optional, for each child on its own. A picked topic brings its hand-written stories into the
// free letters; the rest is kept in the profile for the personal letters, which are the ones that use it.
interface Extra {
  topics: TopicId[]
  topicNotes: TopicNotes
  family: string[]
  interests: string[]
  december: string
}
const extras = reactive<Record<string, Extra>>({})
/** One block of optional questions per child: those already saved, and the rows typed in here. */
const rows = computed(() => [
  ...picked.value.map((child) => ({ key: `id:${child.id}`, name: child.name, child })),
  ...newKids.value.map((kid, index) => ({
    key: `new:${kid.key}`,
    name: kid.name.trim() || (newKids.value.length > 1 ? `${index + 1}. laps` : 'Laps'),
    child: undefined as ChildProfile | undefined,
  })),
])
watch(
  rows,
  (list) => {
    // A child taken away takes what was typed for them along; picking them again starts from their profile.
    for (const key of Object.keys(extras)) if (!list.some((row) => row.key === key)) delete extras[key]
    for (const { key, child } of list) {
      extras[key] ??= {
        topics: [...(child?.topics ?? [])],
        topicNotes: { ...child?.topicNotes },
        family: [...(child?.family ?? [])],
        interests: [...(child?.interests ?? [])],
        december: child ? readDecember(child.id) : '',
      }
    }
  },
  { immediate: true, flush: 'sync' },
)
const aboutCount = (extra: Extra) =>
  [extra.family.length > 0, extra.interests.length > 0, extra.december.trim() !== ''].filter(Boolean).length

onMounted(() => track('christmas_start', {}))

function childrenForLetters(): ChildProfile[] | null {
  if (!count.value && !adding.value) {
    error.value = 'Vali, kellele kirjad on.'
    return null
  }
  const chosen = picked.value.map((child) => {
    const extra = extras[`id:${child.id}`]
    if (!extra) return child
    const { id, createdAt: _created, updatedAt: _updated, ...profile } = child
    children.update(id, {
      ...profile,
      topics: extra.topics,
      topicNotes: extra.topicNotes,
      family: extra.family,
      interests: extra.interests,
    })
    writeDecember(id, extra.december)
    return children.byId(id) ?? child
  })
  if (!filledKids.value.length) {
    if (chosen.length) return chosen
    error.value = 'Kirjuta lapse nimi.'
    return null
  }
  const added = addNewKids()
  if (added) pickedIds.value = [...chosen, ...added].map((child) => child.id)
  return added ? [...chosen, ...added] : null
}

/** Checks every typed row first, so nobody is saved when one of them still lacks a name or age. */
function addNewKids(): ChildProfile[] | null {
  const many = newKids.value.length > 1
  for (const [index, kid] of newKids.value.entries()) {
    if (!typed(kid)) continue
    const whose = many ? `${index + 1}. lapse` : 'lapse'
    const years = Number(kid.age)
    if (!kid.name.trim()) {
      error.value = `Kirjuta ${whose} nimi.`
      return null
    }
    if (kid.age === '' || !Number.isInteger(years) || years < 0 || years > 14) {
      error.value = `Kirjuta ${whose} vanus (0–14).`
      return null
    }
  }
  return filledKids.value.map((kid) => {
    track('child_added', { from: 'wizard' })
    const extra = extras[`new:${kid.key}`]
    const added = children.add({
      ...emptyChildDraft(),
      name: kid.name.trim(),
      age: Number(kid.age),
      readingLevel: readingLevelForAge(Number(kid.age)),
      topics: extra?.topics ?? [],
      topicNotes: extra?.topicNotes ?? {},
      family: extra?.family ?? [],
      interests: extra?.interests ?? [],
    })
    if (extra) writeDecember(added.id, extra.december)
    return added
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
            <input type="checkbox" class="visually-hidden" :checked="adding" @change="toggleAdding(($event.target as HTMLInputElement).checked)" />
            + Uus laps
          </label>
        </fieldset>
        <p v-if="count > 1" class="christmas-start__family">
          Õed-vennad saavad seotud kirjad: sama päkapikumaailm, igaühele oma abiline ja vahel ühine ülesanne.
        </p>
        <p v-else class="christmas-start__who">Kellele?</p>

        <div v-for="(kid, index) in newKids" :key="kid.key" class="christmas-start__new">
          <label class="field">
            <span>{{ newKids.length > 1 ? `${index + 1}. lapse nimi` : 'Lapse nimi' }}</span>
            <input v-model="kid.name" class="input" type="text" autocomplete="off" enterkeyhint="next" />
          </label>
          <label class="field">
            <span>Vanus</span>
            <input v-model.number="kid.age" class="input" type="number" min="0" max="14" inputmode="numeric" enterkeyhint="go" />
          </label>
          <button
            v-if="newKids.length > 1 || children.children.length"
            type="button"
            class="christmas-start__remove"
            :aria-label="kid.name.trim() ? `Eemalda ${kid.name.trim()}` : `Eemalda ${index + 1}. laps`"
            @click="removeKid(kid.key)"
          >
            <X :size="16" aria-hidden="true" />
          </button>
        </div>
        <button v-if="adding" type="button" class="christmas-start__more" @click="addKid">
          <Plus :size="16" aria-hidden="true" /> Lisa veel üks laps
        </button>

        <!-- Folded, so the button stays in sight; each child has their own, as the letters are theirs. -->
        <div v-for="row in rows" :key="row.key" class="christmas-start__child">
          <p v-if="rows.length > 1" class="christmas-start__whose">{{ row.name }}</p>
          <template v-if="extras[row.key]">
            <details class="christmas-start__topics">
              <summary>
                Mis lapsele meeldib?
                <span class="christmas-start__optional">
                  {{ extras[row.key]!.topics.length ? `${extras[row.key]!.topics.length} valitud` : 'valikuline, siis tulevad kirjadesse tema lood' }}
                </span>
              </summary>
              <p class="christmas-start__hint">Iga teema kohta on kirjades valmis lood. Teema juurde võid kirjutada lapse lemmiku, näiteks korvpall.</p>
              <TopicPicker v-model="extras[row.key]!.topics" v-model:notes="extras[row.key]!.topicNotes" />
            </details>
            <details class="christmas-start__topics">
              <summary>
                Räägi lapsest veel
                <span class="christmas-start__optional">
                  {{ aboutCount(extras[row.key]!) ? `${aboutCount(extras[row.key]!)} lisatud` : 'valikuline, jääb isiklike kirjade jaoks' }}
                </span>
              </summary>
              <p class="christmas-start__hint">
                Tasuta kirjad valmivad ka ilma. Need andmed jäävad lapse juurde ja on valmis, kui teed kirjad isiklikumaks.
              </p>
              <label class="field">
                <span>Pereliikmed ja lemmikloomad</span>
                <ListInput :id="`start-family-${row.key}`" v-model="extras[row.key]!.family" placeholder="Näiteks mamma, issi, kass Miisu" />
              </label>
              <label class="field">
                <span>Huvid ja lemmikud</span>
                <ListInput :id="`start-interests-${row.key}`" v-model="extras[row.key]!.interests" placeholder="Näiteks autod, jalgpall" />
              </label>
              <label class="field">
                <span>Detsembri plaanid</span>
                <textarea v-model="extras[row.key]!.december" class="input" rows="2" placeholder="Näiteks jõulupidu lasteaias 20. detsembril" />
              </label>
            </details>
          </template>
        </div>

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
.christmas-start__child {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-self: stretch;
}
.christmas-start__whose {
  margin: 0;
  font-weight: 600;
  text-align: left;
}
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
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.75rem;
  align-self: stretch;
  text-align: left;
}
.christmas-start__remove {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--ink-faint);
  cursor: pointer;
  &:hover {
    color: var(--danger);
  }
}
.christmas-start__more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  min-height: 2.75rem;
  padding: 0.4rem 0.9rem;
  border: 1.5px dashed var(--lavender-mid);
  border-radius: 999px;
  background: none;
  color: var(--lavender-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
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
