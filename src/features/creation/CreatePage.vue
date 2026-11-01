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
import StepWhat from './steps/StepWhat.vue'
import StepChildren from './steps/StepChildren.vue'
import QuickChildDialog from '../children/QuickChildDialog.vue'
import type { ChildProfileDraft } from '../../domain/models'
import { useWizard, WIZARD_STEPS, type WizardInit } from './useWizard'
import { newCreationRequests } from './newCreation'
import { track } from '../../app/analytics'

const route = useRoute()
const router = useRouter()
const childrenStore = useChildrenStore()
const creations = useCreationsStore()
const generator = useGenerator()

/** Answers given by the link: type and occasion from the home page, or a creation to change (?muuda=id). */
function initFromRoute(): WizardInit {
  const editing = typeof route.query.muuda === 'string' ? creations.byId(route.query.muuda) : undefined
  if (editing) {
    const { request } = editing
    return {
      contentType: request.contentType,
      occasionId: request.occasionId,
      childIds: request.children
        .map((child) => child.id)
        .filter((id) => childrenStore.children.some((child) => child.id === id)),
      restore: { general: request.general, options: request.options },
    }
  }
  const queryType = route.query.tyyp
  const queryOccasion = route.query.puhk
  return {
    contentType: isContentTypeId(queryType) ? queryType : undefined,
    occasionId: isOccasionId(queryOccasion) ? queryOccasion : undefined,
    childIds: childrenStore.children.length === 1 ? [childrenStore.children[0]?.id ?? ''] : [],
  }
}

/** Counts a fresh start (not reopening an earlier creation) with what the link already chose. */
function start(init: WizardInit): WizardInit {
  if (!init.restore) track('wizard_start', { type: init.contentType ?? 'none', occasion: init.occasionId ?? 'none' })
  return init
}

const wizard = useWizard(start(initFromRoute()))
const { state } = wizard
watch([() => route.query, newCreationRequests], () => wizard.reset(start(initFromRoute())))

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

// A child added here is selected at once, so the parent never has to leave the wizard.
const addingChild = ref(false)
function addChild(draft: ChildProfileDraft): void {
  const child = childrenStore.add(draft)
  track('child_added', { from: 'wizard' })
  state.childIds = [...state.childIds, child.id]
  addingChild.value = false
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
    // "Back" from the preview returns to these choices instead of an empty wizard.
    await router.replace({ path: '/loo', query: { muuda: content.id } })
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
      <WizardProgress :current="state.step" :can-go-to="wizard.canGoTo" @go="wizard.goTo" />
      <p v-if="summary.length" class="wizard__summary">
        <span v-for="part in summary" :key="part" class="summary-chip">{{ part }}</span>
      </p>
    </header>

    <div ref="stepHeading" class="wizard__body">
      <StepWhat
        v-if="WIZARD_STEPS[state.step]?.id === 'what'"
        v-model:content-type="state.contentType"
        v-model:occasion-id="state.occasionId"
        @done="wizard.next()"
      />
      <StepChildren
        v-else
        :children="childrenStore.children"
        :selected="state.childIds"
        @toggle="wizard.toggleChild"
        @select-all="selectAll"
        @add="addingChild = true"
      />
    </div>

    <QuickChildDialog v-if="addingChild" @save="addChild" @close="addingChild = false" />

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
      <BaseButton v-else size="lg" :disabled="busy || !wizard.canProceed.value" @click="create">
        <WandSparkles aria-hidden="true" />
        <template v-if="busy">Loon…</template>
        <template v-else><span class="wide-only">Loo ja vaata eelvaadet</span><span class="narrow-only">Vaata eelvaadet</span></template>
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

  // On a phone the bar sits over the choices, so it gets a solid edge-to-edge background
  // and the main action takes the remaining width.
  @media (max-width: 600px) {
    gap: 0.75rem;
    margin-inline: -1rem;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
    background: var(--bg);
    border-top: 1px solid var(--line);
    box-shadow: 0 -6px 16px rgb(0 0 0 / 0.04);

    > :last-child {
      flex: 1;
    }
  }
}
.narrow-only {
  display: none;
}
@media (max-width: 600px) {
  .wide-only {
    display: none;
  }
  .narrow-only {
    display: inline;
  }
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
