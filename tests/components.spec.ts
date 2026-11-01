import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import ChildForm from '@/features/children/ChildForm.vue'
import PrintableItem from '@/features/preview/PrintableItem.vue'
import { emptyChildDraft, useChildrenStore } from '@/features/children/childrenStore'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { EMPTY_DECORATION, type GeneratedItem } from '@/domain/models'
import { defaultLayoutFor } from '@/domain/generators/templateGenerator'

async function renderApp(path: string, { demo = true } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  if (demo) useChildrenStore().restoreDemo()
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
    await user.type(screen.getByLabelText('Muud huvid ja hobid'), 'jalgpall, lego')
    await user.click(screen.getByRole('checkbox', { name: 'Dinosaurused' }))
    await user.click(screen.getByRole('checkbox', { name: 'Pannkoogid' }))
    await user.type(screen.getByLabelText('Nimi omastavas käändes (valikuline)'), 'Mardi')
    await user.click(screen.getByRole('button', { name: 'Lisa laps' }))
    const saved = emitted<[ReturnType<typeof emptyChildDraft>]>().save?.[0]?.[0]
    expect(saved?.name).toBe('Mart')
    expect(saved?.interests).toEqual(['jalgpall', 'lego'])
    expect(saved?.nameGenitive).toBe('Mardi')
    expect(saved?.topics).toEqual(['dinosaurs', 'pancakes'])
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

  it('renders paragraphs and asks for the editor', async () => {
    const user = userEvent.setup()
    const { emitted } = render(PrintableItem, { props: { item } })
    expect(screen.getByText('Teine lõik.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Muuda: 1. kiri' }))
    expect(emitted().edit).toHaveLength(1)
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

    // Type and occasion are one question; once both are picked the wizard moves on by itself.
    await user.click(await screen.findByRole('radio', { name: /Personaalne lugu/ }))
    await user.click(screen.getByRole('radio', { name: /Sünnipäev/ }))

    await user.click(await screen.findByRole('checkbox', { name: /Ruben/ }))
    await user.click(screen.getByRole('checkbox', { name: /Jasper/ }))
    expect(screen.getByText(/Ühine elamus\./)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Loo ja vaata eelvaadet/ }))

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('preview'))
    const title = await screen.findByRole('heading', { level: 1 })
    expect(title.textContent).toContain('Ruben, Jasper ja kadunud sünnipäevatordi juhtum')

    const store = useCreationsStore()
    expect(store.creations).toHaveLength(1)
    expect(store.creations[0]?.request.children.map((c) => c.name)).toEqual(['Ruben', 'Jasper'])

    const firstEdit = screen.getAllByRole('button', { name: /^Muuda:/ })[0]!
    await user.click(firstEdit)
    const dialog = screen.getByRole('dialog')
    const body = within(dialog).getByLabelText('Tekst')
    await user.clear(body)
    await user.type(body, 'Täiesti uus algus')
    await user.click(within(dialog).getByRole('button', { name: /Salvesta/ }))
    expect(await screen.findByText('Täiesti uus algus')).toBeInTheDocument()
    expect(store.creations[0]?.items[0]?.edited).toBe(true)
  })

  it('cannot continue without choosing a content type', async () => {
    await renderApp('/loo')
    expect(await screen.findByRole('button', { name: /Edasi/ })).toBeDisabled()
  })

  it('asks a new family to add a child first', async () => {
    const { user } = await renderApp('/loo', { demo: false })
    await user.click(await screen.findByRole('radio', { name: /Personaalne lugu/ }))
    await user.click(screen.getByRole('radio', { name: /Sünnipäev/ }))
    expect(await screen.findByText('Profiile pole veel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Loo ja vaata eelvaadet/ })).toBeDisabled()
  })

  it('prefills type and occasion from the homepage link', async () => {
    const { user } = await renderApp('/loo?tyyp=calendar&puhk=christmas')
    expect(await screen.findByRole('heading', { name: 'Kellele?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vali kõik' }))
    expect(within(document.querySelector('.wizard__summary') as HTMLElement).getByText('Jõulud')).toBeInTheDocument()
    // "Tagasi" still reaches the card's choices.
    await user.click(screen.getByRole('button', { name: /Tagasi/ }))
    expect(await screen.findByRole('heading', { name: 'Mida soovid luua?' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Tegevuskalender/ })).toHaveAttribute('aria-checked', 'true')
  })

  it('takes a new family from the home page card to 24 letters in three screens', async () => {
    const { user, router } = await renderApp('/', { demo: false })
    // Screen 1: the home page.
    await user.click(await screen.findByRole('link', { name: '24 päkapikukirja' }))

    // Screen 2: "Kellele?" – the child is added in a dialog, without leaving the wizard.
    expect(await screen.findByRole('heading', { name: 'Kellele?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Lisa laps/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Lisa laps' })
    await user.type(within(dialog).getByLabelText('Nimi'), 'Mia')
    const age = within(dialog).getByLabelText('Vanus')
    await user.clear(age)
    await user.type(age, '8')
    // The reading level follows the age.
    expect(within(dialog).getByLabelText('Lugemisoskus')).toHaveValue('independent')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Dinosaurused' }))
    await user.click(within(dialog).getByRole('button', { name: 'Lisa laps' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.currentRoute.value.path).toBe('/loo')
    expect(screen.getByRole('checkbox', { name: /Mia/ })).toHaveAttribute('aria-checked', 'true')

    // Screen 3: the preview with all 24 letters.
    await user.click(screen.getByRole('button', { name: /Loo ja vaata eelvaadet/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('preview'))
    const [creation] = useCreationsStore().creations
    expect(creation?.items).toHaveLength(24)
    expect(creation?.request.children[0]).toMatchObject({ name: 'Mia', age: 8, topics: ['dinosaurs'] })
    expect(useChildrenStore().children.map((child) => child.name)).toEqual(['Mia'])
  })
})

describe('quick child dialog', () => {
  it('lets at most three topics be picked', async () => {
    const { user } = await renderApp('/loo?tyyp=letter&puhk=christmas', { demo: false })
    await user.click(await screen.findByRole('button', { name: /Lisa laps/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Lisa laps' })
    expect(within(dialog).getByLabelText('Nimi')).toHaveFocus()
    for (const name of ['Dinosaurused', 'Pannkoogid', 'Jalgpall']) await user.click(within(dialog).getByRole('checkbox', { name }))
    expect(within(dialog).getByRole('checkbox', { name: 'Loomad' })).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useChildrenStore().children).toHaveLength(0)
  })
})

describe('preview with choices beside it', () => {
  async function letterPreview() {
    const { user, router } = await renderApp('/loo?tyyp=letter&puhk=christmas')
    await user.click(await screen.findByRole('checkbox', { name: /Jasper/ }))
    await user.click(screen.getByRole('button', { name: /Loo ja vaata eelvaadet/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('preview'))
    return { user, store: useCreationsStore() }
  }

  it('updates the letters right away when a choice changes', async () => {
    const { user, store } = await letterPreview()
    expect(store.creations[0]?.items).toHaveLength(24)
    expect(store.creations[0]?.layout).toBe('poster')
    const { id } = store.creations[0]!
    store.setDecoration(id, { ...EMPTY_DECORATION, pattern: 'stars', inkSaver: true })
    const panel = screen.getByRole('region', { name: /Kohanda/ })
    await user.click(within(panel).getByRole('radio', { name: '3 kirja' }))
    await vi.waitFor(() => expect(store.creations[0]?.items).toHaveLength(3))
    // Still the same creation; the default layout follows the shorter series.
    expect(store.creations).toHaveLength(1)
    expect(store.creations[0]?.request.options).toMatchObject({ count: 3 })
    expect(store.creations[0]?.layout).toBe(defaultLayoutFor(store.creations[0]!.request))
    expect(store.creations[0]?.id).toBe(id)
    expect(store.creations[0]?.decoration).toMatchObject({ pattern: 'stars', inkSaver: true })
  })

  it('keeps a layout the parent picked when the choices change', async () => {
    const { user, store } = await letterPreview()
    store.setLayout(store.creations[0]!.id, 'page')
    await user.click(within(screen.getByRole('region', { name: /Kohanda/ })).getByRole('radio', { name: '7 kirja' }))
    await vi.waitFor(() => expect(store.creations[0]?.items).toHaveLength(7))
    expect(store.creations[0]?.layout).toBe('page')
  })

  it('asks before replacing hand-made changes and keeps them when the parent says no', async () => {
    const { user, store } = await letterPreview()
    store.editItem(store.creations[0]!.id, store.creations[0]!.items[0]!.id, { body: 'Minu oma tekst' })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const panel = screen.getByRole('region', { name: /Kohanda/ })
    await user.click(within(panel).getByRole('radio', { name: '7 kirja' }))
    await vi.waitFor(() => expect(confirm).toHaveBeenCalled())
    expect(store.creations[0]?.items[0]?.body).toBe('Minu oma tekst')
    expect(within(panel).getByRole('radio', { name: '24 kirja' })).toBeChecked()
    confirm.mockRestore()
  })

  it('offers three print presets and keeps the rest under "Rohkem valikuid"', async () => {
    const { user, store } = await letterPreview()
    const presets = screen.getByRole('group', { name: 'Kuidas prindid?' })
    expect(within(presets).getAllByRole('radio').map((radio) => radio.closest('label')?.textContent?.trim())).toEqual([
      'Kaardid sussi sisse',
      'Pusleplakat',
      'Terve leht',
    ])
    await user.click(within(presets).getByRole('radio', { name: 'Kaardid sussi sisse' }))
    expect(store.creations[0]?.layout).toBe('cards')
    expect(screen.getByText('Rohkem valikuid').closest('details')).not.toHaveAttribute('open')
  })
})

describe('sample letter', () => {
  it('shows the 1 December letter of a sample child without any data entry', async () => {
    const { user, router } = await renderApp('/', { demo: false })
    await user.click(await screen.findByRole('link', { name: /Vaata näidet/ }))
    expect(await screen.findByRole('heading', { level: 1, name: /Jasper saab 1\. detsembril/ })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Kallis Jasper!' })).toBeInTheDocument()
    expect(screen.getByText(/^1\. detsember/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Muuda:/ })).not.toBeInTheDocument()
    // Nothing was saved.
    expect(useCreationsStore().creations).toHaveLength(0)
    expect(useChildrenStore().children).toHaveLength(0)
    await user.click(screen.getByRole('link', { name: /Loo oma lapsele 24 kirja/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.query).toMatchObject({ puhk: 'christmas', tyyp: 'letter' }))
  })
})
