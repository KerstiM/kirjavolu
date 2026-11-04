<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, UserPlus } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import FormField from '../../components/ui/FormField.vue'
import ListInput from '../../components/ui/ListInput.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import QuickChildDialog from '../children/QuickChildDialog.vue'
import TopicPicker from '../children/TopicPicker.vue'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import { nameCase } from '../../domain/text/estonian'
import type { ChildProfile, ChildProfileDraft } from '../../domain/models'
import type { TopicId, TopicNotes } from '../../data/topics'
import { track } from '../../app/analytics'
import { LETTERS_ERROR_TEXTS, LettersRequestError, readDecember, requestPassLetters, writeDecember } from './passLetters'
import type { SeasonPass } from './seasonPass'

/**
 * The step after buying: pick a child, tell the elf about them, and the AI writes all 24
 * December letters. The form is the child's own profile, filled in already, so nothing is
 * typed twice: changes are saved to the profile. Only December's plans are kept apart.
 * One series uses one generation of the pass; the letters open in the preview.
 */
const props = defineProps<{ pass: SeasonPass }>()
const emit = defineEmits<{ spent: [pass: SeasonPass] }>()
const router = useRouter()
const children = useChildrenStore()
const creations = useCreationsStore()

const childId = ref(children.children[0]?.id ?? '')
watch(
  () => children.children.length,
  () => {
    if (!children.children.some((child) => child.id === childId.value)) childId.value = children.children[0]?.id ?? ''
  },
)
const child = computed(() => children.children.find((candidate) => candidate.id === childId.value))
const options = computed(() => children.children.map((candidate) => ({ value: candidate.id, label: candidate.name })))

interface About {
  topics: TopicId[]
  topicNotes: TopicNotes
  interests: string[]
  family: string[]
  foods: string[]
  personality: string
  achievements: string[]
  details: string
}
const about = reactive<About>({ topics: [], topicNotes: {}, interests: [], family: [], foods: [], personality: '', achievements: [], details: '' })
const december = ref('')
// Another child picked: the form shows what their profile already says.
watch(
  child,
  (current) => {
    Object.assign(about, {
      topics: [...(current?.topics ?? [])],
      topicNotes: { ...current?.topicNotes },
      interests: [...(current?.interests ?? [])],
      family: [...(current?.family ?? [])],
      foods: [...(current?.foods ?? [])],
      personality: current?.personality ?? '',
      achievements: [...(current?.achievements ?? [])],
      details: current?.details ?? '',
    })
    december.value = current ? readDecember(current.id) : ''
  },
  { immediate: true },
)

const littleKnown = computed(
  () => !about.topics.length && !about.interests.length && !about.family.length && !about.details && !december.value.trim(),
)

/** The form back into the profile. */
function saveAbout(current: ChildProfile): ChildProfile {
  const { id, createdAt: _created, updatedAt: _updated, ...profile } = current
  const draft: ChildProfileDraft = { ...profile, ...about }
  children.update(id, draft)
  writeDecember(id, december.value)
  return children.byId(id) ?? current
}

const adding = ref(false)
function addChild(draft: ChildProfileDraft): void {
  childId.value = children.add(draft).id
  track('child_added', { from: 'pass' })
  adding.value = false
}

const busy = ref(false)
const error = ref('')

