import { describe, expect, it } from 'vitest'
import { formatDate, addDays, genitive, joinList, namesInCase, nameCase } from '@/domain/text/estonian'
import { decodeNumbers, encodeNumbers, isAnagram, scramble, shiftText } from '@/domain/generators/puzzleTools'
import { createRng } from '@/domain/text/random'
import { BRITA, JASPER, RUBEN } from './helpers'

describe('Estonian grammar helpers', () => {
  it('builds genitive forms', () => {
    expect(genitive('Ruben')).toBe('Rubeni')
    expect(genitive('Brita')).toBe('Brita')
    expect(genitive('Mart', 'Mardi')).toBe('Mardi')
  })

  it('declines names and lists', () => {
    expect(nameCase(RUBEN, 'allative')).toBe('Rubenile')
    expect(namesInCase([RUBEN, JASPER, BRITA], 'allative')).toBe('Rubenile, Jasperile ja Britale')
    expect(namesInCase([RUBEN, JASPER], 'comitative')).toBe('Rubeni ja Jasperiga')
    expect(joinList(['Ruben', 'Jasper', 'Brita'])).toBe('Ruben, Jasper ja Brita')
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
