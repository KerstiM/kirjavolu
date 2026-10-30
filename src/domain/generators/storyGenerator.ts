import type { ChildProfile, ParentInstruction, RequestFor } from '../models'
import { ageLabel, joinList, namesInCase } from '../text/estonian'
import type { Say } from '../../data/templates/interests'
import {
  ENDINGS,
  GENERIC_SOLVES,
  GENRE_LABELS,
  GENRES,
  MISSING_THINGS,
  THEME_LABELS,
  THEME_LINES,
  THEME_QUESTIONS,
  TODDLER_GENRES,
  type StoryContext,
} from '../../data/templates/stories'
import { ageBand } from './audience'
import {
  createContext,
  notesInstruction,
  paragraphs,
  type DraftItem,
  type GenContext,
  type ItemPicker,
  type TypeResult,
} from './context'

export function generateStory(request: RequestFor<'story'>, variants: readonly number[]): TypeResult {
  const ctx = createContext(request, variants, '')
  const { audience } = ctx
  const result = audience.band === 'toddler' ? toddlerStory(ctx) : readerStory(ctx)
  return {
    ...result,
    subtitle: `${GENRE_LABELS[request.options.genre]} · ${ctx.occasion.name} · ${audience.names}`,
    instructions: storyInstructions(request),
  }
}

function readerStory(ctx: GenContext<'story'>): Pick<TypeResult, 'title' | 'items'> {
  const { request, audience, occasion } = ctx
  const { options, general } = request
  const heroes = audience.readers.length > 0 ? audience.readers : audience.children
  const plural = heroes.length > 1
  const v: Say = (s, p) => (plural ? p : s)
  const genre = GENRES[options.genre]
  const storyCtx: StoryContext = {
    heroes: joinList(heroes.map((child) => child.name)),
    heroesAllative: namesInCase(heroes, 'allative'),
    v,
    they: plural ? 'nad' : 'ta',
    mood: ctx.item(0).pick(occasion.vocabulary.moods, 'mood'),
    missing: MISSING_THINGS[occasion.id],
  }

  const companions = options.extraCharacters.map((name) => name.trim()).filter(Boolean)
  const companionLine =
    companions.length > 0 ? `Kaasa ${companions.length > 1 ? 'tulid' : 'tuli'} ka ${joinList(companions)}.` : undefined
  const toddlerLine =
    audience.toddlers.length > 0
      ? `Ka pisike ${joinList(audience.toddlers.map((child) => child.name))} oli kaasas ja ${audience.toddlers.length > 1 ? 'nende' : 'tema'} naer ajas kõik heale tujule.`
      : undefined
  const hookObject = audience.hooks[0]?.hook.storyObject
  const objectLine = hookObject
    ? `Taskus oli ${v('tal', 'neil')} kaasas ka üks eriline asi: ${hookObject}.`
    : undefined

  // Each page draws its texts from its own picker, so regenerating page N only changes page N.
  type Segment = (p: ItemPicker) => string | undefined
  const opening: Segment = (p) =>
    paragraphs(p.pick(genre.openings, 'opening')(storyCtx), companionLine, toddlerLine, objectLine)
  const problem: Segment = (p) => p.pick(genre.problems, 'problem')(storyCtx)
  const usedHooks = new Set<string>()
  const obstacle =
    (i: number): Segment =>
    (p) => {
      const frame = genre.obstacles[i % genre.obstacles.length]
      const solver = heroes[i % heroes.length] as ChildProfile
      const hook = audience.hooks.find(
        ({ child, hook }) => child.id === solver.id && !usedHooks.has(hook.id),
      )
      let solve: string
      if (hook && p.rng.next() < 0.85) {
        usedHooks.add(hook.hook.id)
        solve = hook.hook.storySolve(solver.name)
      } else {
        solve = p.pick(GENERIC_SOLVES, 'solve')(solver.name)
      }
      return paragraphs(frame?.(storyCtx), solve)
    }
  const resolution: Segment = (p) => p.pick(genre.resolutions, 'resolution')(storyCtx)
  const moral: Segment = () =>
    options.theme !== 'none' ? THEME_LINES[options.theme](storyCtx) : undefined
  const ending: Segment = (p) => p.pick(ENDINGS[general.tone], 'ending')(storyCtx)

  const plan: Segment[][] = {
    short: [[opening], [problem, obstacle(0)], [resolution, moral, ending]],
    medium: [[opening], [problem], [obstacle(0)], [obstacle(1)], [resolution, moral, ending]],
    long: [
      [opening],
      [problem],
      [obstacle(0)],
      [obstacle(1)],
      [obstacle(2)],
      [resolution, moral],
      [ending],
    ],
  }[general.length]
  const pages = plan.map((segments, index) => {
    const p = ctx.item(index)
    return paragraphs(...segments.map((segment) => segment(p)))
  })

  const title = joinList([...heroes.map((child) => child.name), genre.titleThing(storyCtx)])
  return { title, items: pages.map((body, index) => storyPage(body, index, title)) }
}

