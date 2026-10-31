import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { busyOn, eventIndex, familyInstructions } from '@/domain/generators/familyEvents'
import { familyPlan } from '@/domain/generators/linkedLetters'
import FamilyEventsEditor from '@/features/creation/options/FamilyEventsEditor.vue'
import type { FamilyEvent, GeneratedItem, RequestFor } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

const ev = (date: string, kind: FamilyEvent['kind'], title = '', participants: string[] = []): FamilyEvent => ({
  id: `${date}-${kind}`,
  date,
  kind,
  title,
  participants,
})

const request = (events: FamilyEvent[], extra: Partial<RequestFor<'letter'>['options']> = {}, children = [RUBEN, JASPER, BRITA]) =>
  makeRequest('letter', { occasionId: 'christmas', children, options: { startDate: '2026-12-01', events, ...extra } }) as RequestFor<'letter'>

const on = (items: GeneratedItem[] | Omit<GeneratedItem, 'id' | 'variant' | 'edited'>[], childId: string, day: number) =>
  items.find((item) => item.childId === childId && item.date === `2026-12-${String(day).padStart(2, '0')}`)!.body

describe('event dates', () => {
  it('places events on the right day of the series', () => {
    expect(eventIndex(ev('2026-12-12', 'forest'), '2026-12-01', 24)).toBe(11)
    expect(eventIndex(ev('2026-12-26', 'forest'), '2026-12-01', 24)).toBeNull()
    expect(eventIndex(ev('2026-11-30', 'forest'), '2026-12-01', 24)).toBeNull()
  })
})

describe('events in linked letters', () => {
  const events = [
    ev('2026-12-07', 'hobby', 'judotrenn', [JASPER.id]),
    ev('2026-12-12', 'forest'),
    ev('2026-12-19', 'visit', 'vanavanaema juurde Valka'),
  ]
  const items = runTemplates(request(events)).items

  it('every participant’s letter talks about the event in an age-appropriate way', () => {
    expect(on(items, RUBEN.id, 12)).toContain('jäljedetektiiv')
    expect(on(items, RUBEN.id, 12)).toContain('Näita jälgi ka Jasperile ja Britale.')
    expect(on(items, JASPER.id, 12)).toContain('käbi')
    expect(on(items, BRITA.id, 12)).toContain('Täna lähme metsa!')
  })

  it('uses the parent’s details', () => {
    expect(on(items, JASPER.id, 7)).toContain('Täna on sul judotrenn!')
    expect(on(items, RUBEN.id, 19)).toContain('vanavanaema juurde Valka')
  })

  it('only participants hear about an event', () => {
    expect(on(items, RUBEN.id, 7)).not.toContain('judotrenn')
    expect(on(items, BRITA.id, 7)).not.toContain('judotrenn')
  })

  it('event days replace the ordinary task and keep the card short', () => {
    expect(on(items, RUBEN.id, 12)).not.toMatch(/Tänane ülesanne|Päkapikuülesanne/)
  })
})

describe('paired days and events', () => {
  it('move a paired day only when the giver or receiver is busy', () => {
    const plan = familyPlan(request([]))
    const first = plan[0]!
    const busy = ev(`2026-12-${String(first.index + 1).padStart(2, '0')}`, 'hobby', 'trenn', [first.giverId])
    const shifted = familyPlan(request([busy]))[0]!
    expect(shifted.index).toBe(first.index + 1)
    const other = [RUBEN, JASPER, BRITA].find((c) => c.id !== first.giverId && c.id !== first.receiverId)!
    const notBusy = ev(busy.date, 'hobby', 'trenn', [other.id])
    expect(familyPlan(request([notBusy]))[0]!.index).toBe(first.index)
    expect(busyOn(request([notBusy]), first.index, [first.giverId, first.receiverId])).toBe(false)
  })
})

describe('sunday sweets rule', () => {
  const items = runTemplates(request([], { sundaySweets: true })).items

  it('explains the rule in the first letter and mentions sweets on Sundays only', () => {
    expect(on(items, RUBEN.id, 1)).toContain('maiustusi toome ainult pühapäeviti')
    expect(on(items, JASPER.id, 6)).toContain('Täna on pühapäev, nii et sussis on üks komm.')
    expect(on(items, JASPER.id, 7)).not.toContain('pühapäev')
    expect(on(items, BRITA.id, 13)).toContain('Täna on pühapäev ja sussis on väike üllatus!')
  })

  it('tells the parent which days need a sweet in the slipper', () => {
    const steps = familyInstructions(request([], { sundaySweets: true })).flatMap((i) => i.steps)
    expect(steps[0]).toBe('Pane komm sussi neil päevadel: 6. detsember, 13. detsember ja 20. detsember.')
  })
})

describe('events in a shared letter', () => {
  it('address all children together', () => {
    const items = runTemplates(request([ev('2026-12-12', 'forest')], { mode: 'shared' }, [RUBEN, JASPER])).items
    const day = items.find((item) => item.date === '2026-12-12')!.body
    // The youngest reader decides the band; the text speaks to both in plural.
    expect(day).toContain('Kui te täna metsa lähete, vaadake hoolega ringi. Tooge mulle metsast üks käbi')
  })
})

describe('parent sheet', () => {
  it('lists events and flags dates outside the series', () => {
    const steps = familyInstructions(
      request([ev('2026-12-12', 'forest'), ev('2026-12-28', 'visit', 'onu juurde')]),
    ).flatMap((i) => i.steps)
    expect(steps).toContain('12. detsember: metsaretk – kõik.')
    expect(steps.some((s) => s.includes('jääb kirjade ajavahemikust välja'))).toBe(true)
  })
})

describe('family events editor', () => {
  it('adds an event, limits participants and sets the Sunday rule', async () => {
    const user = userEvent.setup()
    const { emitted, rerender } = render(FamilyEventsEditor, {
      props: { children: [RUBEN, JASPER], startDate: '2026-12-01', count: 24, events: [], sundaySweets: false },
    })
    await user.click(screen.getByRole('button', { name: /Lisa sündmus/ }))
    const added = (emitted()['update:events']!.at(-1) as [FamilyEvent[]])[0]
    expect(added).toHaveLength(1)
    expect(added[0]).toMatchObject({ kind: 'forest', participants: [], date: '2026-12-05' })

    await rerender({ events: added })
    await user.click(screen.getByRole('checkbox', { name: 'Ruben' }))
    const limited = (emitted()['update:events']!.at(-1) as [FamilyEvent[]])[0]
    expect(limited[0]!.participants).toEqual([JASPER.id])

    await user.click(screen.getByRole('checkbox', { name: /Maiustused ainult pühapäeviti/ }))
    expect(emitted()['update:sundaySweets']!.at(-1)).toEqual([true])
  })
})
