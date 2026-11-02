import { describe, expect, it } from 'vitest'
import { mascotLine } from '@/features/creation/mascotLines'
import { BRITA, JASPER, RUBEN } from './helpers'

const none = { contentType: null, occasionId: null, childIds: [] as string[] }

describe('what the mascot says in the wizard', () => {
  it('greets first and asks for the occasion once the type is picked', () => {
    expect(mascotLine('what', none, []).mood).toBe('wave')
    expect(mascotLine('what', { ...none, contentType: 'letter' }, []).text).toBe('Hea valik! Ja mis puhul see on?')
  })

  it('asks for a child, then names the picked one with a favourite interest', () => {
    const kids = [RUBEN, JASPER, BRITA]
    expect(mascotLine('children', none, []).text).toContain('Lisa laps')
    expect(mascotLine('children', none, kids).text).toBe('Kellele me seekord kirjutame?')
    const one = mascotLine('children', { ...none, childIds: [JASPER.id] }, kids)
    expect(one.text).toMatch(/^Jasper/)
    expect(one.mood).toBe('happy')
  })

  it('cheers for siblings and thinks while writing', () => {
    const kids = [RUBEN, JASPER, BRITA]
    expect(mascotLine('children', { ...none, childIds: [RUBEN.id, JASPER.id] }, kids).text).toBe(
      'Ruben ja Jasper? Topeltrõõm! Teen neile ühise seikluse.',
    )
    expect(mascotLine('children', { ...none, childIds: kids.map((c) => c.id) }, kids).text).toContain('Terve kamp!')
    expect(mascotLine('children', none, kids, true).mood).toBe('think')
  })
})
