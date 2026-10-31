import type { ParentInstruction, RequestFor } from '../models'
import { getOccasion } from '../occasions/occasions'
import { addDays, formatDayMonth, joinList } from '../text/estonian'
import type { TypeResult } from '../generators/context'
import { letterInstructions } from '../generators/letterGenerator'
import { PAIR_LABELS } from '../generators/linkedLetters'
import { libraryFor, scenarioIn, type ScenarioLibrary } from './library'
import { planCollection, type CollectionPlan } from './planner'
import { renderPlan } from './render'

/** Daily series that the scenario engine writes; everything else uses the older letter generator. */
export function usesScenarioEngine(request: RequestFor<'letter'>): boolean {
  const { options, children } = request
  const linkedOrSingle = children.length === 1 || options.mode === 'linked'
  return !!libraryFor(request.occasionId) && options.count >= 7 && linkedOrSingle
}

export function generateScenarioLetters(
  request: RequestFor<'letter'>,
  variants: readonly number[] = [],
): TypeResult {
  const library = libraryFor(request.occasionId) as ScenarioLibrary
  const plan = planCollection(request, library, variants)
  const items = renderPlan(plan, library, request)
  const occasion = getOccasion(request.occasionId)
  const names = joinList(request.children.map((child) => child.name))
  const count = request.options.count
  return {
    title: plan.linked ? `${count} kirja igale lapsele` : `${count} maagilist kirja`,
    subtitle: plan.linked
      ? `${occasion.name} · ${names} · seotud sarjad`
      : `${occasion.name} · ${names} · saatja ${plan.children[0]?.helper ?? ''}`,
    items,
    instructions: instructionsFor(request, plan, library),
  }
}

function instructionsFor(
  request: RequestFor<'letter'>,
  plan: CollectionPlan,
  library: ScenarioLibrary,
): ParentInstruction[] {
  const { options } = request
  const dayLabel = (index: number) =>
    options.startDate ? formatDayMonth(addDays(options.startDate, index)) : `${index + 1}. kiri`
  const nameOf = (id: string) => plan.children.find((p) => p.child.id === id)?.child.name ?? ''
  const result: ParentInstruction[] = []

  if (plan.linked) {
    result.push({
      title: 'Pere päkapikud',
      steps: plan.children.map((p) => `${p.child.name}: ${p.helper} ${p.title} – ${p.origin}.`),
    })
    result.push({
      title: 'Seotud päevad',
      steps: [
        '1. kirjas tutvustab iga päkapikk ka õdede-vendade päkapikke, viimases kirjas lõpetavad kõik koos.',
        ...[
          ...plan.pairs
            .filter((pair) =>
              plan.days.some(
                (d) =>
                  d.childId === pair.giverId && d.index === pair.index && d.content.kind === 'pair',
              ),
            )
            .map((pair) => ({
              index: pair.index,
              text: `${dayLabel(pair.index)}: ${nameOf(pair.giverId)} → ${nameOf(pair.receiverId)} (${PAIR_LABELS[pair.template.id] ?? pair.template.id}). Mõlema kiri teab sellest.`,
            })),
          ...plan.worldEvents
            .filter((event) => event.childIds.length > 1)
            .map((event) => ({
              index: event.index,
              text: `${dayLabel(event.index)}: ühine sündmus „${scenarioIn(library, event.scenarioId).title}“ – ${joinList(event.childIds.map(nameOf))} kuulevad sellest igaüks oma päkapiku käest.`,
            })),
        ]
          .sort((a, b) => a.index - b.index)
          .map((step) => step.text),
      ],
    })
  }

  if (plan.secret) {
    const name = nameOf(plan.secret.childId)
    result.push({
      title: `${name} on salajane abiline`,
      steps: [
        `${dayLabel(plan.secret.inviteIndex)}: ${name} saab kutse olla päkapikkude salajane abiline. Vastama ei pea – nõusolek tähendab lihtsalt saladuse hoidmist.`,
        `Salamissioonid (alati pakkumised, mitte kohustused): ${plan.secret.missionIndexes.map(dayLabel).join(', ') || '–'}. Nooremad ei tea neist midagi.`,
        'Viimases kirjas nimetatakse ta ametlikult päkapikkude abiliseks.',
      ],
    })
  }

  result.push(...letterInstructions(request, false))

  if (plan.connected) {
    const stageDays = plan.children.map((p) => {
      const days = plan.days.filter(
        (d) => d.childId === p.child.id && d.content.kind === 'scenario' && d.content.stageId,
      )
      return `${p.child.name}: ${days.map((d) => dayLabel(d.index)).join(', ') || '–'}.`
    })
    result.push({
      title: 'Järjejutt „Kadunud täht“',
      steps: [
        'Töökoja kuuselt kaob täht. Päkapikud otsivad seda, leiavad vihjeid ja lõpuks tähe – iga laps kuuleb lugu oma päkapiku käest ja oma eale sobivalt. Ühised sündmused toimuvad kõigi kirjades samal päeval.',
        'Loo päevad:',
        ...stageDays,
        'Ükski kiri ei eelda, et laps on vastanud või midagi teinud. Mõistatuste vastused on sellel lehel ja järgmise päeva kirjas (P.S.).',
      ],
    })
  }
  return result
}
