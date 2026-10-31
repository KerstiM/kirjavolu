import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { runTemplates, templateGenerator } from '@/domain/generators/templateGenerator'
import { familyPlan, pairedDayIndexes, personasFor, siblingPairs } from '@/domain/generators/linkedLetters'
import { useCreationsStore } from '@/features/preview/creationsStore'
import type { GeneratedItem, RequestFor } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

const family = (extra: Partial<RequestFor<'letter'>['options']> = {}) =>
  makeRequest('letter', { occasionId: 'christmas', children: [RUBEN, JASPER, BRITA], options: { startDate: '2026-12-01', ...extra } })

const byChild = <T extends Pick<GeneratedItem, 'childId'>>(items: T[], id: string) => items.filter((item) => item.childId === id)

describe('family plan', () => {
  it('suggests helpers from interests, the oldest child gets the oldest helper', () => {
    const personas = personasFor(family())
    expect(personas[RUBEN.id]).toMatchObject({ name: 'Kõpsu-Mõpsu', title: 'Kuubikuvõlur' })
    expect(personas[RUBEN.id]!.origin).toContain('kõige vanem')
    expect(personas[JASPER.id]).toMatchObject({ name: 'Tipp-Topp', title: 'Riisiterake' })
    expect(personas[BRITA.id]!.origin).toContain('kõige pisem')
  })

  it('keeps the names the parent chose', () => {
    const personas = personasFor(family({ personas: { [BRITA.id]: { name: 'Pisi-Pätsi', title: 'Roosaninake', origin: '' } } }))
    expect(personas[BRITA.id]).toMatchObject({ name: 'Pisi-Pätsi', title: 'Roosaninake' })
    expect(personas[BRITA.id]!.origin).toContain('pisem')
  })

  it('only older readers give tasks to younger siblings', () => {
    const pairs = siblingPairs([RUBEN, JASPER, BRITA]).map((p) => `${p.giver.name}→${p.receiver.name}`)
    expect(pairs).toEqual(['Ruben→Jasper', 'Ruben→Brita', 'Jasper→Brita'])
  })

  it('paired days are spread out and never the first or last day', () => {
    expect(pairedDayIndexes(24)).toEqual([4, 9, 14, 19])
    expect(pairedDayIndexes(3)).toEqual([])
    const plan = familyPlan(family())
    expect(plan).toHaveLength(4)
    expect(new Set(plan.map((d) => d.template.id)).size).toBe(4)
  })
})

describe('linked letters', () => {
  const items = runTemplates(family()).items

  it('every child gets their own full series, signed by their own helper', () => {
    expect(byChild(items, RUBEN.id)).toHaveLength(24)
    expect(byChild(items, BRITA.id)).toHaveLength(24)
    expect(byChild(items, JASPER.id).every((i) => i.signature?.endsWith('Tipp-Topp'))).toBe(true)
  })

  it('the first letter introduces the siblings’ helpers', () => {
    const ruben = byChild(items, RUBEN.id)[0]!.body
    expect(ruben).toContain('Mina olen Kõpsu-Mõpsu Kuubikuvõlur')
    expect(ruben).toContain('Jasperi juures Tipp-Topp Riisiterake')
    expect(ruben).toContain('Brita juures Pisi-Pätsi')
    expect(byChild(items, BRITA.id)[0]!.body).toContain('Ruben ja Jasper saavad ka kirju!')
  })

  it('both letters of a paired day tell the same thing from both sides', () => {
    for (const day of familyPlan(family())) {
      const giver = byChild(items, day.giverId)[day.index]!.body
      const receiver = byChild(items, day.receiverId)[day.index]!.body
      const receiverName = [RUBEN, JASPER, BRITA].find((c) => c.id === day.receiverId)!
      const giverName = [RUBEN, JASPER, BRITA].find((c) => c.id === day.giverId)!.name
      expect(giver).toMatch(new RegExp(receiverName.name.slice(0, 4)))
      if (day.template.id !== 'secret-letter' && day.template.id !== 'kindness') expect(receiver).toContain(giverName)
    }
  })

  it('siblings never get the same story part', async () => {
    const { OCCASION_CORES, GENERIC_CORES } = await import('@/data/templates/letters')
    const ctx = { v: (s: string) => s, sender: '', vocab: { words: [], moods: [], greeting: '', sender: '', senderHome: '', prize: '' } }
    const cores = [...(OCCASION_CORES.christmas ?? []), ...GENERIC_CORES].map((line) => line(ctx))
    const coresOf = (id: string) => byChild(items, id).flatMap((item) => cores.filter((core) => item.body.includes(core)))
    const ruben = new Set(coresOf(RUBEN.id))
    expect(coresOf(JASPER.id).filter((core) => ruben.has(core))).toEqual([])
  })

  it('only the oldest child follows the serial story', () => {
    const story = (id: string) => byChild(items, id).some((i) => i.body.includes('võlutäht'))
    expect(story(RUBEN.id)).toBe(true)
    expect(story(JASPER.id)).toBe(false)
  })

  it('the last letter is a shared farewell for the readers', () => {
    expect(byChild(items, RUBEN.id)[23]!.body).toContain('Kõpsu-Mõpsu, Tipp-Topp ja Pisi-Pätsi')
    expect(byChild(items, BRITA.id)[23]!.body).toContain('Häid jõule, väike Brita!')
  })

  it('shared mode still makes one letter for all', () => {
    const shared = runTemplates(family({ mode: 'shared' })).items
    expect(shared).toHaveLength(24)
    expect(shared[0]!.heading).toBe('Kallid Ruben, Jasper ja Brita!')
  })

  it('parent sheet lists helpers and paired days', () => {
    const instructions = runTemplates(family()).instructions
    expect(instructions[0]!.title).toBe('Pere päkapikud')
    expect(instructions[1]!.steps.some((s) => /^5\. detsember: Ruben → /.test(s))).toBe(true)
  })
})

describe('linked preview', () => {
  it('shows each child separately with their own layout and a filter', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const content = await templateGenerator.generate(family())
    useCreationsStore().add(content)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push(`/looming/${content.id}`)
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    expect(await screen.findByRole('heading', { name: 'Ruben' })).toBeInTheDocument()
    expect(document.querySelectorAll('.sheet')).toHaveLength(8)
    expect(document.querySelectorAll('.mini-sheet')).toHaveLength(2)
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Brita' }))
    expect(document.querySelectorAll('.sheet')).toHaveLength(0)
    expect(document.querySelectorAll('.mini-sheet')).toHaveLength(2)
  })
})
