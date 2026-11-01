import type { DraftItem } from '../generators/context'
import { ageBand } from '../generators/audience'
import { getHook, PERSONAL_HOOKS, profileHooks } from './hooks'
import { scenarioIn, type ScenarioLibrary } from './library'
import type { CollectionPlan, PlannedChild, PlannedDay } from './planner'
import type { Band, HookId, Scenario, Variant } from './types'
import { TOPICS } from '../../data/topics'
import { effectiveHooks, sampleContext } from './sample'

/**
 * Collection-level checks. They catch structural mistakes – repetition, broken
 * chronology, leaked secrets, unsupported personal claims, wrong puzzle answers –
 * but they cannot judge whether a story is funny or well written. That needs a
 * human read of the golden files in docs/samples (see docs/scenario-engine.md).
 */

export type IssueCode =
  | 'duplicate-scenario'
  | 'repeated-paragraph'
  | 'repeated-phrase'
  | 'invalid-arc-order'
  | 'invalid-chronology'
  | 'conflicting-world-event'
  | 'unsupported-personal-fact'
  | 'assumed-response'
  | 'invalid-puzzle'
  | 'age-inappropriate'
  | 'missing-milestone'
  | 'mechanical-personalization'
  | 'dangling-arc'
  | 'secret-leak'
  | 'pair-mismatch'
  | 'moralizing'
  | 'too-long-for-card'

export interface CollectionIssue {
  code: IssueCode
  severity: 'error' | 'warning'
  message: string
  childId?: string
  index?: number
}

export interface ValidationOptions {
  /** Words in a phrase counted for repetition. */
  phraseWords: number
  /** A phrase may appear in at most this many letters of one child. */
  maxPhraseRepeats: number
}

export const DEFAULT_VALIDATION: ValidationOptions = { phraseWords: 6, maxPhraseRepeats: 1 }

/** Printable budgets per band: what fits a poster card (readers) or a toddler mini card. */
// Measured on the poster in the browser: longer texts shrink below about 8 pt (a warning);
// past the hard limit the card overflows even at the smallest font (an error).
export const CARD_LIMITS: Record<Band, number> = { older: 640, young: 460, toddler: 200 }
export const CARD_HARD_LIMITS: Record<Band, number> = { older: 760, young: 560, toddler: 200 }

/** The card a child's letters are printed on: longer read-aloud letters use the reader poster. */
export function cardBand(p: Pick<PlannedChild, 'band' | 'readAloud'>): Band {
  return p.readAloud ? 'young' : p.band
}

/** Phrases that claim the child did or answered something in real life. */
const ASSUMED_RESPONSE = [
  /(nägin|lugesin|leidsin|sain) (sinu|su) (märki|märgi|vastust|vastuse|joonistust|joonistuse|kirja|pildi)/i,
  /aitäh (vastuse|joonistuse|kirja|pildi) eest/i,
  /sa said (sellega )?hakkama/i,
  /(nagu|mida) sa eile (tegid|joonistasid|kirjutasid)/i,
  /sa jätsid mulle/i,
]

/** Generic slogans, moralizing and behaviour monitoring. */
const MORALIZING = [
  /ole tubli/i,
  /pea meeles/i,
  /ära kunagi unusta/i,
  /sa oled väga eriline/i,
  /imed juhtuvad/i,
  /head teod kasvavad/i,
  /(päkapikud|jõuluvana) (märkavad|näeb|märkab) kõike/i,
  /kas oled olnud hea/i,
]

/** Personal facts dropped into a letter as a standalone remark. */
const MECHANICAL = [
  /kuulsin, et (sa|sulle|sinu)/i,
  /kuulsin sinu lemmikust/i,
  /ma tean, et sulle meeldi/i,
]

const SECRET = /salajane abiline|salamissioon|salajane missioon|salajase abilise/i

