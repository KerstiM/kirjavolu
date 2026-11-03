<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Gift, Sparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import ListInput from '../../components/ui/ListInput.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import { useChildrenStore } from '../children/childrenStore'
import { nameCase } from '../../domain/text/estonian'
import type { ChildProfile } from '../../domain/models'
import { LETTER_LENGTH_OPTIONS, readDecember, writeDecember, type LetterLength } from '../pass/passLetters'
import { markPending } from './pending'
import { track } from '../../app/analytics'
import {
  checkPass,
  formatValidUntil,
  isActive,
  openCheckout,
  PASS_ERROR_TEXTS,
  PASS_PRICE,
  PassRequestError,
  type EmbeddedCheckout,
  type SeasonPass,
} from '../pass/seasonPass'

/**
 * "Muuda kirjad veel isiklikumaks": below the free letters, what the personal ones add (only
 * what the server's writer really uses), what it costs and what one purchase covers, three
 * short fields, and then either the letters are written at once (a pass in this browser) or
 * the Jõulupass is bought right here. After paying, Stripe sends the buyer back to this page,
 * which then writes them. Never in the way: the free letters print without any of this.
 */
const props = defineProps<{
  child: ChildProfile
  creationId: string
  items: number
  pass: SeasonPass | null
  busy: boolean
  returnTo: string
  /** Siblings' linked letters: each child's personal series is written on its own, next to them. */
  family?: boolean
}>()
const emit = defineEmits<{ write: []; pass: [pass: SeasonPass] }>()
/** How long each letter will be; the page keeps it, so writing again uses the same choice. */
const length = defineModel<LetterLength>('length', { required: true })
const lengthHint = computed(() => LETTER_LENGTH_OPTIONS.find((option) => option.value === length.value)?.hint)
const children = useChildrenStore()

const about = reactive({
  family: [...props.child.family],
  interests: [...props.child.interests],
  december: readDecember(props.child.id),
})
const active = computed(() => !!props.pass && isActive(props.pass))
const whom = computed(() => nameCase(props.child, 'genitive'))
const allative = computed(() => nameCase(props.child, 'allative'))
const thin = computed(() => !about.family.length && !about.interests.length && !about.december.trim())

/** What the free letters already have and what the personal ones add; true to both generators. */
const ROWS: { label: string; free: string; personal: string }[] = [
  { label: '24 kirja, üks igaks hommikuks 1.–24. detsembrini', free: 'Jah', personal: 'Jah' },
  { label: 'Lapse nimi, tema vanusele ja lugemisoskusele sobiv tekst', free: 'Jah', personal: 'Jah' },
  { label: 'Huvid ja lemmikud', free: 'Valitud teemade valmis lood', personal: 'Sinu enda sõnadega' },
  { label: 'Pereliikmed ja lemmikloomad nimepidi', free: '–', personal: 'Jah' },
  { label: 'Detsembri plaanid õigel päeval', free: 'Valikust (nt külaskäik, pidu)', personal: 'Sinu enda sõnadega' },
  { label: 'Terve sari kirjutatud just selle lapse jaoks', free: '–', personal: 'Jah' },
  { label: 'Kirja pikkus', free: 'Umbes 100–120 sõna, vanusele sobiv', personal: '60–260 sõna, vali ise' },
  { label: 'Ise muutmine, printimine ja PDF', free: 'Jah', personal: 'Jah' },
  { label: 'Päkapikult muudatuse palumine („tee lühemaks“)', free: '–', personal: '30 korda' },
]

onMounted(() => {
  if (!active.value) track('paywall_shown', { type: 'letter', items: props.items })
})

/** The fields back into the profile and this browser, so they are there after paying too. */
function save(): void {
  const { id, createdAt: _created, updatedAt: _updated, ...profile } = children.byId(props.child.id) ?? props.child
  children.update(id, { ...profile, family: about.family, interests: about.interests })
  writeDecember(id, about.december)
}

function write(): void {
  save()
  emit('write')
}

// --- buying right here ---------------------------------------------------
const consent = ref(false)
const buying = ref(false)
const buyError = ref('')
const checkoutTarget = ref<HTMLElement | null>(null)
let checkout: EmbeddedCheckout | null = null

