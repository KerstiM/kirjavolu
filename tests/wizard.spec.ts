import { describe, expect, it } from 'vitest'
import { carryOverOptions, useWizard, WIZARD_STEPS } from '@/features/creation/useWizard'
import { readingLevelForAge } from '@/domain/generators/audience'
import { defaultOptions } from '@/domain/defaults'

describe('creation wizard', () => {
  it('has two questions before the preview', () => {
    expect(WIZARD_STEPS.map((step) => step.label)).toEqual(['Mida ja mis puhul?', 'Kellele?'])
  })

  it('starts at "Kellele?" when a home page card already chose type and occasion', () => {
    expect(useWizard().state.step).toBe(0)
    // Only one of the two is known: the first question stays open.
    expect(useWizard({ contentType: 'letter' }).state.step).toBe(0)
    expect(useWizard({ occasionId: 'christmas' }).state.step).toBe(0)
    const wizard = useWizard({ contentType: 'letter', occasionId: 'christmas' })
    expect(wizard.state.step).toBe(1)
    // The card's choices can still be changed.
    wizard.back()
    expect(wizard.state.step).toBe(0)
    expect(wizard.state.contentType).toBe('letter')
    expect(wizard.state.options.letter.count).toBe(24)
  })

  it('needs both type and occasion before "Kellele?"', () => {
    const wizard = useWizard({ occasionId: 'easter' })
    expect(wizard.canProceed.value).toBe(false)
    wizard.state.contentType = 'story'
    expect(wizard.canProceed.value).toBe(true)
    wizard.next()
    expect(wizard.state.step).toBe(1)
    expect(wizard.canProceed.value).toBe(false)
    wizard.toggleChild('a')
    expect(wizard.canProceed.value).toBe(true)
    expect(wizard.isLastStep.value).toBe(true)
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

  it('reopens an earlier creation at "Kellele?" with its choices', () => {
    const options = { ...defaultOptions('christmas').letter, count: 7 as const, sender: 'Tipp-Topp' }
    const general = { tone: 'humorous' as const, length: 'long' as const, difficulty: 'auto' as const, notes: '' }
    const wizard = useWizard({
      contentType: 'letter',
      occasionId: 'christmas',
      childIds: ['a', 'b'],
      restore: { general, options },
    })
    expect(wizard.state.step).toBe(1)
    expect(wizard.state.options.letter.count).toBe(7)
    expect(wizard.state.options.letter.sender).toBe('Tipp-Topp')
    expect(wizard.state.general.tone).toBe('humorous')
    // Changing the type keeps the children and the occasion.
    wizard.goTo(0)
    wizard.state.contentType = 'story'
    wizard.next()
    expect(wizard.state.step).toBe(1)
    expect(wizard.state.childIds).toEqual(['a', 'b'])
  })

  it('jumps forward on the progress bar once the earlier steps are answered', () => {
    const wizard = useWizard({ contentType: 'letter', occasionId: 'christmas', childIds: ['a'] })
    wizard.goTo(0)
    expect(wizard.state.step).toBe(0)
    expect(wizard.canGoTo(1)).toBe(true)
    wizard.goTo(1)
    expect(wizard.state.step).toBe(1)
    expect(useWizard().canGoTo(1)).toBe(false)
  })

  it('starts over on reset', () => {
    const wizard = useWizard({ contentType: 'letter', occasionId: 'christmas', childIds: ['a'] })
    wizard.state.general.tone = 'humorous'
    wizard.reset({})
    expect(wizard.state.step).toBe(0)
    expect(wizard.state.contentType).toBeNull()
    expect(wizard.state.childIds).toEqual([])
    expect(wizard.state.general.tone).toBe('magical')
  })

  it('suggests a reading level from the age', () => {
    expect(readingLevelForAge(2)).toBe('read-aloud')
    expect(readingLevelForAge(4)).toBe('read-aloud')
    expect(readingLevelForAge(6)).toBe('beginner')
    expect(readingLevelForAge(8)).toBe('independent')
    expect(readingLevelForAge(11)).toBe('advanced')
  })
})