export function validateCollection(
  plan: CollectionPlan,
  items: DraftItem[],
  library: ScenarioLibrary,
  options: ValidationOptions = DEFAULT_VALIDATION,
): CollectionIssue[] {
  const issues: CollectionIssue[] = []
  const add = (issue: CollectionIssue) => issues.push(issue)
  // Rendered items come in the same order as the planned days.
  const itemByDay = new Map(plan.days.map((d, k) => [d, items[k]]))
  const itemOf = (d: PlannedDay) => itemByDay.get(d)

  for (const p of plan.children) {
    const id = p.child.id
    const days = plan.days.filter((d) => d.childId === id)
    const letters = days.map((d) => ({ d, item: itemOf(d) }))
    const scenarioDays = days.filter((d) => d.content.kind === 'scenario')
    const scenarioOf = (d: PlannedDay) =>
      scenarioIn(library, (d.content as { scenarioId: string }).scenarioId)

    // 1. Scenarios are not repeated for one child.
    const seen = new Map<string, number>()
    for (const d of scenarioDays) {
      const s = scenarioOf(d)
      if (seen.has(s.id))
        add({
          code: 'duplicate-scenario',
          severity: 'error',
          childId: id,
          index: d.index,
          message: `${p.child.name}: „${s.title}“ on juba päeval ${(seen.get(s.id) ?? 0) + 1}.`,
        })
      seen.set(s.id, d.index)
    }

    // 2–3. No repeated paragraphs or distinctive phrases in one child's letters.
    const story = letters.map(({ d, item }) =>
      storyParagraphs(
        d.postscripts.reduce((body, ps) => body.split(ps).join(''), item?.body ?? ''),
        [p.helper, p.child.name],
      ),
    )
    const paragraphSeen = new Map<string, number>()
    story.forEach((paragraphs, index) => {
      for (const paragraph of paragraphs) {
        const prior = paragraphSeen.get(paragraph)
        if (prior !== undefined && prior !== index)
          add({
            code: 'repeated-paragraph',
            severity: 'error',
            childId: id,
            index,
            message: `${p.child.name}: sama lõik kordub (${prior + 1}. ja ${index + 1}. kiri): „${paragraph.slice(0, 60)}…“`,
          })
        paragraphSeen.set(paragraph, index)
      }
    })
    const phraseLetters = new Map<string, Set<number>>()
    story.forEach((paragraphs, index) => {
      for (const phrase of phrases(paragraphs.join(' '), options.phraseWords)) {
        const set = phraseLetters.get(phrase) ?? new Set<number>()
        set.add(index)
        phraseLetters.set(phrase, set)
      }
    })
    for (const [phrase, where] of phraseLetters) {
      if (where.size > options.maxPhraseRepeats)
        add({
          code: 'repeated-phrase',
          severity: 'warning',
          childId: id,
          message: `${p.child.name}: „${phrase}“ esineb ${where.size} kirjas.`,
        })
    }

    // 4. Arc stages come in the arc's order.
    for (const arc of library.arcs) {
      const order = arc.stages.map((stage) => stage.id)
      const told = scenarioDays.filter(
        (d) =>
          d.content.kind === 'scenario' && d.content.stageId && order.includes(d.content.stageId),
      )
      const positions = told.map((d) => order.indexOf((d.content as { stageId: string }).stageId))
      if (positions.some((pos, k) => k > 0 && pos <= (positions[k - 1] ?? -1)))
        add({
          code: 'invalid-arc-order',
          severity: 'error',
          childId: id,
          message: `${p.child.name}: loo „${arc.title}“ etapid on vales järjekorras.`,
        })
      // 12. A started mystery is resolved for everybody who heard it start.
      if (told.length > 0) {
        const resolved = told.some((d) => ['climax', 'resolution'].includes(scenarioOf(d).role))
        if (!resolved)
          add({
            code: 'dangling-arc',
            severity: 'error',
            childId: id,
            message: `${p.child.name}: lugu „${arc.title}“ algas, aga ei lõppenud.`,
          })
      }
    }

    for (const { d, item } of letters) {
      const text = item?.body ?? ''
      // 5. World facts in the right order.
      if (d.content.kind === 'scenario') {
        const s = scenarioOf(d)
        for (const fact of s.requires ?? []) {
          if (!((plan.facts.get(fact) ?? Infinity) < d.index))
            add({
              code: 'invalid-chronology',
              severity: 'error',
              childId: id,
              index: d.index,
              message: `${p.child.name}, ${d.index + 1}. kiri: „${s.title}“ eeldab sündmust „${fact}“, mida pole veel juhtunud.`,
            })
        }
        if (s.until && (plan.facts.get(s.until) ?? Infinity) < d.index)
          add({
            code: 'invalid-chronology',
            severity: 'error',
            childId: id,
            index: d.index,
            message: `${p.child.name}, ${d.index + 1}. kiri: „${s.title}“ ei sobi pärast sündmust „${s.until}“.`,
          })
        // 9. Puzzles have valid answers.
        const activity = s.activities?.[p.band]
        if (d.content.activity && activity) {
          if (activity.check && !activity.check())
            add({
              code: 'invalid-puzzle',
              severity: 'error',
              childId: id,
              index: d.index,
              message: `„${s.title}“: mõistatuse vastus ei klapi.`,
            })
          if (activity.reveal && !activity.answer)
            add({
              code: 'invalid-puzzle',
              severity: 'error',
              childId: id,
              index: d.index,
              message: `„${s.title}“: vastus puudub lapsevanema lehelt.`,
            })
          if (activity.reveal && d.index === plan.count - 1)
            add({
              code: 'invalid-puzzle',
              severity: 'error',
              childId: id,
              index: d.index,
              message: `„${s.title}“: vastust ei saa enam järgmises kirjas öelda.`,
            })
        }
      }
      // 7. Personal facts come from the profile and only where the plan put them.
      const supported = profileHooks(p.child)
      for (const hook of d.personalizationIds) {
        if (!supported.has(hook))
          add({
            code: 'unsupported-personal-fact',
            severity: 'error',
            childId: id,
            index: d.index,
            message: `${p.child.name}: profiilis pole „${getHook(hook).label}“.`,
          })
      }
      const plain = stripNames(text, [
        p.helper,
        p.title,
        ...plan.children.map((o) => `${o.helper} ${o.title}`),
      ])
      for (const hook of PERSONAL_HOOKS) {
        if (
          hook.mentions.test(plain) &&
          !d.personalizationIds.includes(hook.id) &&
          d.content.kind === 'scenario'
        ) {
          add({
            code: 'unsupported-personal-fact',
            severity: 'error',
            childId: id,
            index: d.index,
            message: `${p.child.name}, ${d.index + 1}. kiri räägib teemast „${hook.label}“, mida plaan sellele kirjale ei valinud.`,
          })
        }
      }
      // 8. Nothing assumes the child answered or did something.
      for (const pattern of ASSUMED_RESPONSE) {
        if (pattern.test(text))
          add({
            code: 'assumed-response',
            severity: 'error',
            childId: id,
            index: d.index,
            message: `${p.child.name}, ${d.index + 1}. kiri eeldab lapse vastust: ${pattern}`,
          })
      }
      for (const pattern of MORALIZING) {
        if (pattern.test(text))
          add({
            code: 'moralizing',
            severity: 'warning',
            childId: id,
            index: d.index,
            message: `${p.child.name}, ${d.index + 1}. kiri: ${pattern}`,
          })
      }
      // 11. Personal details are part of a story, not standalone remarks.
      for (const pattern of MECHANICAL) {
        if (pattern.test(text))
          add({
            code: 'mechanical-personalization',
            severity: 'warning',
            childId: id,
            index: d.index,
            message: `${p.child.name}, ${d.index + 1}. kiri: ${pattern}`,
          })
      }
      // 10. Age: toddler cards are one short paragraph; reader letters fit a poster card.
      // Longer read-aloud letters for three-year-olds go on the poster like a young reader's.
      if (p.band === 'toddler' && !p.readAloud && text.split('\n\n').length > 1)
        add({
          code: 'age-inappropriate',
          severity: 'error',
          childId: id,
          index: d.index,
          message: `${p.child.name}: väikelapse kaardil on mitu lõiku.`,
        })
      const card = cardBand(p)
      if (text.length > CARD_LIMITS[card])
        add({
          code: 'too-long-for-card',
          severity: text.length > CARD_HARD_LIMITS[card] ? 'error' : 'warning',
          childId: id,
          index: d.index,
          message: `${p.child.name}, ${d.index + 1}. kiri: ${text.length} märki (piir ${CARD_LIMITS[card]}).`,
        })
    }

    // 10b. Scenario variants match the child's band (a reader never gets a toddler card).
    if (ageBand(p.child) === 'toddler' && p.band !== 'toddler')
      add({
        code: 'age-inappropriate',
        severity: 'error',
        childId: id,
        message: `${p.child.name}: väikelaps sai lugeja kirjad.`,
      })

    // 11b. Milestones: introduction, Christmas Eve, farewell.
    const first = days[0]
    if (
      !first ||
      first.index !== 0 ||
      first.content.kind !== 'scenario' ||
      first.content.scenarioId !== 'introduction'
    )
      add({
        code: 'missing-milestone',
        severity: 'error',
        childId: id,
        message: `${p.child.name}: esimene kiri ei ole tutvustus.`,
      })
    const lastDay = days.at(-1)
    if (
      plan.count > 1 &&
      (lastDay?.index !== plan.count - 1 ||
        lastDay.content.kind !== 'scenario' ||
        lastDay.content.scenarioId !== 'farewell')
    )
      add({
        code: 'missing-milestone',
        severity: 'error',
        childId: id,
        message: `${p.child.name}: viimane kiri ei ole hüvastijätt.`,
      })
    const eve = days.find((d) => d.date?.endsWith('-12-24'))
    if (
      eve &&
      eve.content.kind === 'scenario' &&
      !['farewell', 'christmas-eve'].includes(eve.content.scenarioId)
    )
      add({
        code: 'missing-milestone',
        severity: 'error',
        childId: id,
        index: eve.index,
        message: `${p.child.name}: 24. detsembri kiri ei ole jõululaupäeva kiri.`,
      })
    if (days.length !== plan.count)
      add({
        code: 'missing-milestone',
        severity: 'error',
        childId: id,
        message: `${p.child.name}: ${plan.count} kirja asemel ${days.length}.`,
      })
  }

  // 6. One canonical record per shared event.
  const worldDays = new Map<string, Set<number>>()
  for (const d of plan.days) {
    if (d.content.kind !== 'scenario') continue
    const s = scenarioIn(library, d.content.scenarioId)
    if (!s.world) continue
    const set = worldDays.get(s.id) ?? new Set<number>()
    set.add(d.index)
    worldDays.set(s.id, set)
  }
  for (const [id, set] of worldDays) {
    if (set.size > 1)
      add({
        code: 'conflicting-world-event',
        severity: 'error',
        message: `Ühine sündmus „${scenarioIn(library, id).title}“ toimub mitmel päeval.`,
      })
  }

  // Secrets stay with the child they belong to.
  if (plan.secret) {
    for (const d of plan.days.filter((day) => day.childId !== plan.secret?.childId)) {
      const item = itemOf(d)
      if (item && SECRET.test(item.body))
        add({
          code: 'secret-leak',
          severity: 'error',
          childId: d.childId,
          index: d.index,
          message: 'Salajase abilise saladus on teise lapse kirjas.',
        })
    }
  }

  // Both letters of a paired day come from the same plan row.
  for (const pair of plan.pairs) {
    const giver = plan.days.find((d) => d.childId === pair.giverId && d.index === pair.index)
    const receiver = plan.days.find((d) => d.childId === pair.receiverId && d.index === pair.index)
    if (
      giver?.content.kind === 'pair' &&
      receiver &&
      receiver.content.kind !== 'pair' &&
      (pair.template.receiverReader || pair.template.receiverToddler)
    ) {
      add({
        code: 'pair-mismatch',
        severity: 'error',
        index: pair.index,
        message: 'Paarisülesanne on ainult ühe lapse kirjas.',
      })
    }
  }
  return issues
}

