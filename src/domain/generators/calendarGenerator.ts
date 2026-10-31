import type { CalendarOptions, OccasionId, ParentInstruction, RequestFor } from '../models'
import { ACTIVITIES, MATERIAL_LABELS, type Activity } from '../../data/templates/activities'
import { ageBand } from './audience'
import { createContext, notesInstruction, paragraphs, type DraftItem, type TypeResult } from './context'

export function fitsOptions(activity: Activity, options: CalendarOptions, youngestAge: number): boolean {
  const settingOk = options.setting === 'both' || activity.setting === 'any' || activity.setting === options.setting
  const materialsOk = activity.materials.every((material) => options.materials.includes(material))
  return settingOk && materialsOk && activity.minutes <= options.minutes && activity.minAge <= youngestAge
}

function belongsTo(activity: Activity, occasion: OccasionId): 'own' | 'generic' | 'other' {
  if (!activity.occasions) return 'generic'
  return activity.occasions.includes(occasion) ? 'own' : 'other'
}

export function generateCalendar(request: RequestFor<'calendar'>, variants: readonly number[]): TypeResult {
  const { options, general } = request
  const ctx = createContext(request, variants, '')
  const { audience, occasion } = ctx
  const days = Math.min(Math.max(options.days, 3), 31)
  // Toddlers join in with help, so they should not narrow the whole family's activities.
  const ageGroup = audience.readers.length > 0 ? audience.readers : audience.children
  const youngest = Math.min(...ageGroup.map((child) => child.age))

  // Siblings often share interests; one personal activity per interest is enough.
  const uniqueHooks = [...new Map(audience.hooks.map(({ hook }) => [hook.id, hook])).values()]
  const personal: Activity[] = uniqueHooks.map((hook) => ({
    id: `hook-${hook.id}`,
    title: `Lemmikteema: ${hook.topic}`,
    text: hook.mission,
    setting: 'any',
    materials: [],
    minutes: 20,
    minAge: 3,
  }))
  const candidates = [...ACTIVITIES, ...personal].filter((activity) => belongsTo(activity, occasion.id) !== 'other')
  const strict = candidates.filter((activity) => fitsOptions(activity, options, youngest))
  // Occasion activities may exceed the time limit: they are what makes the calendar fit the occasion.
  const own = candidates.filter(
    (a) => belongsTo(a, occasion.id) === 'own' && fitsOptions(a, { ...options, minutes: 45 }, youngest),
  )
  const generic = strict.filter((activity) => belongsTo(activity, occasion.id) === 'generic')
  // Relaxed tiers keep the calendar full when the filters are very strict.
  const relaxedTime = candidates.filter((a) => fitsOptions(a, { ...options, minutes: 45 }, youngest))
  const relaxedAll = candidates.filter((a) => a.minAge <= Math.max(youngest, 3))

  const isAdvent = occasion.id === 'christmas' && days === 24
  const adventYear = new Date().getFullYear()
  const items: DraftItem[] = []
  for (let i = 0; i < days; i++) {
    const p = ctx.item(i)
    // Alternate preference so occasion-specific activities are spread over the calendar.
    const tiers = i % 2 === 0 ? [own, generic] : [generic, own]
    const activity = p.pickTiered([...tiers, relaxedTime, relaxedAll, candidates], 'activity')
    const needs = activity.materials.map((material) => MATERIAL_LABELS[material])
    items.push({
      kind: 'activity',
      label: isAdvent ? `${i + 1}. detsember` : `${i + 1}. päev`,
      date: isAdvent ? `${adventYear}-12-${String(i + 1).padStart(2, '0')}` : undefined,
      heading: activity.title,
      body: paragraphs(
        activity.text(audience.v),
        needs.length > 0 ? `Vaja läheb: ${needs.join(', ')}.` : undefined,
      ),
      parentNote: `Umbes ${activity.minutes} min · ${activity.setting === 'outdoor' ? 'õues' : activity.setting === 'indoor' ? 'toas' : 'toas või õues'}`,
    })
  }

  const steps = [
    'Prindi kaardid, lõika need lahti ja pane igaks päevaks üks kaart ümbrikusse, karpi või kalendritaskusse.',
    'Kui mõni tegevus ei sobi, vali eelvaates „Uus variant“ – iga päeva saab eraldi muuta.',
  ]
  if (audience.children.some((child) => ageBand(child) === 'toddler')) {
    steps.push('Pisemad saavad olla abilised: lase neil asju tuua, plaksutada ja kaasa teha nii palju, kui jaksavad.')
  }
  const instructions: ParentInstruction[] = [{ title: 'Kuidas kalendrit kasutada', steps }]
  const notes = notesInstruction(general.notes)
  if (notes) instructions.push(notes)

  return {
    title: isAdvent ? 'Advendikalender' : `${days} päeva tegevuskalender`,
    subtitle: `${occasion.name} · ${audience.names}`,
    items,
    instructions,
  }
}
