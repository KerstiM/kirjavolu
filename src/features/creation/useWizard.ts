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

/** Two questions, then the preview, where everything else can be changed beside the letters. */
export const WIZARD_STEPS = [
  { id: 'what', label: 'Mida ja mis puhul?' },
  { id: 'children', label: 'Kellele?' },
] as const

export interface WizardState {
  step: number
  contentType: ContentTypeId | null
  childIds: string[]
  occasionId: OccasionId | null
  general: GeneralOptions
  options: ContentOptionsMap
}

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id']

export interface WizardInit {
  contentType?: ContentTypeId
  occasionId?: OccasionId
  childIds?: string[]
  /** Choices of an earlier creation, to change them: the wizard opens at "Kellele?". */
  restore?: { general: GeneralOptions; options: ContentOptionsMap[ContentTypeId] }
}

/**
 * Moves occasion-dependent defaults (sender, prize, number of letters …) to a new
 * occasion, but keeps every value the parent has already changed.
 */
export function carryOverOptions(
  current: ContentOptionsMap,
  oldDefaults: ContentOptionsMap,
  newDefaults: ContentOptionsMap,
): ContentOptionsMap {
  const result = clone(current) as unknown as Record<string, Record<string, unknown>>
  const before = oldDefaults as unknown as Record<string, Record<string, unknown>>
  const after = newDefaults as unknown as Record<string, Record<string, unknown>>
  for (const [type, defaults] of Object.entries(after)) {
    const options = result[type] ?? {}
    for (const [key, value] of Object.entries(defaults)) {
      const untouched = JSON.stringify(options[key]) === JSON.stringify(before[type]?.[key])
      if (untouched) options[key] = clone(value)
    }
    result[type] = options
  }
  return result as unknown as ContentOptionsMap
}

export function useWizard(init: WizardInit = {}) {
  const state = reactive<WizardState>(initialState(init))
  let defaults = defaultOptions(init.occasionId ?? 'everyday')

  function initialState(from: WizardInit): WizardState {
    const options = defaultOptions(from.occasionId ?? 'everyday')
    if (from.restore && from.contentType) Object.assign(options, { [from.contentType]: clone(from.restore.options) })
    return {
      step: 0,
      contentType: from.contentType ?? null,
      childIds: from.childIds ?? [],
      occasionId: from.occasionId ?? null,
      general: from.restore ? { ...from.restore.general } : { ...DEFAULT_GENERAL },
      options,
    }
  }

  /** Starts over with new answers, e.g. "Loo uus" while the wizard is already open. */
  function reset(from: WizardInit = {}): void {
    Object.assign(state, initialState(from))
    defaults = defaultOptions(from.occasionId ?? 'everyday')
    // Type and occasion from a home page card: straight to "Kellele?", "Tagasi" still changes them.
    state.step = from.contentType && from.occasionId ? 1 : 0
  }
  reset(init)

  watch(
    () => state.occasionId,
    (occasion) => {
      const next = defaultOptions(occasion ?? 'everyday')
      state.options = carryOverOptions(state.options, defaults, next)
      defaults = next
    },
  )

  function answered(id: WizardStepId): boolean {
    if (id === 'what') return state.contentType !== null && state.occasionId !== null
    return state.childIds.length > 0
  }

  const canProceed = computed(() => answered(WIZARD_STEPS[state.step]?.id ?? 'what'))

  const isLastStep = computed(() => state.step === WIZARD_STEPS.length - 1)

  function next(): void {
    if (canProceed.value && !isLastStep.value) state.step++
  }

  function back(): void {
    if (state.step > 0) state.step--
  }

  /** A step can be opened from the progress bar once every step before it is answered. */
  function canGoTo(step: number): boolean {
    if (step === state.step || step < 0 || step >= WIZARD_STEPS.length) return false
    return step < state.step || WIZARD_STEPS.slice(0, step).every((s) => answered(s.id))
  }

  function goTo(step: number): void {
    if (canGoTo(step)) state.step = step
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

  return { state, canProceed, isLastStep, next, back, canGoTo, goTo, reset, toggleChild, buildRequest }
}
