import type { RouteLocationRaw } from 'vue-router'
import type { OccasionId } from '../../domain/models'
import { CHRISTMAS_ROOT } from '../../components/brand/design'

/**
 * The seasonal block on the home page and its link in the menu. Christmas now; Easter, a
 * birthday or anything else is one more entry here with its own dates, words and link.
 * Outside every window the home page simply has no seasonal block.
 */
export interface SeasonalPromo {
  id: OccasionId
  /** First and last day shown, as [month (1–12), day], in the visitor's own time. */
  from: [number, number]
  until: [number, number]
  title: string
  lead: string
  note: string
  cta: string
  /** The short name in the menu. */
  menu: string
  to: RouteLocationRaw
}

export const SEASONAL_PROMOS: SeasonalPromo[] = [
  {
    id: 'christmas',
    // Letters for 1–24 December: worth starting from November until the last days before Christmas.
    from: [11, 1],
    until: [12, 23],
    title: '24 hommikut täis üllatusi',
    lead: 'Loo oma lapsele terve detsembrikuu päkapikukirjad korraga. Iga päev uus lugu, väike saladus või lõbus seiklus.',
    note: 'Tasuta ja kohe valmis: vali laps, vaata kirjad üle ja prindi.',
    cta: 'Loo jõulukirjad',
    menu: 'Jõulukirjad',
    to: CHRISTMAS_ROOT,
  },
]

const dayOfYear = ([month, day]: [number, number]) => month * 100 + day

/** The promotion whose window holds the given day, if any. */
export function currentPromo(date = new Date(), promos = SEASONAL_PROMOS): SeasonalPromo | null {
  const today = dayOfYear([date.getMonth() + 1, date.getDate()])
  return (
    promos.find((promo) => {
      const from = dayOfYear(promo.from)
      const until = dayOfYear(promo.until)
      // A window may run over New Year, e.g. 15 December – 6 January.
      return from <= until ? today >= from && today <= until : today >= from || today <= until
    }) ?? null
  )
}