async function buy(): Promise<void> {
  if (buying.value || checkout) return
  if (!consent.value) {
    buyError.value = 'Märgi enne ostu, et nõustud tingimustega.'
    return
  }
  save()
  buyError.value = ''
  buying.value = true
  track('premium_selected', { product: 'season-pass' })
  markPending(props.creationId, props.family ? props.child.id : undefined)
  await nextTick()
  try {
    checkout = await openCheckout(checkoutTarget.value!, props.returnTo)
    track('checkout_started', { product: 'season-pass' })
  } catch (failure) {
    buying.value = false
    buyError.value = PASS_ERROR_TEXTS[failure instanceof PassRequestError ? failure.reason : 'failed']
  }
}
onBeforeUnmount(() => checkout?.destroy())

// --- a code bought earlier or on another device -------------------------------
const codeOpen = ref(false)
const code = ref('')
const codeError = ref('')
async function useCode(): Promise<void> {
  codeError.value = ''
  try {
    emit('pass', await checkPass(code.value))
    codeOpen.value = false
  } catch (failure) {
    codeError.value = PASS_ERROR_TEXTS[failure instanceof PassRequestError ? failure.reason : 'failed']
  }
}
</script>

<template>
  <section id="isiklikumaks" class="premium" aria-labelledby="premium-title">
    <header class="premium__head">
      <h2 id="premium-title"><Sparkles :size="22" aria-hidden="true" /> Muuda kirjad veel isiklikumaks</h2>
      <p>
        Lisa lapse päriselu tegemised, pereliikmed ja jõuluplaanid. Nii sünnib kirjasari, mis räägib just
        {{ whom }} maailmast.
      </p>
    </header>

    <p v-if="family" class="premium__family">
      Isiklikud kirjad kirjutatakse igale lapsele eraldi ja igaüks kasutab Jõulupassist ühe kirjasarja. Õdesid-vendi
      nimetatakse pere andmete järgi, aga ühised paarisülesanded on ainult tasuta seotud kirjades.
    </p>

    <div class="premium__compare">
      <table>
        <caption class="visually-hidden">Mis on tasuta kirjades ja mida lisavad isiklikud kirjad</caption>
        <thead>
          <tr>
            <td />
            <th scope="col">Tasuta kirjad</th>
            <th scope="col" class="premium__col-pass">Isiklikud kirjad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in ROWS" :key="row.label">
            <th scope="row">{{ row.label }}</th>
            <td :class="{ 'is-none': row.free === '–' }">{{ row.free }}</td>
            <td>{{ row.personal }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="premium__facts" aria-label="Mida Jõulupass sisaldab">
      <li><strong>{{ PASS_PRICE }} ühekordne makse.</strong> Püsimakset ega kasutajakontot pole.</li>
      <li><strong>10 kirjasarja või lugu.</strong> Üks sari on ühe lapse 24 kirja, nii et jätkub ka õdedele-vendadele.</li>
      <li><strong>Kehtib 31. jaanuarini.</strong> Kirjad jäävad sinu brauserisse: muuda, prindi ja salvesta PDF-ina nagu tasuta kirju.</li>
    </ul>

    <div class="premium__fields">
      <label class="field">
        <span>Pere ja lemmikloomad</span>
        <ListInput id="premium-family" v-model="about.family" placeholder="ema, isa, õde Mia, kass Miisu" />
      </label>
      <label class="field">
        <span>Huvid ja lemmikud</span>
        <ListInput id="premium-interests" v-model="about.interests" placeholder="dinosaurused, Lego, ujumine" />
      </label>
      <label class="field field--wide">
        <span>Selle detsembri plaanid</span>
        <textarea
          id="premium-december"
          v-model="about.december"
          class="textarea"
          rows="2"
          maxlength="1000"
          placeholder="6.12 vanaema juurde, 13.12 lasteaia jõulupidu, 20.12 piparkoogid"
        />
      </label>
      <SegmentedControl
        v-model="length"
        class="field--wide"
        name="premium-length"
        label="Kirjade pikkus"
        :options="LETTER_LENGTH_OPTIONS"
        :hint="lengthHint"
      />
      <p v-if="thin" class="premium__thin field--wide">Mida rohkem siia kirjutad, seda isiklikumad kirjad tulevad. Tühjade väljadega jäävad kirjad üldisemaks.</p>
    </div>

    <template v-if="active && pass">
      <BaseButton size="lg" :disabled="busy" @click="write">
        <Sparkles aria-hidden="true" /> Kirjuta {{ allative }} isiklikud kirjad
      </BaseButton>
      <p class="premium__note">
        Sul on Jõulupass {{ pass.code }}. See kasutab ühe kirjasarja, alles on {{ pass.generationsLeft }}, kehtib kuni
        {{ formatValidUntil(pass) }}.
        {{ family ? 'Tasuta pere kirjad jäävad alles.' : 'Isiklikud kirjad tulevad nende mallikirjade asemele.' }}
      </p>
    </template>
    <template v-else>
      <label v-if="!buying" class="premium__consent">
        <input v-model="consent" type="checkbox" @change="buyError = ''" />
        <span>
          Nõustun <RouterLink to="/tingimused">müügitingimustega</RouterLink> ja soovin, et Jõulupass hakkaks kohe
          kehtima. Tean, et sellega kaob 14-päevane taganemisõigus.
        </span>
      </label>
      <BaseButton v-if="!buying" size="lg" @click="buy">
        <Gift aria-hidden="true" /> Osta Jõulupass {{ PASS_PRICE }} ja kirjuta
      </BaseButton>
      <p v-if="buyError" class="premium__error" role="alert">{{ buyError }}</p>
      <p v-if="buying" class="premium__note">Makse käib Stripe'i turvalises aknas. Pärast makset tuled siia tagasi ja päkapikk hakkab kohe kirjutama.</p>
      <div v-if="buying" ref="checkoutTarget" class="premium__checkout" />
      <p class="premium__note">
        Pole kohustust: tasuta kirjad saad ka ilma passita välja printida.
        <button v-if="!codeOpen" type="button" class="premium__link" @click="codeOpen = true">Mul on juba kood</button>
      </p>
      <form v-if="codeOpen" class="premium__code" @submit.prevent="useCode">
        <label class="visually-hidden" for="premium-code">Jõulupassi kood</label>
        <input id="premium-code" v-model="code" class="input" placeholder="KV-7KQM-3FXA" autocomplete="off" autocapitalize="characters" />
        <BaseButton type="submit" variant="secondary" size="sm">Kasuta koodi</BaseButton>
        <p v-if="codeError" class="premium__error" role="alert">{{ codeError }}</p>
      </form>
    </template>
    <p class="premium__privacy">
      Isiklikud kirjad kirjutab päkapikk tehisaru (Anthropic Claude) abil. Selleks saadetakse sinna lapse eesnimi, vanus,
      lugemisoskus, profiili andmed (mitte märkmed lapsevanemale) ja see, mida siia kirjutasid. Neid ei salvestata.
      <RouterLink to="/privaatsus">Loe privaatsuse kohta</RouterLink>
    </p>
  </section>
</template>

<style scoped lang="scss">
.premium {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid #f5c4b3;
  border-radius: 16px;
  background: #fff;
  scroll-margin-top: 5rem;
  @media (max-width: 480px) {
    padding: 1rem;
  }
  p {
    margin: 0;
  }
}
.premium__head {
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.35rem;
    font-size: clamp(1.3rem, 3.5vw, 1.6rem);
    color: var(--coral-ink);
  }
  p {
    color: var(--ink-soft);
  }
}
.premium__family {
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-sm);
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  font-size: 0.9rem;
}
.premium__compare {
  align-self: stretch;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1.5px solid #f0e2cf;
  border-radius: 12px;
  font-size: 0.9rem;
  overflow: hidden;
}
th,
td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f0e2cf;
  text-align: left;
  vertical-align: top;
}
thead th,
thead td {
  border-top: 0;
  font-weight: 700;
}
tbody th {
  font-weight: 400;
}
.premium__col-pass {
  background: var(--coral-soft);
  color: var(--coral-ink);
}
.is-none {
  color: var(--ink-faint);
}
@media (max-width: 480px) {
  th,
  td {
    padding: 0.45rem 0.5rem;
    font-size: 0.85rem;
  }
}
.premium__facts {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding-left: 1.2rem;
}
.premium__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0.75rem;
  align-self: stretch;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.field--wide {
  grid-column: 1 / -1;
}
.premium__thin {
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.premium__consent {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  font-size: 0.9rem;
  input {
    margin-top: 0.25rem;
    width: 1.1rem;
    height: 1.1rem;
    flex: none;
    accent-color: var(--lavender);
  }
}
.premium__checkout {
  align-self: stretch;
  min-height: 20rem;
}
.premium__note {
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.premium__link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--lavender-ink);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.premium__code {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  .input {
    max-width: 14rem;
    text-transform: uppercase;
  }
}
.premium__error {
  color: var(--danger);
}
.premium__privacy {
  font-size: 0.8rem;
  color: var(--ink-faint);
}
</style>
