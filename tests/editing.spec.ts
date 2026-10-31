import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { useCreationsStore } from '@/features/preview/creationsStore'
import type { RequestFor } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

async function openPreview(children = [RUBEN]) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const request = makeRequest('letter', {
    occasionId: 'christmas',
    children,
    options: { startDate: '2026-12-01' },
  }) as RequestFor<'letter'>
  const content = await templateGenerator.generate(request)
  const store = useCreationsStore()
  store.add(content)
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(`/looming/${content.id}`)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  await screen.findByRole('heading', { level: 1 })
  return { store, id: content.id, user: userEvent.setup() }
}

describe('editing on the puzzle poster', () => {
  it('every card has an edit button that opens an editor and saves the change', async () => {
    const { store, id, user } = await openPreview()
    expect(store.byId(id)!.layout).toBe('poster')
    const buttons = screen.getAllByRole('button', { name: /^Muuda: / })
    expect(buttons).toHaveLength(24)

    await user.click(screen.getByRole('button', { name: 'Muuda: 1. detsember' }))
    const dialog = screen.getByRole('dialog', { name: 'Muuda: 1. detsember' })
    const body = within(dialog).getByLabelText('Tekst')
    expect(document.activeElement).toBe(body)
    await user.clear(body)
    await user.type(body, 'Täna käisime koos Mariet’ga liugu laskmas!')
    await user.click(within(dialog).getByRole('button', { name: 'Salvesta' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    const first = store.byId(id)!.items[0]!
    expect(first.body).toBe('Täna käisime koos Mariet’ga liugu laskmas!')
    expect(first.edited).toBe(true)
    expect(screen.getByText(/Täna käisime koos Mariet’ga liugu laskmas!/)).toBeInTheDocument()
  })

  it('Escape closes the editor without saving', async () => {
    const { store, id, user } = await openPreview()
    const before = store.byId(id)!.items[1]!.body
    await user.click(screen.getByRole('button', { name: 'Muuda: 2. detsember' }))
    await user.type(screen.getByLabelText('Tekst'), ' lisa')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(store.byId(id)!.items[1]!.body).toBe(before)
  })

  it('asks before a new variant replaces hand-made changes', async () => {
    const { store, id, user } = await openPreview()
    store.editItem(id, store.byId(id)!.items[2]!.id, { body: 'Minu oma tekst' })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(screen.getByRole('button', { name: 'Muuda: 3. detsember' }))
    await user.click(screen.getByRole('button', { name: /Uus variant/ }))
    expect(confirm).toHaveBeenCalled()
    expect(store.byId(id)!.items[2]!.body).toBe('Minu oma tekst')
    confirm.mockRestore()
  })
})

describe('editing toddler cards in a family series', () => {
  it('toddler cards have edit buttons too and save to the right child', async () => {
    const { store, id, user } = await openPreview([RUBEN, JASPER, BRITA])
    await user.click(screen.getByRole('radio', { name: 'Brita' }))
    expect(document.querySelectorAll('.mini')).toHaveLength(24)
    await user.click(screen.getByRole('button', { name: 'Muuda: 5. kaart' }))
    const dialog = screen.getByRole('dialog', { name: 'Muuda: Brita, 5. detsember' })
    const body = within(dialog).getByLabelText('Tekst')
    await user.clear(body)
    await user.type(body, 'Anna täna Rubenile ja Jasperile suur kalli!')
    await user.click(within(dialog).getByRole('button', { name: 'Salvesta' }))
    const brita = store.byId(id)!.items.filter((item) => item.childId === BRITA.id)
    expect(brita[4]!.body).toBe('Anna täna Rubenile ja Jasperile suur kalli!')
  })
})
