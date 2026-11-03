<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { Gift, Sparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import ListInput from '../../components/ui/ListInput.vue'
import { useChildrenStore } from '../children/childrenStore'
import { nameCase } from '../../domain/text/estonian'
import type { ChildProfile } from '../../domain/models'
import { readDecember, writeDecember } from '../pass/passLetters'
import { markPending } from './pending'
import {
  checkPass,
  isActive,
  openCheckout,
  PASS_ERROR_TEXTS,
  PASS_PRICE,
  PassRequestError,
  type EmbeddedCheckout,
  type SeasonPass,
} from '../pass/seasonPass'

/**
 * "Tee need Rubeni kohta": beside the free letters, three short fields, and then either
 * the letters are written at once (a pass in this browser) or the Jõulupass is bought right
 * here. After paying, Stripe sends the buyer back to this page, which then writes them.
 */
const props = defineProps<{ child: ChildProfile; creationId: string; pass: SeasonPass | null; busy: boolean }>()
const emit = defineEmits<{ write: []; pass: [pass: SeasonPass] }>()
const children = useChildrenStore()

const about = reactive({
  family: [...props.child.family],
  interests: [...props.child.interests],
  december: readDecember(props.child.id),
})
const active = computed(() => !!props.pass && isActive(props.pass))
const whom = computed(() => nameCase(props.child, 'genitive'))
const allative = computed(() => nameCase(props.child, 'allative'))

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
  markPending(props.creationId)
  await nextTick()
  try {
    checkout = await openCheckout(checkoutTarget.value!, `/ud2/kirjad/${props.creationId}`)
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
  <section class="personal" aria-labelledby="personal-title">
    <h2 id="personal-title"><Sparkles :size="22" aria-hidden="true" /> Tee need {{ whom }} kohta</h2>
    <p class="personal__lead">
      Need on mallikirjad. Jõulupassiga kirjutab päkapikk kõik 24 kirja päriselt {{ whom }} kohta: tema pere, huvid ja see,
      mis teil detsembris plaanis on.
    </p>

    <div class="personal__fields">
      <label class="field">
        <span>Pere ja lemmikloomad</span>
        <ListInput id="ud2-family" v-model="about.family" placeholder="ema, isa, õde Mia, kass Miisu" />
      </label>
      <label class="field">
        <span>Huvid ja lemmikud</span>
        <ListInput id="ud2-interests" v-model="about.interests" placeholder="dinosaurused, Lego, ujumine" />
      </label>
      <label class="field field--wide">
        <span>Selle detsembri plaanid</span>
        <textarea
          id="ud2-december"
          v-model="about.december"
          class="textarea"
          rows="2"
          maxlength="1000"
          placeholder="6.12 vanaema juurde, 13.12 lasteaia jõulupidu, 20.12 piparkoogid"
        />
      </label>
    </div>

    <template v-if="active && pass">
      <BaseButton size="lg" :disabled="busy" @click="write">
        <Sparkles aria-hidden="true" /> Kirjuta {{ allative }} isiklikud kirjad
      </BaseButton>
      <p class="personal__note">Sul on Jõulupass. Kasutab ühe kirjasarja, alles on {{ pass.generationsLeft }}.</p>
    </template>
    <template v-else>
      <label v-if="!buying" class="personal__consent">
        <input v-model="consent" type="checkbox" @change="buyError = ''" />
        <span>
          Nõustun <RouterLink to="/uus-disain/tingimused">müügitingimustega</RouterLink> ja soovin, et Jõulupass hakkaks kohe
          kehtima. Tean, et sellega kaob 14-päevane taganemisõigus.
        </span>
      </label>
      <BaseButton v-if="!buying" size="lg" @click="buy">
        <Gift aria-hidden="true" /> Osta Jõulupass {{ PASS_PRICE }} ja kirjuta
      </BaseButton>
      <p v-if="buyError" class="personal__error" role="alert">{{ buyError }}</p>
      <div v-if="buying" ref="checkoutTarget" class="personal__checkout" />
      <p class="personal__note">
        Passiga saad 10 kirjasarja või lugu ja 30 päkapiku muudatust kuni 31. jaanuarini.
        <button v-if="!codeOpen" type="button" class="personal__link" @click="codeOpen = true">Mul on juba kood</button>
      </p>
      <form v-if="codeOpen" class="personal__code" @submit.prevent="useCode">
        <label class="visually-hidden" for="ud2-code">Jõulupassi kood</label>
        <input id="ud2-code" v-model="code" class="input" placeholder="KV-7KQM-3FXA" autocomplete="off" />
        <BaseButton type="submit" variant="secondary" size="sm">Kasuta koodi</BaseButton>
        <p v-if="codeError" class="personal__error" role="alert">{{ codeError }}</p>
      </form>
    </template>
    <p class="personal__privacy">
      Kirjad kirjutab päkapikk tehisaru (Anthropic Claude) abil. Selleks saadetakse sinna lapse eesnimi, vanus ja see, mida
      siia kirjutasid. Neid ei salvestata.
    </p>
  </section>
</template>

<style scoped lang="scss">
.personal {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid #f5c4b3;
  border-radius: 16px;
  background: #fff;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.35rem;
    color: var(--coral-ink);
  }
  p {
    margin: 0;
  }
}
.personal__lead {
  color: var(--ink-soft);
}
.personal__fields {
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
.personal__consent {
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
.personal__checkout {
  align-self: stretch;
  min-height: 20rem;
}
.personal__note {
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.personal__link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--lavender-ink);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.personal__code {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  .input {
    max-width: 14rem;
    text-transform: uppercase;
  }
}
.personal__error {
  color: var(--danger);
}
.personal__privacy {
  font-size: 0.8rem;
  color: var(--ink-faint);
}
</style>
