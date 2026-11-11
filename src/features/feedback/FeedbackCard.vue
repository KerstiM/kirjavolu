<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
import { FEEDBACK_MAILTO } from './feedback'

/** Under the print choices, once the letters are ready: how did they go down? Opens an e-mail. */
</script>

<template>
  <section class="feedback no-print" aria-labelledby="feedback-title">
    <h3 id="feedback-title"><Mail :size="18" aria-hidden="true" /> Kuidas kirjad meeldisid?</h3>
    <p class="feedback__text">Kirjuta paar rida – mis lapsele meeldis, mis jäi puudu.</p>
    <a class="feedback__link" :href="FEEDBACK_MAILTO">Anna tagasisidet</a>
  </section>
</template>

<style scoped lang="scss">
.feedback {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--line);
  border-radius: 14px;
  background: #fffdf8;
  h3 {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    font-size: 1rem;
  }
}
.feedback__text {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.feedback__link {
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
