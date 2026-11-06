import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { useCreationsStore } from '@/features/preview/creationsStore'
import type { RequestFor } from '@/domain/models'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { DEFAULT_GENERAL, defaultOptions } from '@/domain/defaults'
import { fitsSheet, letterHeightMm, MAX_PT, MIN_PT, printTextPt, SHEET_HEIGHT_MM } from '@/features/preview/printFit'
import { KAI, makeRequest, MARKUS, PAARU } from './helpers'

const paragraph = 'Ma tulin otse töökoja köögist – kui kiri lõhnab kaneeli järele, siis ongi nii.'
const letter = (paragraphs: number) => ({
  label: '1. detsember 2026',
  heading: 'Kallis Markus!',
  body: Array.from({ length: paragraphs }, () => paragraph).join('\n\n'),
  signature: 'Kiirelt-kiirelt\nPäkapikk Tuduja',
})

describe('print fit', () => {
  it('keeps a short letter at full size', () => {
    expect(printTextPt(letter(2), { sheet: 'half' })).toBe(MAX_PT)
  })

  it('makes the text smaller as the letter grows, and never below the minimum', () => {
    const sizes = [2, 4, 6, 8, 12].map((n) => printTextPt(letter(n), { sheet: 'half', uppercase: true, backdrop: true }))
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
    expect(sizes[0]).toBe(MAX_PT)
    expect(sizes.at(-1)).toBe(MIN_PT)
  })

  it('fits the letter in its sheet at the size it picks', () => {
    for (const n of [3, 5, 6, 7]) {
      const options = { sheet: 'half' as const, uppercase: true, backdrop: true }
      if (!fitsSheet(letter(n), options)) continue
      expect(letterHeightMm(letter(n), printTextPt(letter(n), options), options)).toBeLessThanOrEqual(SHEET_HEIGHT_MM.half)
    }
  })

  it('takes the half page off when a letter does not fit even at the smallest size', () => {
    expect(fitsSheet(letter(4), { sheet: 'half' })).toBe(true)
    expect(fitsSheet(letter(12), { sheet: 'half', uppercase: true, backdrop: true })).toBe(false)
    // A whole page still holds it.
    expect(fitsSheet(letter(12), { sheet: 'page', uppercase: true, backdrop: true })).toBe(true)
  })

  it('counts capitals and a background panel as taking more room', () => {
    const plain = letterHeightMm(letter(5), 12, { sheet: 'half' })
    expect(letterHeightMm(letter(5), 12, { sheet: 'half', uppercase: true })).toBeGreaterThan(plain)
    expect(letterHeightMm(letter(5), 12, { sheet: 'half', backdrop: true })).toBeGreaterThan(plain)
  })

  it('fits every template letter that is offered on a half page, and all of them on a whole page', async () => {
    for (const child of [MARKUS, PAARU, KAI]) {
      const content = await templateGenerator.generate({
        contentType: 'letter',
        children: [{ ...child }],
        occasionId: 'christmas',
        general: { ...DEFAULT_GENERAL },
        seed: 7,
        options: defaultOptions('christmas').letter,
      })
      for (const uppercase of [false, true])
        for (const backdrop of [false, true]) {
          for (const item of content.items) {
            const half = { sheet: 'half' as const, uppercase, backdrop }
            if (fitsSheet(item, half)) expect(letterHeightMm(item, printTextPt(item, half), half)).toBeLessThanOrEqual(SHEET_HEIGHT_MM.half)
            const page = { sheet: 'page' as const, uppercase, backdrop }
            expect(printTextPt(item, page), `${child.name}: ${item.label}`).toBe(MAX_PT)
          }
        }
    }
  })
})

describe('half page in the preview', () => {
  async function openPreview() {
    const pinia = createPinia()
    setActivePinia(pinia)
    const request = makeRequest('letter', { occasionId: 'christmas', children: [KAI], options: { startDate: '2026-12-01' } }) as RequestFor<'letter'>
    const content = await templateGenerator.generate(request)
    const store = useCreationsStore()
    store.add(content)
    store.setLayout(content.id, 'half')
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push(`/looming/${content.id}`)
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    await screen.findByRole('heading', { level: 1 })
    return { store, content }
  }

  it('is off while a letter is too long for it, and back once the letter is shorter', async () => {
    const { store, content } = await openPreview()
    const half = () => screen.getByRole('radio', { name: 'Pool lehte' })
    expect(half()).toBeEnabled()
    expect(store.byId(content.id)!.layout).toBe('half')

    const first = content.items[0]!
    store.editItem(content.id, first.id, { body: letter(12).body })
    await vi.waitFor(() => expect(half()).toBeDisabled())
    expect(screen.getByText(/Pool lehte pole praegu valitav/)).toBeInTheDocument()
    // The letters move to whole pages rather than being cut.
    expect(store.byId(content.id)!.layout).toBe('page')

    store.editItem(content.id, first.id, { body: letter(2).body })
    await vi.waitFor(() => expect(half()).toBeEnabled())
    expect(screen.queryByText(/Pool lehte pole praegu valitav/)).not.toBeInTheDocument()
  })

  it('gives a long letter a smaller print size', async () => {
    const { store, content } = await openPreview()
    const first = content.items[0]!
    store.editItem(content.id, first.id, { body: letter(5).body })
    await vi.waitFor(() => expect(screen.getAllByText(paragraph)).toHaveLength(5))
    expect(store.byId(content.id)!.layout).toBe('half')
    const papers = document.querySelectorAll<HTMLElement>('.sheet--half .paper')
    expect(papers[0]!.style.getPropertyValue('--print-pt')).toMatch(/^\d+(\.5)?pt$/)
    expect(parseFloat(papers[0]!.style.getPropertyValue('--print-pt'))).toBeLessThan(MAX_PT)
    expect(papers[1]!.style.getPropertyValue('--print-pt')).toBe(`${MAX_PT}pt`)
  })
})