/** Development-time checks of the scenario data itself. */
export function validateLibrary(library: ScenarioLibrary): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const established = new Set(library.scenarios.flatMap((s) => s.establishes ?? []))
  for (const s of library.scenarios) {
    if (ids.has(s.id)) errors.push(`${s.id}: id kordub`)
    ids.add(s.id)
    const bands = Object.keys(s.variants) as Band[]
    if (bands.length === 0) errors.push(`${s.id}: ühtegi variant pole`)
    const bandsUsingHooks = new Set(
      (Object.keys(s.variants) as Band[]).flatMap((band) => effectiveHooks(s, band)),
    )
    for (const hook of s.hooks ?? []) {
      if (!bandsUsingHooks.has(hook))
        errors.push(`${s.id}: konks „${hook}“ ei muuda ühegi variandi teksti`)
    }
    for (const fact of [...(s.requires ?? []), ...(s.until ? [s.until] : [])]) {
      if (!established.has(fact))
        errors.push(`${s.id}: sündmust „${fact}“ ei loo ükski stsenaarium`)
    }
    for (const band of bands) {
      const variant = s.variants[band]
      if (!variant) continue
      const render = (hooks: HookId[], long = true) =>
        variant(sampleContext(hooks, long ? 'Kõpsu-Mõpsu-Põmpsu' : 'Tuduja')).filter(
          (p): p is string => Boolean(p),
        )
      const plain = render([])
      const personal = render(s.hooks ?? [])
      if (plain.length === 0) errors.push(`${s.id}/${band}: tühi tekst`)
      for (const paragraph of [...plain, ...personal]) {
        if (!/^[„A-ZÕÄÖÜŠŽ0-9"]/.test(paragraph))
          errors.push(`${s.id}/${band}: lõik ei alga suure tähega: „${paragraph.slice(0, 30)}“`)
        if (/undefined|NaN|\$\{/.test(paragraph)) errors.push(`${s.id}/${band}: täitmata koht`)
      }
      for (const hook of s.onlyWithHook ? [] : PERSONAL_HOOKS) {
        const withActivity = [...plain, s.activities?.[band]?.text(sampleContext([])) ?? ''].join(
          ' ',
        )
        if (hook.mentions.test(stripNames(withActivity, ['Meister'])))
          errors.push(`${s.id}/${band}: isikupärastamata tekst mainib teemat „${hook.label}“`)
      }
      const longest = Math.max(plain.join('\n\n').length, personal.join('\n\n').length)
      const activity = s.activities?.[band]
      const extra = activity ? activity.text(sampleContext([], 'Tuduja')).length + 2 : 0
      // Room for the greeting and a postscript line.
      if (longest + extra > CARD_LIMITS[band] - (band === 'toddler' ? 45 : 80))
        errors.push(`${s.id}/${band}: liiga pikk kaardi jaoks (${longest + extra} märki)`)
      if (activity?.check && !activity.check())
        errors.push(`${s.id}/${band}: mõistatuse kontroll ebaõnnestus`)
      if (activity?.reveal && !activity.answer) errors.push(`${s.id}/${band}: vastus puudub`)
      if (band === 'toddler' && activity)
        errors.push(`${s.id}: väikelapse kaardil ei ole eraldi ülesannet`)
      if (band === 'toddler' && plain.length > 1)
        errors.push(`${s.id}: väikelapse kaart peab olema üks lõik`)
    }
    if (s.topicSlot) errors.push(...validateTopicSlot(s))
    if (s.readAloud) {
      if (!s.variants.toddler) errors.push(`${s.id}: ettelugemise tekst ilma väikelapse kaardita`)
      const paragraphs = s.readAloud(sampleContext([])).filter((p): p is string => Boolean(p))
      const personal = s.readAloud(sampleContext(s.hooks ?? [])).filter((p): p is string => Boolean(p))
      for (const paragraph of [...paragraphs, ...personal]) {
        if (!/^[„A-ZÕÄÖÜŠŽ0-9"]/.test(paragraph))
          errors.push(`${s.id}/ettelugemine: lõik ei alga suure tähega: „${paragraph.slice(0, 30)}“`)
        if (/undefined|NaN|\$\{/.test(paragraph)) errors.push(`${s.id}/ettelugemine: täitmata koht`)
      }
      for (const hook of s.onlyWithHook ? [] : PERSONAL_HOOKS) {
        if (hook.mentions.test(stripNames(paragraphs.join(' '), ['Meister'])))
          errors.push(`${s.id}/ettelugemine: isikupärastamata tekst mainib teemat „${hook.label}“`)
      }
      const longest = Math.max(paragraphs.join('\n\n').length, personal.join('\n\n').length)
      if (longest > CARD_LIMITS.young - 80)
        errors.push(`${s.id}/ettelugemine: liiga pikk kaardi jaoks (${longest} märki)`)
    }
  }
  for (const arc of library.arcs) {
    for (const stage of arc.stages) {
      if (!ids.has(stage.scenarioId)) errors.push(`${arc.id}: tundmatu etapp ${stage.scenarioId}`)
    }
    const at = arc.stages.map((stage) => stage.at)
    if (at.some((value, k) => k > 0 && value <= (at[k - 1] ?? 0)))
      errors.push(`${arc.id}: etappide asukohad pole kasvavas järjekorras`)
    if (!established.has(arc.resolves))
      errors.push(`${arc.id}: lahendust „${arc.resolves}“ ei loo ükski etapp`)
  }
  return errors
}

/**
 * A topic story is told with every topic of the list: each one must fit the card,
 * start its paragraphs properly and talk only about its own topic.
 */
function validateTopicSlot(s: Scenario): string[] {
  const errors: string[] = []
  const texts: [string, Band | 'readAloud', Variant | undefined][] = [
    ...(Object.keys(s.variants) as Band[]).map((band): [string, Band, Variant | undefined] => [
      band,
      band,
      s.variants[band],
    ]),
    ['ettelugemine', 'readAloud', s.readAloud],
  ]
  for (const topic of TOPICS) {
    for (const [name, band, variant] of texts) {
      if (!variant) continue
      const paragraphs = variant(sampleContext([topic.id])).filter((p): p is string => Boolean(p))
      const text = paragraphs.join('\n\n')
      const where = `${s.id}/${name}/${topic.id}`
      for (const paragraph of paragraphs) {
        if (!/^[„A-ZÕÄÖÜŠŽ0-9"]/.test(paragraph))
          errors.push(`${where}: lõik ei alga suure tähega: „${paragraph.slice(0, 30)}“`)
      }
      const limit =
        band === 'readAloud' || band === 'young'
          ? CARD_LIMITS.young - 80
          : CARD_LIMITS[band] - (band === 'toddler' ? 45 : 80)
      if (text.length > limit) errors.push(`${where}: liiga pikk kaardi jaoks (${text.length} märki)`)
      if (band === 'toddler' && paragraphs.length > 1) errors.push(`${where}: väikelapse kaart peab olema üks lõik`)
      for (const other of PERSONAL_HOOKS) {
        if (other.id !== topic.id && other.mentions.test(stripNames(text, ['Meister'])))
          errors.push(`${where}: mainib teist teemat „${other.label}“`)
      }
    }
  }
  return errors
}

/** Story paragraphs without postscripts and sign-offs, names masked. */
function storyParagraphs(body: string, names: string[]): string[] {
  return body
    .split('\n\n')
    .filter((paragraph) => !paragraph.startsWith('P.S.'))
    .map((paragraph) => stripNames(paragraph, names))
}

function stripNames(text: string, names: string[]): string {
  return names.filter(Boolean).reduce((acc, name) => acc.split(name).join('§'), text)
}

function phrases(text: string, size: number): string[] {
  const words = text
    .toLocaleLowerCase('et-EE')
    .replace(/[^\p{L}\s§]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const result = new Set<string>()
  for (let i = 0; i + size <= words.length; i++) result.add(words.slice(i, i + size).join(' '))
  return [...result]
}
