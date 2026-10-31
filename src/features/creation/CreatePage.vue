<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, WandSparkles } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { isContentTypeId, getContentType } from '../../domain/contentTypes'
import { getOccasion, isOccasionId } from '../../domain/occasions/occasions'
import { GenerationError } from '../../domain/generators/templateGenerator'
import { useGenerator } from '../../composables/useGenerator'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import WizardProgress from './WizardProgress.vue'
import StepType from './steps/StepType.vue'
import StepChildren from './steps/StepChildren.vue'
import StepOccasion from './steps/StepOccasion.vue'
import StepCustomize from './steps/StepCustomize.vue'
import { useWizard, WIZARD_STEPS } from './useWizard'

const route = useRoute()
const router = useRouter()
const childrenStore = useChildrenStore()
const creations = useCreationsStore()
const generator = useGenerator()

const queryType = route.query.tyyp
const queryOccasion = route.query.puhk
const wizard = useWizard({
  contentType: isContentTypeId(queryType) ? queryType : undefined,
  occasionId: isOccasionId(queryOccasion) ? queryOccasion : undefined,
  childIds: childrenStore.children.length === 1 ? [childrenStore.children[0]?.id ?? ''] : [],
  onlyChild: childrenStore.children.length === 1,
})
const { state } = wizard

const errors = ref<string[]>([])
const busy = ref(false)
const stepHeading = ref<HTMLElement | null>(null)

const summary = computed(() => {
  const parts: string[] = []
  if (state.contentType) parts.push(getContentType(state.contentType).title)
  const names = childrenStore.children.filter((c) => state.childIds.includes(c.id)).map((c) => c.name)
  if (names.length) parts.push(names.join(', '))
  if (state.occasionId) parts.push(getOccasion(state.occasionId).name)
  return parts
})

watch(
  () => state.step,
  async () => {
    errors.value = []
    await nextTick()
    const heading = stepHeading.value?.querySelector<HTMLElement>('h2')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus()
  },
)

// Steps with a single choice move on by themselves once something is picked.
function pick<K extends 'contentType' | 'occasionId'>(key: K, value: (typeof state)[K]): void {
  state[key] = value
  if (value !== null) wizard.next()
}

function selectAll(): void {
  state.childIds = childrenStore.children.map((child) => child.id)
}

async function create(): Promise<void> {
  const request = wizard.buildRequest(childrenStore.children)
  if (!request) return
  busy.value = true
  errors.value = []
  try {
    const content = await generator.generate(request)
    creations.add(content)
    await router.push(`/looming/${content.id}`)
  } catch (error) {
    errors.value = error instanceof GenerationError ? error.errors : ['Midagi läks valesti. Proovi uuesti.']
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="container wizard section">
    <header class="wizard__head">
      <span class="eyebrow">Loo uus</span>
      <WizardProgress :current="state.step" @go="wizard.goTo" />
      <p v-if="summary.length" class="wizard__summary">
        <span v-for="part in summary" :key="part" class="summary-chip">{{ part }}</span>
      </p>
    </header>

    <div ref="stepHeading" class="wizard__body">
      <StepType
        v-if="WIZARD_STEPS[state.step]?.id === 'type'"
        :model-value="state.contentType"
        :occasion-id="state.occasionId"
        @update:model-value="(value) => pick('contentType', value)"
      />
      <StepChildren
        v-else-if="WIZARD_STEPS[state.step]?.id === 'children'"
        :children="childrenStore.children"
        :selected="state.childIds"
        @toggle="wizard.toggleChild"
        @select-all="selectAll"
      />
      <StepOccasion
        v-else-if="WIZARD_STEPS[state.step]?.id === 'occasion'"
        :model-value="state.occasionId"
        :content-type="state.contentType"
        @update:model-value="(value) => pick('occasionId', value)"
      />
      <StepCustomize
        v-else-if="state.contentType && state.occasionId"
        v-model:general="state.general"
        v-model:options="state.options"
        :content-type="state.contentType"
        :occasion-id="state.occasionId"
        :child-count="state.childIds.length"
        :children="childrenStore.children.filter((c) => state.childIds.includes(c.id))"
      />
    </div>

    <div v-if="errors.length" class="error-box" role="alert">
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>

    <footer class="wizard__nav">
      <BaseButton v-if="state.step > 0" variant="secondary" @click="wizard.back()">
        <ArrowLeft aria-hidden="true" /> Tagasi
      </BaseButton>
      <span v-else />
      <BaseButton v-if="!wizard.isLastStep.value" :disabled="!wizard.canProceed.value" @click="wizard.next()">
        Edasi <ArrowRight aria-hidden="true" />
      </BaseButton>
      <BaseButton v-else size="lg" :disabled="busy" @click="create">
        <WandSparkles aria-hidden="true" /> {{ busy ? 'Loon…' : 'Loo ja vaata eelvaadet' }}
      </BaseButton>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.wizard {
  max-width: 920px;
}
.wizard__head {
  margin-bottom: 2rem;
}
.wizard__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 1.25rem 0 0;
}
.summary-chip {
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  font-size: 0.85rem;
  font-weight: 600;
}
.wizard__nav {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 0;
  background: linear-gradient(transparent, var(--bg) 35%);
}
.error-box {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-sm);
  background: #fdecea;
  color: var(--danger);
  p {
    margin: 0;
  }
}
</style>