async function write(): Promise<void> {
  if (!child.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const saved = saveAbout(child.value)
    const { content, pass } = await requestPassLetters(props.pass.code, saved, december.value)
    creations.add(content)
    emit('spent', pass)
    await router.push({ path: `/looming/${content.id}`, query: { uus: '1' } })
  } catch (failure) {
    error.value = LETTERS_ERROR_TEXTS[failure instanceof LettersRequestError ? failure.reason : 'failed']
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="pass-letters" aria-labelledby="pass-letters-title">
    <h2 id="pass-letters-title"><Sparkles :size="22" aria-hidden="true" /> Järgmine samm: isiklikud kirjad</h2>
    <p class="pass-letters__lead">
      Päkapikk Tuduja kirjutab sinu lapsele kõik 24 detsembrikirja, 1. kuni 24. detsembrini. Üks lapse kirjasari
      kasutab ühe loomiskorra.
    </p>

    <template v-if="child">
      <SegmentedControl v-if="options.length > 1" v-model="childId" name="pass-letters-child" label="Kellele?" :options="options" />

      <form class="about" aria-labelledby="about-title" @submit.prevent="write">
        <h3 id="about-title">Mida päkapikk peaks {{ nameCase(child, 'genitive') }} kohta teadma?</h3>
        <p class="about__hint">
          Mida rohkem kirjutad, seda rohkem on kirjad just {{ nameCase(child, 'genitive') }} kohta. Kõik väljad on
          valikulised ja jäävad lapse profiili meelde.
        </p>

        <FormField
          id="about-december"
          label="Selle detsembri plaanid"
          hint="Kuupäevaga, siis räägib päkapikk neist õigel päeval. Näiteks: 12.12 läheme vanaema juurde Valka, 19.12 lasteaia jõulupidu, 21.12 küpsetame piparkooke."
        >
          <template #default="{ describedBy }">
            <textarea id="about-december" v-model="december" class="textarea" rows="3" maxlength="1000" :aria-describedby="describedBy" />
          </template>
        </FormField>
        <div class="about__grid">
          <FormField id="about-family" label="Pere ja lemmikloomad" hint="nt ema, isa, vend Pääru, kass Miisu">
            <template #default="{ describedBy }">
              <ListInput id="about-family" v-model="about.family" :described-by="describedBy" />
            </template>
          </FormField>
          <FormField id="about-interests" label="Muud huvid ja hobid" hint="nt dinosaurused, ujumine, Lotte raamatud">
            <template #default="{ describedBy }">
              <ListInput id="about-interests" v-model="about.interests" :described-by="describedBy" />
            </template>
          </FormField>
          <FormField id="about-personality" label="Iseloom" hint="nt uudishimulik, naljakas, natuke häbelik">
            <template #default="{ describedBy }">
              <input id="about-personality" v-model="about.personality" class="input" type="text" :aria-describedby="describedBy" />
            </template>
          </FormField>
          <FormField id="about-achievements" label="On õppinud või harjutab" hint="nt rattaga sõitmine, ise riidesse panemine">
            <template #default="{ describedBy }">
              <ListInput id="about-achievements" v-model="about.achievements" :described-by="describedBy" />
            </template>
          </FormField>
          <FormField id="about-foods" label="Lemmiktoidud" hint="nt pannkoogid, mustikad">
            <template #default="{ describedBy }">
              <ListInput id="about-foods" v-model="about.foods" :described-by="describedBy" />
            </template>
          </FormField>
          <FormField id="about-details" label="Muu, mida päkapikk võiks teada" hint="nt kardab pimedat, ootab lund">
            <template #default="{ describedBy }">
              <input id="about-details" v-model="about.details" class="input" type="text" :aria-describedby="describedBy" />
            </template>
          </FormField>
        </div>
        <details class="about__topics">
          <summary>Teemad loendist ({{ about.topics.length }} valitud)</summary>
          <TopicPicker v-model="about.topics" v-model:notes="about.topicNotes" />
        </details>

        <p v-if="littleKnown" class="about__thin">
          {{ child.name }} kohta on veel vähe teada, nii et kirjad tulevad üldisemad. Kas või üks-kaks rida aitab palju.
        </p>
        <BaseButton type="submit" size="lg" :disabled="busy">
          <Sparkles aria-hidden="true" />
          <template v-if="busy">Päkapikk kirjutab 24 kirja…</template>
          <template v-else>Kirjuta {{ nameCase(child, 'allative') }} isiklikud kirjad</template>
        </BaseButton>
        <p v-if="busy" class="pass-letters__wait">See võtab paar minutit. Hoia leht lahti.</p>
      </form>

      <button v-if="!busy" type="button" class="pass-letters__add" @click="adding = true">
        <UserPlus :size="16" aria-hidden="true" /> Lisa veel üks laps
      </button>
    </template>
    <BaseButton v-else size="lg" @click="adding = true"><UserPlus aria-hidden="true" /> Lisa laps, kellele kirjad tulevad</BaseButton>

    <p class="pass-letters__privacy">
      Kirjad kirjutab päkapikk tehisaru (Anthropic Claude) abil. Selleks saadetakse sinna lapse eesnimi, vanus, lugemisoskus ja see, mida
      siin kirjutasid. Märkmeid lapsevanemale ei saadeta. Andmeid ei salvestata, kirjad jäävad sinu brauserisse.
    </p>
    <p v-if="error" class="pass-letters__error" role="alert">{{ error }}</p>
    <p class="visually-hidden" role="status" aria-live="polite">{{ busy ? 'Päkapikk kirjutab…' : '' }}</p>

    <QuickChildDialog v-if="adding" @save="addChild" @close="adding = false" />
  </section>
</template>

<style scoped lang="scss">
.pass-letters {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 14px;
  background: var(--lavender-soft);
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.3rem;
    color: var(--lavender-ink);
  }
  p {
    margin: 0;
  }
}
.about {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  align-self: stretch;
  padding: 1.25rem;
  border-radius: 12px;
  background: #fff;
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  :deep(.field) {
    align-self: stretch;
  }
}
.about__hint {
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.about__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 1rem;
  align-self: stretch;
}
.about__topics {
  align-self: stretch;
  summary {
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
}
.about__thin {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--gold-soft);
  font-size: 0.9rem;
}
.pass-letters__lead {
  color: var(--ink-soft);
}
.pass-letters__wait {
  font-weight: 600;
}
.pass-letters__add {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--lavender-ink);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.pass-letters__privacy {
  font-size: 0.82rem;
  color: var(--ink-faint);
}
.pass-letters__error {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
}
</style>
