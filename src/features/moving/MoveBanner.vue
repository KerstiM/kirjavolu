<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, Truck } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import { loadImage } from '../../utils/imageStore'
import { SCHEMA_VERSION } from '../../utils/storage'
import {
  imageIds,
  isTransferMessage,
  markMoved,
  pathOnNewAddress,
  readMoved,
  TRANSFER_VERSION,
  type TransferImage,
  type TransferMessage,
} from '../../app/transfer'

/**
 * Shown on the old address once Kirjavõlu has moved (VITE_MOVED_TO). A family with
 * saved children or creations carries them over with one button; anyone else goes
 * straight to the new address.
 */
const props = defineProps<{ target: string }>()

const children = useChildrenStore()
const creations = useCreationsStore()
const targetOrigin = computed(() => new URL(props.target).origin)
const targetHost = computed(() => new URL(props.target).host)
const hasData = computed(() => children.children.length > 0 || creations.creations.length > 0)
const moved = ref(readMoved())
const status = ref<'idle' | 'sending' | 'done' | 'blocked' | 'failed'>('idle')
const result = ref({ children: 0, creations: 0 })
const here = pathOnNewAddress(window.location, import.meta.env.BASE_URL)

let stop: (() => void) | undefined
onBeforeUnmount(() => stop?.())

onMounted(() => {
  if (!hasData.value && !moved.value) window.location.replace(`${props.target}${here}`)
})

async function payload(): Promise<TransferMessage> {
  const images: TransferImage[] = []
  for (const id of imageIds(creations.creations)) {
    const dataUrl = await loadImage(id)
    if (dataUrl) images.push({ id, dataUrl })
  }
  // Plain copies: the stores' reactive objects cannot be posted to another window.
  const state = JSON.parse(
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, children: children.children, creations: creations.creations, demoSeeded: true }),
  )
  return { type: 'kirjavolu-data', version: TRANSFER_VERSION, state, images }
}

function transfer(): void {
  stop?.()
  const win = window.open(`${props.target}/kolin`, 'kirjavolu-kolin')
  if (!win) {
    status.value = 'blocked'
    return
  }
  status.value = 'sending'
  const prepared = payload()
  let sent = false
  const timer = setTimeout(() => {
    stop?.()
    status.value = 'failed'
  }, 60_000)
  const onMessage = async (event: MessageEvent) => {
    if (event.origin !== targetOrigin.value || event.source !== win || !isTransferMessage(event.data)) return
    if (event.data.type === 'kirjavolu-ready' && !sent) {
      sent = true
      win.postMessage(await prepared, targetOrigin.value)
    } else if (event.data.type === 'kirjavolu-done') {
      stop?.()
      markMoved()
      moved.value = true
      result.value = { children: event.data.children, creations: event.data.creations }
      status.value = 'done'
    }
  }
  window.addEventListener('message', onMessage)
  stop = () => {
    clearTimeout(timer)
    window.removeEventListener('message', onMessage)
    stop = undefined
  }
}
</script>

<template>
  <aside class="move no-print" aria-labelledby="move-title" role="region">
    <div class="container move__inner">
      <Truck class="move__icon" aria-hidden="true" />
      <div class="move__text">
        <h2 id="move-title" class="move__title">Kirjavõlu kolis aadressile {{ targetHost }}</h2>
        <p v-if="status === 'done'" role="status">
          Valmis! Üle tuli {{ result.children }} {{ result.children === 1 ? 'laps' : 'last' }} ja {{ result.creations }}
          {{ result.creations === 1 ? 'looming' : 'loomingut' }}. Edaspidi kasuta uut aadressi.
        </p>
        <p v-else-if="status === 'blocked'" role="alert">
          Brauser ei lubanud uut akent avada. Luba sellel lehel hüpikaknad ja proovi uuesti.
        </p>
        <p v-else-if="status === 'failed'" role="alert">Ülekanne ei õnnestunud. Proovi uuesti – siin olevad andmed on alles.</p>
        <p v-else-if="status === 'sending'" role="status">Viin andmeid üle… Ära sulge avanenud akent.</p>
        <p v-else-if="hasData && !moved">
          Sinu lapsed ja loomingud on selles brauseris vana aadressi all. Vii need ühe nupuvajutusega kaasa – siia jääb koopia alles.
        </p>
        <p v-else>Uus aadress on sama Kirjavõlu, ainult lühem.</p>
      </div>
      <div class="move__actions">
        <BaseButton v-if="hasData && status !== 'done'" :disabled="status === 'sending'" @click="transfer">
          {{ moved ? 'Vii uuesti üle' : 'Vii andmed üle' }}
        </BaseButton>
        <BaseButton :href="`${target}${here}`" variant="secondary">
          Ava {{ targetHost }} <ArrowRight aria-hidden="true" />
        </BaseButton>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.move {
  background: var(--gold-soft);
  border-bottom: 1px solid #f0d9a3;
}
.move__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  padding-block: 0.9rem;
}
.move__icon {
  flex-shrink: 0;
  color: #8a5f10;
}
.move__text {
  flex: 1 1 18rem;
  p {
    margin: 0.2rem 0 0;
    font-size: 0.92rem;
    color: var(--ink-soft);
  }
}
.move__title {
  margin: 0;
  font-size: 1.05rem;
}
.move__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
