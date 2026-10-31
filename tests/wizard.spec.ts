import { describe, expect, it } from 'vitest'
import { carryOverOptions, useWizard } from '@/features/creation/useWizard'
import { defaultOptions } from '@/domain/defaults'

describe('creation wizard', () => {
  it('starts at the first unanswered step', () => {
    expect(useWizard().state.step).toBe(0)
    expect(useWizard({ contentType: 'letter' }).state.step).toBe(1)
    // The only child and an occasion from the home page: straight to "Kohanda".
    expect(useWizard({ contentType: 'letter', occasionId: 'christmas', childIds: ['a'], onlyChild: true }).state.step).toBe(3)
  })

  it('skips a step that was answered on arrival', () => {
    const wizard = useWizard({ occasionId: 'easter', childIds: ['a'], onlyChild: true })
    wizard.state.contentType = 'story'
    wizard.next()
    expect(wizard.state.step).toBe(3)
  })

  it('keeps changed settings when the occasion changes', () => {
    const christmas = defaultOptions('christmas')
    const changed = { ...christmas, letter: { ...christmas.letter, count: 7 as const, events: [{ id: 'e', kind: 'visit' as const, date: '2026-12-05', title: '', participants: [] }] } }
    const easter = defaultOptions('easter')
    const result = carryOverOptions(changed, christmas, easter)
    expect(result.letter.count).toBe(7)
    expect(result.letter.events).toHaveLength(1)
    // Untouched defaults follow the new occasion.
    expect(result.letter.sender).toBe(easter.letter.sender)
    expect(result['treasure-hunt'].prize).toBe(easter['treasure-hunt'].prize)
  })
})
