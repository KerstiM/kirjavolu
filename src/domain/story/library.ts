import type { OccasionId } from '../models'
import type { Scenario, StoryArc } from './types'
import { FRAME_SCENARIOS } from '../../data/scenarios/christmas/frame'
import { STAR_ARC, STAR_ARC_SCENARIOS } from '../../data/scenarios/christmas/starArc'
import { WORLD_SCENARIOS } from '../../data/scenarios/christmas/world'
import { OLDER_SCENARIOS } from '../../data/scenarios/christmas/older'
import { YOUNG_SCENARIOS } from '../../data/scenarios/christmas/young'
import { TODDLER_SCENARIOS } from '../../data/scenarios/christmas/toddler'

/** Everything the planner may use for one occasion. */
export interface ScenarioLibrary {
  occasionId: OccasionId
  scenarios: Scenario[]
  arcs: StoryArc[]
}

export const CHRISTMAS_LIBRARY: ScenarioLibrary = {
  occasionId: 'christmas',
  scenarios: [
    ...FRAME_SCENARIOS,
    ...STAR_ARC_SCENARIOS,
    ...WORLD_SCENARIOS,
    ...OLDER_SCENARIOS,
    ...YOUNG_SCENARIOS,
    ...TODDLER_SCENARIOS,
  ],
  arcs: [STAR_ARC],
}

const LIBRARIES: Partial<Record<OccasionId, ScenarioLibrary>> = {
  christmas: CHRISTMAS_LIBRARY,
}

export function libraryFor(occasionId: OccasionId): ScenarioLibrary | undefined {
  return LIBRARIES[occasionId]
}

export function scenarioIn(library: ScenarioLibrary, id: string): Scenario {
  const scenario = library.scenarios.find((candidate) => candidate.id === id)
  if (!scenario) throw new Error(`Unknown scenario ${id}`)
  return scenario
}
