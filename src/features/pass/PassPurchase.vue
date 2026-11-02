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
const open = ref(false)
const busy = ref(false)
const error = ref('')
const target = ref<HTMLElement | null>(null)
let checkout: EmbeddedCheckout | null = null

async function buy(): Promise<void> {
  if (busy.value || checkout) return
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
      Jõulupassiga kirjutab päkapikk sinu lapsele kirjad AI abil. Sees on 10 AI-genereerimist, mis kehtivad kuni 31.
      jaanuarini. Ühekordne makse {{ PASS_PRICE }}, püsimaksu ega kontot pole.
    </p>
    <BaseButton v-if="!open" size="lg" :disabled="busy" @click="buy">
      <Gift aria-hidden="true" /> Osta Jõulupass – {{ PASS_PRICE }}
    </BaseButton>
    <p v-if="busy" class="pass-buy__note" role="status">Makseaken avaneb…</p>
    <p v-if="error" class="pass-buy__error" role="alert">{{ error }}</p>
    <div v-if="open" ref="target" class="pass-buy__checkout" />
    <p class="pass-buy__note">
      Makse käib Stripe'i kaudu. Pärast makset saad koodi kujul KV-XXXX-XXXX, mis jääb sellesse brauserisse meelde.
      <RouterLink :to="`${NEW_DESIGN_ROOT}/joulupass`">Mul on juba Jõulupass</RouterLink>
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
