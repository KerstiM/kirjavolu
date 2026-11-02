<script setup lang="ts">
import { computed } from 'vue'
import { Gift, Sparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { NEW_DESIGN_ROOT } from '../../components/brand/design'
import type { GeneratedContent } from '../../domain/models'
import { namesInCase } from '../../domain/text/estonian'
import { isActive, loadPass, PASS_PRICE } from './seasonPass'

/**
 * Beside template Christmas letters: the moment a parent has just seen what the templates
 * write is when the Jõulupass makes sense, so it is offered here. With a pass in this
 * browser it leads straight to writing the AI letters instead.
 */
const props = defineProps<{ content: GeneratedContent }>()

const pass = loadPass()
const active = pass !== null && isActive(pass)
const whom = computed(() => namesInCase(props.content.request.children, 'genitive'))
</script>

<template>
  <section class="pass-offer" aria-labelledby="pass-offer-title">
    <h2 id="pass-offer-title">
      <component :is="active ? Sparkles : Gift" :size="20" aria-hidden="true" />
      {{ active ? 'Isiklikud kirjad' : 'Kirjad päriselt sinu lapse kohta' }}
    </h2>
    <p v-if="active">
      Sul on Jõulupass. Päkapikk kirjutab kõik 24 kirja {{ whom }} kohta, pere ja selle detsembri plaanide järgi.
      Kirjasarju või lugusid alles: {{ pass?.generationsLeft }}.
    </p>
    <p v-else>
      Need on mallikirjad. Päkapikk ei tea {{ whom }} perest ega sellest, mis teil detsembris plaanis on. Jõulupassiga
      kirjutab ta kõik 24 kirja päriselt {{ whom }} kohta. Ühekordne makse {{ PASS_PRICE }}.
    </p>
    <BaseButton :to="`${NEW_DESIGN_ROOT}/joulupass`" size="sm" :variant="active ? 'primary' : 'secondary'">
      {{ active ? 'Kirjuta isiklikud kirjad' : 'Vaata Jõulupassi' }}
    </BaseButton>
  </section>
</template>

<style scoped lang="scss">
.pass-offer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: var(--coral-soft);
  h2 {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    font-size: 1.1rem;
    color: var(--coral-ink);
  }
  p {
    margin: 0;
    font-size: 0.92rem;
  }
}
</style>
