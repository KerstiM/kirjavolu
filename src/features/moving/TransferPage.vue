<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { CheckCircle2, Truck } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import { storeImageData } from '../../utils/imageStore'
import { isTransferMessage, newFromTransfer, TRANSFER_VERSION } from '../../app/transfer'

/**
 * /kolin on the new address: receives children, creations and pictures from the
 * old address, which opened this window. Only that exact origin is listened to.
 */
const from = import.meta.env.VITE_TRANSFER_FROM
const children = useChildrenStore()
const creations = useCreationsStore()
const status = ref<'waiting' | 'done' | 'none' | 'failed'>('waiting')
const added = ref({ children: 0, creations: 0 })

let pinger: ReturnType<typeof setInterval> | undefined
function cleanup(): void {
  clearInterval(pinger)
  window.removeEventListener('message', onMessage)
}
onBeforeUnmount(cleanup)

async function onMessage(event: MessageEvent): Promise<void> {
  if (!from || event.origin !== new URL(from).origin || event.source !== window.opener) return
  const message = event.data
  if (!isTransferMessage(message) || message.type !== 'kirjavolu-data') return
  cleanup()
  if (message.version !== TRANSFER_VERSION) {
    status.value = 'failed'
    return
  }
  const fresh = newFromTransfer({ children: children.children, creations: creations.creations }, message.state)
  for (const image of message.images ?? []) {
    if (typeof image?.id !== 'string' || typeof image.dataUrl !== 'string' || !image.dataUrl.startsWith('data:image/')) continue
    try {
      await storeImageData(image.id, image.dataUrl)
    } catch {
      // Without IndexedDB the creation still comes over, only without its picture.
    }
  }
  children.children.push(...fresh.children)
  creations.creations.push(...fresh.creations)
  added.value = { children: fresh.children.length, creations: fresh.creations.length }
  status.value = 'done'
  ;(window.opener as Window).postMessage({ type: 'kirjavolu-done', ...added.value }, new URL(from).origin)
}

onMounted(() => {
  if (!from || !window.opener) {
    status.value = 'none'
    return
  }
  window.addEventListener('message', onMessage)
  // The old page may still be gathering pictures; ask until it answers.
  let tries = 0
  const ask = () => {
    if (++tries > 120) {
      cleanup()
      status.value = 'failed'
      return
    }
    ;(window.opener as Window | null)?.postMessage({ type: 'kirjavolu-ready' }, new URL(from).origin)
  }
  ask()
  pinger = setInterval(ask, 500)
})
</script>

<template>
  <div class="container section transfer">
    <template v-if="status === 'done'">
      <CheckCircle2 class="transfer__icon transfer__icon--ok" aria-hidden="true" />
      <h1>Andmed on üle toodud</h1>
      <p role="status">
        Juurde tuli {{ added.children }} {{ added.children === 1 ? 'laps' : 'last' }} ja {{ added.creations }}
        {{ added.creations === 1 ? 'looming' : 'loomingut' }}. Kui midagi oli juba olemas, jäi see nii, nagu oli.
      </p>
      <div class="transfer__actions">
        <BaseButton to="/">Ava Kirjavõlu</BaseButton>
        <BaseButton to="/lapsed" variant="secondary">Vaata lapsi</BaseButton>
      </div>
    </template>
    <template v-else-if="status === 'none'">
      <Truck class="transfer__icon" aria-hidden="true" />
      <h1>Andmete toomine vanalt aadressilt</h1>
      <p>
        Ava samas brauseris vana aadress <strong>kerstim.github.io/kirjavolu</strong> ja vajuta seal ülal
        „Vii andmed üle“. See leht avaneb siis ise ja võtab andmed vastu.
      </p>
      <BaseButton to="/" variant="secondary">Avalehele</BaseButton>
    </template>
    <template v-else-if="status === 'failed'">
      <Truck class="transfer__icon" aria-hidden="true" />
      <h1>Ülekanne ei õnnestunud</h1>
      <p role="alert">Sulge see aken ja vajuta vanal aadressil uuesti „Vii andmed üle“. Sinu andmed on vanal aadressil alles.</p>
    </template>
    <template v-else>
      <Truck class="transfer__icon" aria-hidden="true" />
      <h1>Toon andmeid üle…</h1>
      <p role="status">Ära sulge seda akent. See võtab paar sekundit.</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.transfer {
  max-width: 640px;
  text-align: center;
  p {
    color: var(--ink-soft);
  }
}
.transfer__icon {
  width: 3rem;
  height: 3rem;
  color: #8a5f10;
  margin-bottom: 1rem;
}
.transfer__icon--ok {
  color: var(--sage-ink);
}
.transfer__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}
</style>
