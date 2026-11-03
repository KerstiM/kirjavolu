<script setup lang="ts">
import { computed } from 'vue'
import { Gift, Sparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import type { GeneratedContent } from '../../domain/models'
import { namesInCase } from '../../domain/text/estonian'
import { CHRISTMAS_ROOT } from '../../components/brand/design'
import { isActive, loadPass, PASS_PAGE, PASS_PRICE } from './seasonPass'

/**
 * Beside template Christmas letters: the moment a parent has just seen what the templates
 * write is when the Jõulupass makes sense, so it is offered here. With a pass in this
 * browser it leads straight to writing the AI letters instead. One child's 24 letters go to the
 * Christmas page, where the personal ones replace these in the same creation; anything else
 * goes to the pass page, which writes a new series child by child.
 */
const props = defineProps<{ content: GeneratedContent }>()

const pass = loadPass()
const active = pass !== null && isActive(pass)
const whom = computed(() => namesInCase(props.content.request.children, 'genitive'))
// The personal series is always 24 letters, so only a 24-letter series is replaced in place.
const target = computed(() =>
  props.content.request.children.length === 1 && props.content.items.length === 24
    ? { path: `${CHRISTMAS_ROOT}/${props.content.id}`, hash: '#isiklikumaks' }
    : PASS_PAGE,
)
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
    <BaseButton :to="target" size="sm" :variant="active ? 'primary' : 'secondary'">
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
