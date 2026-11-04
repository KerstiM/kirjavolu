import { describe, expect, it } from 'vitest'
import { formatDate, addDays, genitive, joinList, namesInCase, nameCase } from '@/domain/text/estonian'
import { decodeNumbers, encodeNumbers, isAnagram, scramble, shiftText } from '@/domain/generators/puzzleTools'
import { createRng } from '@/domain/text/random'
import { KAI, PAARU, MARKUS } from './helpers'

describe('Estonian grammar helpers', () => {
  it('builds genitive forms', () => {
    expect(genitive('Karl')).toBe('Karli')
    expect(genitive('Kai')).toBe('Kai')
    expect(genitive('Mart', 'Mardi')).toBe('Mardi')
  })

  it('declines names and lists', () => {
    expect(nameCase(MARKUS, 'allative')).toBe('Markusele')
    expect(namesInCase([MARKUS, PAARU, KAI], 'allative')).toBe('Markusele, Päärule ja Kaile')
    expect(namesInCase([MARKUS, PAARU], 'comitative')).toBe('Markuse ja Pääruga')
    expect(joinList(['Markus', 'Pääru', 'Kai'])).toBe('Markus, Pääru ja Kai')
  })

  it('formats dates', () => {
    expect(formatDate('2026-12-01')).toBe('1. detsember 2026')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('puzzle tools', () => {
  it('number code round-trips', () => {
    expect(decodeNumbers(encodeNumbers('Häid jõule'))).toBe('HÄID JÕULE')
  })

  it('shift cipher is reversible', () => {
    expect(shiftText(shiftText('Päkapikk', 3), -3)).toBe('PÄKAPIKK')
  })

  it('scrambles into a real anagram that differs from the word', () => {
    const scrambled = scramble('kõrvits', createRng(7))
    expect(scrambled).not.toBe('KÕRVITS')
    expect(isAnagram('kõrvits', scrambled)).toBe(true)
  })
})
