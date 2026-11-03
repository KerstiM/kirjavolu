<script setup lang="ts">
import { computed, ref } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import type { GeneratedContent } from '../../domain/models'
import { joinList, namesInCase } from '../../domain/text/estonian'
import { useChildrenStore } from '../children/childrenStore'
import { LettersRequestError, requestStory, STORY_ERROR_TEXTS } from '../pass/passLetters'
import { isActive, PASS_PAGE, type SeasonPass } from '../pass/seasonPass'

/**
 * Beside a template story: the same choices (genre, theme, characters, length) written into a
 * real, long story by the AI with the Jõulupass. Without a pass it says what the pass gives.
 */
const props = defineProps<{ content: GeneratedContent; pass: SeasonPass | null; busyElsewhere?: boolean }>()
const emit = defineEmits<{ written: [next: GeneratedContent, pass: SeasonPass] }>()
const children = useChildrenStore()

const usable = computed(() => !!props.pass && isActive(props.pass))
const names = computed(() => joinList(props.content.request.children.map((child) => child.name)))
const storyButton = computed(() => `Kirjuta ${namesInCase(props.content.request.children, 'genitive')} oma muinasjutt`)
const busy = ref(false)
const error = ref('')

async function write(): Promise<void> {
  if (!props.pass || busy.value) return
  busy.value = true
  error.value = ''
  try {
    // The profiles as they are now, not as they were when the template story was made.
    const profiles = props.content.request.children.map((snapshot) => children.byId(snapshot.id) ?? snapshot)
    const { next, pass } = await requestStory(props.pass.code, props.content, profiles)
    emit('written', next, pass)
  } catch (failure) {
    error.value = STORY_ERROR_TEXTS[failure instanceof LettersRequestError ? failure.reason : 'failed']
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="ai-story" aria-labelledby="ai-story-title">
    <h2 id="ai-story-title"><Sparkles :size="20" aria-hidden="true" /> {{ names }}: oma muinasjutt</h2>
    <template v-if="usable && pass">
      <p>
        Siin on lühike mallilugu. Jõulupassiga kirjutab päkapikk sinu valikute järgi (žanr, teema, tegelased, pikkus) päris muinasjutu, kus
        {{ names }} {{ content.request.children.length > 1 ? 'on peategelased' : 'on peategelane' }}. Kasutab ühe kirjasarja või loo, alles on {{ pass.generationsLeft }}.
      </p>
      <BaseButton :disabled="busy || busyElsewhere" @click="write">
        <Sparkles aria-hidden="true" /> {{ busy ? 'Päkapikk kirjutab lugu… umbes minut' : storyButton }}
      </BaseButton>
      <p class="ai-story__privacy">
        Tehisarule (Anthropic Claude) saadetakse laste eesnimed, vanus, lugemisoskus ja profiilis kirjutatu, kuid mitte
        märkmed lapsevanemale. Neid ei salvestata.
      </p>
      <p v-if="error" class="ai-story__error" role="alert">{{ error }}</p>
      <p class="visually-hidden" role="status" aria-live="polite">{{ busy ? 'Päkapikk kirjutab lugu…' : '' }}</p>
    </template>
    <p v-else>
      Mallid panevad loo kokku valmis lõikudest. Jõulupassiga kirjutab päkapikk sellest pika ja päris muinasjutu.
      <RouterLink :to="PASS_PAGE">Jõulupass</RouterLink>
    </p>
  </section>
</template>

<style scoped lang="scss">
.ai-story {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: var(--lavender-soft);
  h2 {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    font-size: 1.1rem;
    color: var(--lavender-ink);
  }
  p {
    margin: 0;
    font-size: 0.92rem;
  }
}
.ai-story__privacy {
  font-size: 0.8rem !important;
  color: var(--ink-faint);
}
.ai-story__error {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
}
</style>
