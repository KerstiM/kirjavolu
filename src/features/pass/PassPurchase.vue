<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { Gift } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { NEW_DESIGN_ROOT } from '../../components/brand/design'
import { openCheckout, PASS_ERROR_TEXTS, PASS_PRICE, PassRequestError, type EmbeddedCheckout } from './seasonPass'

/**
 * "Osta Jõulupass": the button opens Stripe's payment form right here on the page. After
 * paying, Stripe sends the buyer to /uus-disain/joulupass, which shows the code.
 */
defineProps<{
  /** On the pass page itself the "Mul on juba Jõulupass" form is right below. */
  onPassPage?: boolean
}>()
const open = ref(false)
const busy = ref(false)
const error = ref('')
// Digital content starts at once, so the buyer agrees to that (and to losing the 14-day
// withdrawal right) before paying; without it the right would stay.
const consent = ref(false)
const target = ref<HTMLElement | null>(null)
let checkout: EmbeddedCheckout | null = null

async function buy(): Promise<void> {
  if (busy.value || checkout) return
  if (!consent.value) {
    error.value = 'Märgi enne ostu, et nõustud tingimustega.'
    return
  }
  busy.value = true
  error.value = ''
  open.value = true
  await nextTick()
  try {
    checkout = await openCheckout(target.value!)
  } catch (failure) {
    open.value = false
    error.value = PASS_ERROR_TEXTS[failure instanceof PassRequestError ? failure.reason : 'failed']
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => checkout?.destroy())
</script>

<template>
  <section class="pass-buy" aria-labelledby="pass-buy-title">
    <h2 id="pass-buy-title"><Gift :size="22" aria-hidden="true" /> Jõulupass</h2>
    <p class="pass-buy__lead">
      Mallikirjad on head, aga päkapikk ei tea sinu lapse perest ega tema detsembrist. Jõulupassiga kirjutab ta kõik 24
      detsembrikirja päriselt sinu lapse kohta.
    </p>
    <ul class="pass-buy__list">
      <li>Kirjad tema huvide, pere, lemmikloomade ja <strong>selle detsembri plaanide</strong> järgi: vanaema juurde sõit tuleb jutuks õigel päeval.</li>
      <li><strong>10 kirjasarja või lugu</strong>: üks sari on ühe lapse kõik 24 kirja.</li>
      <li><strong>30 päkapiku muudatust</strong>: kirjuta, mida muuta, ja päkapikk kirjutab selle kirja ümber. Ise saad muuta alati ja tasuta.</li>
      <li>Kehtib 31. jaanuarini. Ühekordne makse {{ PASS_PRICE }}, püsimaksu ega kontot pole.</li>
    </ul>
    <label v-if="!open" class="pass-buy__consent">
      <input v-model="consent" type="checkbox" @change="error = ''" />
      <span>
        Nõustun <RouterLink :to="`${NEW_DESIGN_ROOT}/tingimused`">müügitingimustega</RouterLink> ja soovin, et Jõulupass
        hakkaks kohe kehtima. Tean, et sellega kaob 14-päevane taganemisõigus.
      </span>
    </label>
    <BaseButton v-if="!open" size="lg" :disabled="busy" @click="buy">
      <Gift aria-hidden="true" /> Osta Jõulupass – {{ PASS_PRICE }}
    </BaseButton>
    <p v-if="busy" class="pass-buy__note" role="status">Makseaken avaneb…</p>
    <p v-if="error" class="pass-buy__error" role="alert">{{ error }}</p>
    <div v-if="open" ref="target" class="pass-buy__checkout" />
    <p class="pass-buy__note">
      Makse käib Stripe'i kaudu. Pärast makset saad koodi kujul KV-XXXX-XXXX, mis jääb sellesse brauserisse meelde.
      <RouterLink v-if="!onPassPage" :to="`${NEW_DESIGN_ROOT}/joulupass`">Mul on juba Jõulupass</RouterLink>
    </p>
  </section>
</template>

<style scoped lang="scss">
.pass-buy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  border: 2px solid #f0e2cf;
  border-radius: 14px;
  background: #fffdf8;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 1.35rem;
    color: var(--coral-ink);
  }
}
.pass-buy__lead {
  margin: 0;
  color: var(--ink-soft);
}
.pass-buy__consent {
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
.pass-buy__list {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.pass-buy__note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-faint);
}
.pass-buy__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
}
.pass-buy__checkout {
  align-self: stretch;
  min-height: 20rem;
}
</style>
