import { computed, reactive, watch } from 'vue'
import type {
  ChildProfile,
  ContentOptionsMap,
  ContentTypeId,
  GeneralOptions,
  GenerationRequest,
  OccasionId,
} from '../../domain/models'
import { DEFAULT_GENERAL, defaultOptions } from '../../domain/defaults'
import { clone } from '../../utils/clone'

export const WIZARD_STEPS = [
  { id: 'type', label: 'Mida luua?' },
  { id: 'children', label: 'Kellele?' },
  { id: 'occasion', label: 'Mis puhul?' },
  { id: 'customize', label: 'Kohanda' },
] as const

export interface WizardState {
  step: number
  contentType: ContentTypeId | null
  childIds: string[]
  occasionId: OccasionId | null
  general: GeneralOptions
  options: ContentOptionsMap
}

export interface WizardInit {
  contentType?: ContentTypeId
  occasionId?: OccasionId
  childIds?: string[]
}

export function useWizard(init: WizardInit = {}) {
  const state = reactive<WizardState>({
    step: init.contentType ? 1 : 0,
    contentType: init.contentType ?? null,
    childIds: init.childIds ?? [],
    occasionId: init.occasionId ?? null,
    general: { ...DEFAULT_GENERAL },
    options: defaultOptions(init.occasionId ?? 'everyday'),
  })

  // Occasion-dependent defaults (sender, prize, number of letters …) follow the occasion.
  watch(
    () => state.occasionId,
    (occasion) => {
      state.options = defaultOptions(occasion ?? 'everyday')
    },
  )

  const canProceed = computed(() => {
    switch (WIZARD_STEPS[state.step]?.id) {
      case 'type':
        return state.contentType !== null
      case 'children':
        return state.childIds.length > 0
      case 'occasion':
        return state.occasionId !== null
      default:
        return true
    }
  })

  const isLastStep = computed(() => state.step === WIZARD_STEPS.length - 1)

  function next(): void {
    if (canProceed.value && !isLastStep.value) state.step++
  }

  function back(): void {
    if (state.step > 0) state.step--
  }

  function goTo(step: number): void {
    // Only allow jumping back, or forward to steps whose prerequisites are met.
    if (step < state.step) state.step = step
  }

  function toggleChild(id: string): void {
    state.childIds = state.childIds.includes(id)
      ? state.childIds.filter((existing) => existing !== id)
      : [...state.childIds, id]
  }

  function buildRequest(children: ChildProfile[], seed = Date.now()): GenerationRequest | null {
    const { contentType, occasionId } = state
    if (!contentType || !occasionId) return null
    const selected = children.filter((child) => state.childIds.includes(child.id))
    const base = {
      children: clone(selected.map((child) => ({ ...child }))),
      occasionId,
      general: { ...state.general },
      seed: seed % 2147483647,
    }
    const options = clone({ ...state.options[contentType] })
    return { ...base, contentType, options } as GenerationRequest
  }

  return { state, canProceed, isLastStep, next, back, goTo, toggleChild, buildRequest }
}
