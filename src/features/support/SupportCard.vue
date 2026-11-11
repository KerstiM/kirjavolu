<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { openCheckout, PASS_ERROR_TEXTS, PassRequestError, preloadStripeJs, type EmbeddedCheckout } from '../pass/seasonPass'
import { hasSupported, SUPPORT_ENDPOINT, SUPPORT_PRICE, SUPPORT_QUERY, supportStatus } from './support'
import { track } from '../../app/analytics'

/**
 * Beside the print choices: the letters are free, and "Toeta autorit" opens Stripe's payment
 * form right here. Stripe sends the supporter back to this page with ?toetus=cs_…, and the box
 * says thank you once Stripe confirms; on this device it keeps saying so. Stripe.js loads with the
 * page, and until Stripe's form has loaded the box says it is coming: Apple Pay and Google Pay
 * appear in it last, after Stripe has asked the browser.
 */
const route = useRoute()
const router = useRouter()
const thanked = ref(hasSupported())
const open = ref(false)
const busy = ref(false)
/** From the press until Stripe's form inside the box has loaded. */
const loading = ref(false)
const note = ref('')
const error = ref('')
const target = ref<HTMLElement | null>(null)
let checkout: EmbeddedCheckout | null = null

async function support(): Promise<void> {
  if (busy.value || checkout) return
  busy.value = true
  loading.value = true
  error.value = ''
  open.value = true
  await nextTick()
  try {
    checkout = await openCheckout(target.value!, route.path, SUPPORT_ENDPOINT)
    // The side panel scrolls on its own; the form opens below the fold otherwise.
    target.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    track('support_started', {})
    await formLoaded(target.value)
  } catch (failure) {
    open.value = false
    error.value = PASS_ERROR_TEXTS[failure instanceof PassRequestError ? failure.reason : 'failed']
  } finally {
    busy.value = false
    loading.value = false
  }
}

/** Stripe's iframe has loaded, or 10 seconds have passed: either way the form shows for itself. */
function formLoaded(element: HTMLElement | null): Promise<void> {
  const frame = element?.querySelector('iframe')
  if (!frame) return Promise.resolve()
  return new Promise((resolve) => {
    frame.addEventListener('load', () => resolve(), { once: true })
    setTimeout(resolve, 10_000)
  })
}

onMounted(async () => {
  if (!thanked.value) preloadStripeJs()
  const sessionId = route.query[SUPPORT_QUERY]
  if (typeof sessionId !== 'string') return
  // The address goes back to the plain page, so a reload or a shared link does not ask again.
  const query = { ...route.query }
  delete query[SUPPORT_QUERY]
  void router.replace({ query })
  const status = await supportStatus(sessionId)
  if (status === 'paid') {
    thanked.value = true
    track('support_paid', {})
  } else if (status === 'processing') note.value = 'Makse on veel töötlemisel. Aitäh juba ette!'
  else if (status === 'failed') note.value = 'Makset ei õnnestunud kontrollida. Kui raha võeti, on kviitung sinu e-postis.'
})

onBeforeUnmount(() => checkout?.destroy())
</script>

<template>
  <section class="support no-print" aria-labelledby="support-title">
    <h3 id="support-title"><Heart :size="18" aria-hidden="true" /> {{ thanked ? 'Aitäh toetuse eest!' : 'Kirjad on tasuta' }}</h3>
    <p v-if="thanked" class="support__text">Sinu toetus aitab teha uusi kirju ja tegevusi. Prindi ja laadi alla nii palju, kui soovid.</p>
    <template v-else>
      <p class="support__text">
        Prindi ja laadi alla nii palju, kui soovid. Kui kirjad tõid rõõmu, saad soovi korral autorit toetada.
      </p>
      <BaseButton v-if="!open" variant="secondary" size="sm" :disabled="busy" @click="support">
        <Heart aria-hidden="true" /> Toeta autorit – {{ SUPPORT_PRICE }}
      </BaseButton>
      <p v-if="loading" class="support__loading" role="status">
        <span class="support__spinner" aria-hidden="true" /> Makseaken avaneb… Apple Pay ja Google Pay ilmuvad mõne hetke pärast.
      </p>
      <div v-if="open" ref="target" class="support__checkout" />
      <p class="support__note">Makse käib Stripe'i kaudu. See on vabatahtlik ega muuda kirjades midagi.</p>
    </template>
    <p v-if="note" class="support__note" role="status">{{ note }}</p>
    <p v-if="error" class="support__error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped lang="scss">
.support {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border: 2px solid #f0e2cf;
  border-radius: 14px;
  background: #fffdf8;
  h3 {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    font-size: 1rem;
    color: var(--coral-ink);
  }
}
.support__text {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.support__note {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ink-faint);
}
.support__loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.support__spinner {
  flex: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid #f0e2cf;
  border-top-color: var(--coral-ink);
  border-radius: 50%;
  animation: support-spin 0.8s linear infinite;
}
@keyframes support-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .support__spinner {
    animation-duration: 2.4s;
  }
}
.support__error {
  margin: 0;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
  font-size: 0.9rem;
}
.support__checkout {
  align-self: stretch;
  min-height: 20rem;
}
</style>
