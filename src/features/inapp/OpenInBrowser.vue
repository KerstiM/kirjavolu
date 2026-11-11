<script setup lang="ts">
import { ref } from 'vue'
import { Copy, ExternalLink } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { externalBrowserUrl, platformOf } from './inAppBrowser'

/** How to leave Instagram's browser: a button where the phone allows it, the menu steps always. */
const platform = platformOf()
const openUrl = externalBrowserUrl(window.location.href, platform)
const copied = ref(false)

async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
  } catch {
    // Some in-app browsers block the clipboard; the menu steps still work.
  }
}
</script>

<template>
  <div class="open">
    <p class="open__steps">
      Vajuta paremal üleval <strong>⋯</strong> ja vali <strong>„Ava välises brauseris“</strong>.
    </p>
    <div class="open__actions">
      <BaseButton v-if="openUrl" :href="openUrl" size="sm"><ExternalLink aria-hidden="true" /> Ava Chrome'is</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="copyLink"><Copy aria-hidden="true" /> {{ copied ? 'Link kopeeritud' : 'Kopeeri link' }}</BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.open__steps {
  margin: 0 0 0.6rem;
  font-size: 0.92rem;
  color: var(--ink-soft);
}
.open__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
