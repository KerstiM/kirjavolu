<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Gift, PartyPopper } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import FormField from '../../components/ui/FormField.vue'
import PassLetters from './PassLetters.vue'
import PassPurchase from './PassPurchase.vue'
import PassComparison from './PassComparison.vue'
import { DESIGN_KEY } from '../../components/brand/design'
import {
  checkPass,
  formatValidUntil,
  isActive,
  loadPass,
  PASS_ERROR_TEXTS,
  PassRequestError,
  purchaseStatus,
  type SeasonPass,
} from './seasonPass'

/**
 * /joulupass (and the earlier /uus-disain/joulupass): Stripe sends the buyer here after paying (?session_id=…) and the
 * page shows the code. Without a purchase it is "Mul on Jõulupass": type the code in on any
 * device and the server says how many AI generations are left.
 */
provide(DESIGN_KEY, 'new')
const route = useRoute()
const router = useRouter()

const pass = ref<SeasonPass | null>(loadPass())
const justBought = ref(false)
const purchase = ref<'' | 'checking' | 'processing' | 'open' | 'expired' | 'failed'>('')
const code = ref('')
const busy = ref(false)
const error = ref('')
let retry: ReturnType<typeof setTimeout> | undefined

async function checkPurchase(sessionId: string, attempt = 0): Promise<void> {
  purchase.value = 'checking'
  try {
    const result = await purchaseStatus(sessionId)
    if (result.status === 'paid') {
      pass.value = result.pass
      justBought.value = true
      purchase.value = ''
      // The code is saved; a reload should not ask Stripe again.
      router.replace({ query: {} })
      return
    }
    purchase.value = result.status
    // Some payment methods confirm a little later; look again for a minute or so.
    if (result.status === 'processing' && attempt < 12) retry = setTimeout(() => checkPurchase(sessionId, attempt + 1), 5000)
  } catch {
    purchase.value = 'failed'
  }
}

async function submit(): Promise<void> {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    pass.value = await checkPass(code.value)
    justBought.value = false
    code.value = ''
  } catch (failure) {
    error.value = PASS_ERROR_TEXTS[failure instanceof PassRequestError ? failure.reason : 'failed']
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  const sessionId = route.query.session_id
  if (typeof sessionId === 'string' && sessionId) void checkPurchase(sessionId)
})
onBeforeUnmount(() => clearTimeout(retry))
</script>

<template>
  <div class="design-new">
    <div class="container section pass-page">
      <header>
        <span class="eyebrow pass-page__tag">Jõulupass</span>
        <h1>{{ pass ? 'Mul on Jõulupass' : 'Jõulupass' }}</h1>
      </header>

      <p v-if="purchase === 'checking'" role="status">Kontrollin makset…</p>
      <p v-else-if="purchase === 'processing'" role="status">
        Makse on teel. Kood ilmub siia, kui pank on makse kinnitanud. Leht kontrollib seda ise.
      </p>
      <p v-else-if="purchase === 'open' || purchase === 'expired'" class="pass-page__error" role="alert">
        Makse jäi pooleli ja raha ei võetud. Proovi allpool uuesti.
      </p>
      <p v-else-if="purchase === 'failed'" class="pass-page__error" role="alert">
        Makset ei õnnestunud kontrollida. Kui raha võeti, on kood ka Stripe'i kviitungil. Värskenda lehte hetke pärast.
      </p>

      <section v-if="pass" class="pass-card" aria-labelledby="pass-card-title">
        <h2 id="pass-card-title">
          <template v-if="justBought"><PartyPopper :size="22" aria-hidden="true" /> Aitäh! Sinu Jõulupass on valmis</template>
          <template v-else><Gift :size="22" aria-hidden="true" /> Sinu Jõulupass</template>
        </h2>
        <p class="pass-card__code" data-testid="pass-code">{{ pass.code }}</p>
        <p>
          Kirjasarju või lugusid alles: <strong>{{ pass.generationsLeft }}</strong>. Kehtib kuni
          <strong>{{ formatValidUntil(pass) }}</strong>.
          <template v-if="pass.fixesLeft !== undefined"> Päkapiku muudatusi alles: <strong>{{ pass.fixesLeft }}</strong>.</template>
        </p>
        <p v-if="!isActive(pass)" class="pass-page__error">See pass ei kehti enam.</p>
        <p class="pass-card__hint">
          Kirjuta kood üles. See on meeles selles brauseris ja teises seadmes saad selle siia sisestada. Kood on ka
          Stripe'i makse kirjelduses.
        </p>
      </section>

      <PassLetters v-if="pass && isActive(pass)" :pass="pass" @spent="(next) => (pass = next)" />

      <template v-if="!pass && ['', 'open', 'expired'].includes(purchase)">
        <PassComparison />
        <PassPurchase on-pass-page />
      </template>

      <form class="pass-form" @submit.prevent="submit">
        <h2>{{ pass ? 'Teine kood?' : 'Mul on juba Jõulupass' }}</h2>
        <FormField id="pass-code" label="Jõulupassi kood" hint="Näiteks KV-7KQM-3FXA" :error="error">
          <template #default="{ describedBy, invalid }">
            <input
              id="pass-code"
              v-model="code"
              class="input pass-form__input"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              maxlength="20"
              required
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </template>
        </FormField>
        <BaseButton type="submit" :disabled="busy">{{ busy ? 'Kontrollin…' : 'Kontrolli koodi' }}</BaseButton>
      </form>

    </div>
  </div>
</template>

<style scoped lang="scss">
.pass-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 640px;
  h1 {
    font-size: clamp(1.7rem, 4.5vw, 2.4rem);
    font-weight: 600;
    letter-spacing: -0.02em;
  }
}
.pass-page__tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: #fbe3db;
  color: var(--coral-ink);
  letter-spacing: normal;
  text-transform: none;
  transform: rotate(-2deg);
}
.pass-page__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
}
.pass-card {
  padding: 1.5rem;
  border: 2px dashed var(--lavender-mid);
  border-radius: 14px;
  background: #fff;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem;
    font-size: 1.3rem;
    color: var(--lavender-ink);
  }
  p {
    margin: 0 0 0.6rem;
  }
}
.pass-card__code {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  overflow-wrap: anywhere;
}
.pass-card__hint {
  font-size: 0.88rem;
  color: var(--ink-soft);
}
.pass-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
  :deep(.field) {
    align-self: stretch;
  }
}
.pass-form__input {
  max-width: 18rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
