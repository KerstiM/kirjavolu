import type { Band, HookId, Scenario, ScenarioContext } from './types'

/**
 * A deliberately awkward context for checking scenario data: long hyphenated names,
 * every fact known. Used by the library validator and to find which hooks really
 * change a scenario's text.
 */
export function sampleContext(
  hooks: readonly HookId[],
  helper = 'Kõpsu-Mõpsu-Põmpsu',
): ScenarioContext {
  return {
    name: 'Mirtel-Liisa',
    n: () => 'Mirtel-Liisa',
    helper,
    cast: { older: 'Kõpsu-Mõpsu-Põmpsu', young: 'Tipp-Topp-Tripp', tiny: 'Pisi-Pätsi-Pätu' },
    siblings: 'Mirtel-Liisa ja Karl-Eerik',
    siblingCount: 2,
    uses: (hook) => hooks.includes(hook),
    knows: () => true,
    happened: () => true,
    pick: (options) => options[0] as never,
    length: 'medium',
    frame: {
      title: 'Meister',
      origin: 'Jõuluvana töökoja kõige vanem päkapikk',
      siblingHelpers: 'Jasperi juures Tipp-Topp ja Brita juures Pisi-Pätsi',
      allHelpers: 'Kõpsu-Mõpsu, Tipp-Topp ja Pisi-Pätsi',
      eve: true,
    },
  }
}

/** Full text of one band's variant (with its activity) for the given hooks. */
export function sampleText(
  scenario: Scenario,
  band: Band,
  hooks: readonly HookId[],
  helper?: string,
): string {
  const ctx = sampleContext(hooks, helper)
  const paragraphs = (scenario.variants[band]?.(ctx) ?? []).filter((p): p is string => Boolean(p))
  const activity = scenario.activities?.[band]
  return [...paragraphs, ...(activity ? [activity.text(ctx)] : [])].join('\n\n')
}

const cache = new Map<string, HookId[]>()

/**
 * Hooks that actually change this band's text. A scenario written only for children
 * with a hook (onlyWithHook) counts all its hooks.
 */
export function effectiveHooks(scenario: Scenario, band: Band): HookId[] {
  const key = `${scenario.id}/${band}`
  const cached = cache.get(key)
  if (cached) return cached
  const plain = sampleText(scenario, band, [])
  const result = (scenario.hooks ?? []).filter(
    (hook) => scenario.onlyWithHook || sampleText(scenario, band, [hook]) !== plain,
  )
  cache.set(key, result)
  return result
}