function toddlerStory(ctx: GenContext<'story'>): Pick<TypeResult, 'title' | 'items'> {
  const { request, audience } = ctx
  const { options, general } = request
  const child = audience.children[0] as ChildProfile
  const name = joinList(audience.children.map((c) => c.name))
  const plural = audience.children.length > 1
  const genre = TODDLER_GENRES[options.genre]
  const companions = options.extraCharacters.filter((c) => c.trim())
  const family = child.family.filter((member) => member.trim())

  const intro = plural
    ? `Need on ${name}. Nad on väikesed ja väga rõõmsad.`
    : `See on ${name}. ${name} on ${ageLabel(child.age)} ja väga rõõmus.`
  const trip = `Ühel päeval ${plural ? 'läksid' : 'läks'} ${name} ${genre.trip}. Tipa-tapa, tipa-tapa.${companions.length ? ` Kaasas oli ka ${joinList(companions)}.` : ''}`
  const meet = genre.meet(name)
  const play = `Kas sina oskad ka ${genre.action}? Proovime koos!`
  const home =
    family.length > 0
      ? `Siis ${plural ? 'läksid' : 'läks'} ${name} koju. Kodus ${family.length > 1 ? 'ootasid' : 'ootas'} ${joinList(family)} ja ${family.length > 1 ? 'andsid' : 'andis'} sooja kalli. Head ööd, ${name}!`
      : `Siis ${plural ? 'läksid' : 'läks'} ${name} koju. Kodus ootas soe kallistus. Head ööd, ${name}!`

  const pagesByLength = {
    short: [paragraphs(intro, trip), meet, home],
    medium: [intro, trip, meet, paragraphs(play, home)],
    long: [intro, trip, meet, play, home],
  }
  const title = `${name} läheb ${genre.trip}`
  return { title, items: pagesByLength[general.length].map((body, index) => storyPage(body, index, title)) }
}

function storyPage(body: string, index: number, title: string): DraftItem {
  return {
    kind: 'story-page',
    label: `Lk ${index + 1}`,
    heading: index === 0 ? title : '',
    body,
  }
}

function storyInstructions(request: RequestFor<'story'>): ParentInstruction[] {
  const steps = [
    'Loe lugu ette rahulikus tempos ja tee tegelastele erinevaid hääli.',
    'Peatu vahel ja küsi: „Mis sinu arvates edasi juhtub?“',
  ]
  if (request.children.some((child) => ageBand(child) === 'toddler')) {
    steps.push('Väikesega tehke häälitsused ja liigutused koos kaasa – kordamine on selles vanuses parim osa.')
  }
  const result: ParentInstruction[] = [{ title: 'Ettelugemise nipid', steps }]
  if (request.options.theme !== 'none') {
    result.push({
      title: `Arutelu: ${THEME_LABELS[request.options.theme].toLowerCase()}`,
      steps: [THEME_QUESTIONS[request.options.theme]],
    })
  }
  const notes = notesInstruction(request.general.notes)
  if (notes) result.push(notes)
  return result
}
