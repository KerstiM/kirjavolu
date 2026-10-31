import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import ChildForm from '@/features/children/ChildForm.vue'
import PrintableItem from '@/features/preview/PrintableItem.vue'
import { emptyChildDraft } from '@/features/children/childrenStore'
import { useCreationsStore } from '@/features/preview/creationsStore'
import type { GeneratedItem } from '@/domain/models'

async function renderApp(path: string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  const utils = render(App, { global: { plugins: [pinia, router] } })
  return { ...utils, router, user: userEvent.setup() }
}

describe('ChildForm', () => {
  it('shows validation errors and does not save an invalid profile', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ChildForm, { props: { initial: emptyChildDraft(), mode: 'add' } })
    await user.click(screen.getByRole('button', { name: 'Lisa laps' }))
    expect(await screen.findByText('Palun sisesta lapse nimi.')).toBeInTheDocument()
    expect(emitted().save).toBeUndefined()
  })

  it('saves a valid profile with list fields parsed', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ChildForm, { props: { initial: emptyChildDraft(), mode: 'add' } })
    await user.type(screen.getByLabelText('Nimi'), 'Mart')
    await user.type(screen.getByLabelText('Huvid ja hobid'), 'jalgpall, lego')
    await user.type(screen.getByLabelText('Nimi omastavas käändes (valikuline)'), 'Mardi')
    await user.click(screen.getByRole('button', { name: 'Lisa laps' }))
    const saved = emitted<[ReturnType<typeof emptyChildDraft>]>().save?.[0]?.[0]
    expect(saved?.name).toBe('Mart')
    expect(saved?.interests).toEqual(['jalgpall', 'lego'])
    expect(saved?.nameGenitive).toBe('Mardi')
  })
})

describe('PrintableItem editing', () => {
  const item: GeneratedItem = {
    id: 'i1',
    kind: 'letter',
    label: '1. kiri',
    heading: 'Kallis Ruben!',
    body: 'Esimene lõik.\n\nTeine lõik.',
    signature: 'Päkapikk Tuduja',
    variant: 0,
    edited: false,
  }

  it('renders paragraphs and emits edits', async () => {
    const user = userEvent.setup()
    const { emitted } = render(PrintableItem, { props: { item } })
    expect(screen.getByText('Teine lõik.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Muuda: 1. kiri' }))
    const body = screen.getByLabelText('Tekst')
    await user.clear(body)
    await user.type(body, 'Uus tekst')
    await user.click(screen.getByRole('button', { name: /Salvesta/ }))
    expect(emitted<[Partial<GeneratedItem>]>().save?.[0]?.[0]).toMatchObject({ body: 'Uus tekst', heading: 'Kallis Ruben!' })
  })

  it('emits regenerate', async () => {
    const user = userEvent.setup()
    const { emitted } = render(PrintableItem, { props: { item } })
    await user.click(screen.getByRole('button', { name: 'Uus variant: 1. kiri' }))
    expect(emitted().regenerate).toHaveLength(1)
  })
})

describe('creation flow', () => {
  it('creates a shared story for siblings and opens an editable preview', async () => {
    const { user, router } = await renderApp('/loo')

    await user.click(await screen.findByRole('radio', { name: /Personaalne lugu/ }))
    await user.click(screen.getByRole('button', { name: /Edasi/ }))

    await user.click(await screen.findByRole('checkbox', { name: /Ruben/ }))
    await user.click(screen.getByRole('checkbox', { name: /Jasper/ }))
    expect(screen.getByText(/Ühine elamus\./)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Edasi/ }))

    await user.click(await screen.findByRole('radio', { name: /Sünnipäev/ }))
    await user.click(screen.getByRole('button', { name: /Edasi/ }))

    expect(await screen.findByRole('heading', { name: 'Kohanda' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Loo ja vaata eelvaadet/ }))

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('preview'))
    const title = await screen.findByRole('heading', { level: 1 })
    expect(title.textContent).toContain('Ruben, Jasper ja kadunud sünnipäevatordi juhtum')

    const store = useCreationsStore()
    expect(store.creations).toHaveLength(1)
    expect(store.creations[0]?.request.children.map((c) => c.name)).toEqual(['Ruben', 'Jasper'])

    const firstEdit = screen.getAllByRole('button', { name: /^Muuda:/ })[0]!
    await user.click(firstEdit)
    const body = screen.getByLabelText('Tekst')
    await user.clear(body)
    await user.type(body, 'Täiesti uus algus')
    await user.click(screen.getByRole('button', { name: /Salvesta/ }))
    expect(await screen.findByText('Täiesti uus algus')).toBeInTheDocument()
    expect(store.creations[0]?.items[0]?.edited).toBe(true)
  })

  it('cannot continue without choosing a content type', async () => {
    await renderApp('/loo')
    expect(await screen.findByRole('button', { name: /Edasi/ })).toBeDisabled()
  })

  it('prefills type and occasion from the homepage link', async () => {
    const { user } = await renderApp('/loo?tyyp=calendar&puhk=christmas')
    expect(await screen.findByRole('heading', { name: 'Kellele?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vali kõik' }))
    expect(within(document.querySelector('.wizard__summary') as HTMLElement).getByText('Jõulud')).toBeInTheDocument()
  })
})
