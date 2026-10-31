import type { RequestFor } from '../models'
import { formatDate, joinList, nameCase } from '../text/estonian'
import { createRng, hashSeed } from '../text/random'
import type { DraftItem } from '../generators/context'
import { HELPER_TITLE } from '../../data/templates/helper'
import { VOICES } from './characters'
import { scenarioIn, type ScenarioLibrary } from './library'
import type { CollectionPlan, PlannedChild, PlannedDay } from './planner'
import type { Paragraph, ScenarioContext } from './types'

/**
 * Stage B of generation: turns the plan into letters. The renderer writes only
 * what the plan says – the planned scenario variant, its planned personal detail
 * and activity, and the planned postscripts. It never adds paragraphs of its own.
 */
export function renderPlan(
  plan: CollectionPlan,
  library: ScenarioLibrary,
  request: RequestFor<'letter'>,
): DraftItem[] {
  return plan.children.flatMap((p) => {
    const days = plan.days.filter((d) => d.childId === p.child.id)
    let previousSignOff = ''
    return days.map((d, k) => {
      const item = renderDay(plan, library, request, p, d, days[k - 1])
      // Sign-offs vary, but never twice in a row.
      const rng = createRng(hashSeed(request.seed, 'signoff', p.child.id, d.index, d.variant))
      const offs = VOICES[p.band].signOffs.filter((s) => s !== previousSignOff)
      previousSignOff = rng.pick(offs)
      return { ...item, signature: `${previousSignOff}\n${p.helper}` }
    })
  })
}

function renderDay(
  plan: CollectionPlan,
  library: ScenarioLibrary,
  request: RequestFor<'letter'>,
  p: PlannedChild,
  d: PlannedDay,
  previous: PlannedDay | undefined,
): DraftItem {
  const ctx = contextFor(plan, request, p, d)
  const body: Paragraph[] = []
  if (d.content.kind === 'scenario') {
    const scenario = scenarioIn(library, d.content.scenarioId)
    const variant = scenario.variants[p.band]
    if (!variant) throw new Error(`Scenario ${scenario.id} has no ${p.band} variant`)
    body.push(...variant(ctx))
    const activity = scenario.activities?.[p.band]
    if (d.content.activity && activity) body.push(activity.text(ctx))
  } else {
    body.push(d.content.text)
  }
  body.push(...d.addenda)
  if (plan.secret?.childId === p.child.id && d.index === plan.count - 1 && plan.count > 1) {
    body.push(HELPER_TITLE(plan.secret.context))
  }

  // Yesterday's answer comes first among the postscripts, so the child connects it.
  const postscripts = [...revealFor(library, p, ctx, d, previous), ...d.postscripts]
  const paragraphs = body.filter((part): part is string => Boolean(part && part.trim()))
  if (postscripts.length > 0) {
    if (p.band === 'toddler') {
      // Toddler cards hold one paragraph: the postscript joins it.
      paragraphs[paragraphs.length - 1] =
        `${paragraphs.at(-1) ?? ''} ${postscripts.join(' ')}`.trim()
    } else {
      paragraphs.push(`P.S. ${postscripts.join(' ')}`)
    }
  }

  return {
    kind: 'letter',
    label: d.date ? formatDate(d.date) : `${d.index + 1}. kiri`,
    date: d.date,
    heading: `Kallis ${p.child.name}!`,
    body: paragraphs.join('\n\n'),
    answer: d.answer,
    parentNote: d.prep.length > 0 ? `Valmista ette: ${d.prep.join('; ')}` : undefined,
    childId: plan.linked ? p.child.id : undefined,
    forChild: plan.linked ? p.child.name : undefined,
  }
}

function revealFor(
  library: ScenarioLibrary,
  p: PlannedChild,
  ctx: ScenarioContext,
  today: PlannedDay,
  previous: PlannedDay | undefined,
): string[] {
  if (
    previous?.index !== today.index - 1 ||
    previous.content.kind !== 'scenario' ||
    !previous.content.activity
  )
    return []
  const reveal = scenarioIn(library, previous.content.scenarioId).activities?.[p.band]?.reveal
  return reveal ? [reveal(ctx)] : []
}

export function contextFor(
  plan: CollectionPlan,
  request: RequestFor<'letter'>,
  p: PlannedChild,
  d: PlannedDay,
): ScenarioContext {
  const siblings = plan.children.filter((o) => o.child.id !== p.child.id)
  const rng = createRng(hashSeed(request.seed, 'detail', p.child.id, d.index, d.variant))
  const known = new Set(d.known)
  return {
    name: p.child.name,
    n: (form) => nameCase(p.child, form),
    helper: p.helper,
    cast: p.cast,
    siblings: joinList(siblings.map((o) => o.child.name)),
    siblingCount: siblings.length,
    uses: (hook) => d.personalizationIds.includes(hook),
    knows: (fact) => known.has(fact),
    happened: (fact) => (plan.facts.get(fact) ?? Infinity) < d.index,
    pick: (options) => rng.pick(options),
    length: request.general.length,
    frame: {
      title: plan.linked ? p.title : '',
      origin: plan.linked ? p.origin : '',
      siblingHelpers: plan.linked
        ? joinList(
            siblings.map(
              (o) =>
                `${nameCase(o.child, 'genitive')} juures ${o.helper}${o.band === 'toddler' ? '' : ` ${o.title}`}`,
            ),
          )
        : '',
      allHelpers: plan.linked ? joinList(plan.children.map((o) => o.helper)) : '',
      eve: !!d.date?.endsWith('-12-24'),
    },
  }
}
