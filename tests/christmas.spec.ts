import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { resetAnalytics, setupAnalytics } from '@/app/analytics'
import { useChildrenStore } from '@/features/children/childrenStore'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { loadPass, PASS_KEY } from '@/features/pass/seasonPass'
import { languageFor, usesSmallCards } from '@/domain/generators/audience'
import type { LetterOptions } from '@/domain/models'

// Most of these tests are about the personal letters, so the pass is on sale unless a test says otherwise.
const sale = vi.hoisted(() => ({ on: true }))
vi.mock('@/features/pass/availability', () => ({
  get PASS_ENABLED() {
    return sale.on
  },
}))

const PASS = { code: 'KV-7KQM-3FXA', generationsLeft: 10, fixesLeft: 30, validUntil: '2027-01-31T21:59:59.000Z' }
const LETTERS = Array.from({ length: 24 }, (_, i) => ({ heading: 'Kallis Mia!', body: `Isiklik kiri ${i + 1}.`, signature: 'Tuduja' }))
const PENDING = 'kirjavolu.ud2.pending'
const WRITING = 'kirjavolu.joulukirjad.kirjutab'

async function open(path: string, prepare?: (pinia: Pinia) => void) {
  const pinia = createPinia()
  setActivePinia(pinia)
  prepare?.(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  return { router, pinia }
}

/** Name and age on /joulukirjad, then the free letters; returns the letters page path. */
async function freeLetters(start = '/joulukirjad') {
  const opened = await open(start)
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Lapse nimi'), 'Mia')
  await user.type(screen.getByLabelText('Vanus'), '5')
  await user.click(screen.getByRole('button', { name: /Loo tasuta kirjad/ }))
  await vi.waitFor(() => expect(opened.router.currentRoute.value.path).toMatch(/^\/joulukirjad\/./), { timeout: 5000 })
  await screen.findByRole('heading', { level: 1, name: 'Mia saab 24 jõulukirja' })
  return { ...opened, user, path: opened.router.currentRoute.value.path }
}

/** A fresh page load of the same browser: the stores keep what localStorage would have. */
async function reload(path: string, from: Pinia) {
  const creations = useCreationsStore(from).creations.map((creation) => JSON.parse(JSON.stringify(creation)))
  const kids = useChildrenStore(from).children.map((child) => JSON.parse(JSON.stringify(child)))
  document.body.innerHTML = ''
  return open(path, (pinia) => {
    creations.forEach((creation) => useCreationsStore(pinia).creations.push(creation))
    kids.forEach((child) => useChildrenStore(pinia).children.push(child))
  })
}

afterEach(() => {
  sale.on = true
  vi.unstubAllGlobals()
  resetAnalytics()
  localStorage.removeItem(PASS_KEY)
  localStorage.removeItem(PENDING)
  localStorage.removeItem(WRITING)
})

describe('Christmas letters: who for and the free letters', () => {
  it('asks only who it is for and shows the 24 free letters at once', async () => {
    const { router, pinia } = await open('/joulukirjad')
    const user = userEvent.setup()
    expect(await screen.findByRole('heading', { level: 1, name: 'Päkapikk kirjutab sinu lapsele 24 jõulukirja' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Jõulukirjade sammud' })).not.toHaveTextContent('isiklikumaks')
    await user.type(screen.getByLabelText('Lapse nimi'), 'Mia')
    await user.type(screen.getByLabelText('Vanus'), '5')
    // Topics are optional; one picked goes into the profile and the free letters.
    await user.click(screen.getByText('Mis lapsele meeldib?'))
    await user.click(screen.getByRole('checkbox', { name: 'Dinosaurused' }))
    await user.click(screen.getByRole('button', { name: /Loo tasuta kirjad/ }))

    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\//), { timeout: 5000 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Mia saab 24 jõulukirja' })).toBeInTheDocument()
    expect(useChildrenStore(pinia).children[0]).toMatchObject({ name: 'Mia', age: 5, topics: ['dinosaurs'] })
    const creation = useCreationsStore(pinia).creations[0]!
    expect(creation.items).toHaveLength(24)
    expect(creation.request).toMatchObject({ contentType: 'letter', occasionId: 'christmas' })
    // Print, PDF and the full editor are one click away.
    expect(screen.getByRole('link', { name: /Prindi või salvesta PDF/ })).toHaveAttribute('href', `/looming/${creation.id}`)
  })

  it('gives a two-year-old full letters, the elf under them and an ink-saving frame of stars', async () => {
    const { router, pinia } = await open('/joulukirjad')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Lapse nimi'), 'Mia')
    await user.type(screen.getByLabelText('Vanus'), '2')
    await user.click(screen.getByRole('button', { name: /Loo tasuta kirjad/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\/./), { timeout: 5000 })
    const creation = useCreationsStore(pinia).creations[0]!
    const child = creation.request.children[0]!
    expect(languageFor(child, creation.request.options as LetterOptions)).toBe('rich')
    expect(usesSmallCards(child, creation.request)).toBe(false)
    expect(creation.decoration).toMatchObject({ pattern: 'stars', inkSaver: true, companion: 'pakapikk' })
  })

  it('needs a name and an age before making the letters', async () => {
    await open('/joulukirjad')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Loo tasuta kirjad/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kirjuta lapse nimi.')
    await user.type(screen.getByLabelText('Lapse nimi'), 'Mia')
    await user.click(screen.getByRole('button', { name: /Loo tasuta kirjad/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kirjuta lapse vanus')
  })

  it('asks nothing again for a child already in this browser', async () => {
    const { router } = await open('/joulukirjad', () => {
      useChildrenStore().restoreDemo()
    })
    const user = userEvent.setup()
    const kids = await screen.findByRole('group', { name: /Kellele\?/ })
    expect(within(kids).getByRole('checkbox', { name: /^Markus/ })).toBeChecked()
    expect(screen.queryByLabelText('Lapse nimi')).toBeNull()
    await user.click(screen.getByRole('button', { name: /Loo tasuta kirjad/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\//), { timeout: 5000 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Markus saab 24 jõulukirja' })).toBeInTheDocument()
  })

  it('lets a new family type in several children at once', async () => {
    const { router, pinia } = await open('/joulukirjad')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Lapse nimi'), 'Mia')
    await user.type(screen.getByLabelText('Vanus'), '5')
    await user.click(screen.getByRole('button', { name: /Lisa veel üks laps/ }))
    // The second row says whose it is, and an empty row is caught before anyone is saved.
    await user.type(screen.getByLabelText('2. lapse nimi'), 'Oskar')
    await user.click(screen.getByRole('button', { name: /Loo 2 lapsele tasuta kirjad/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kirjuta 2. lapse vanus (0–14).')
    expect(useChildrenStore(pinia).children).toHaveLength(0)
    await user.type(screen.getAllByLabelText('Vanus')[1]!, '9')
    await user.click(screen.getByRole('button', { name: /Loo 2 lapsele tasuta kirjad/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\//), { timeout: 5000 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Jõulukirjad on valmis: Mia ja Oskar' })).toBeInTheDocument()
    expect(useChildrenStore(pinia).children.map((child) => child.name).sort()).toEqual(['Mia', 'Oskar'])
    expect(useCreationsStore(pinia).creations[0]?.request.children.map((child) => child.name)).toEqual(['Mia', 'Oskar'])
  })

  it('counts only the children picked or typed in, not empty rows', async () => {
    const { router } = await open('/joulukirjad', () => {
      useChildrenStore().restoreDemo()
    })
    const user = userEvent.setup()
    await user.click(within(await screen.findByRole('group', { name: /Kellele\?/ })).getByRole('checkbox', { name: /Uus laps/ }))
    await user.click(screen.getByRole('button', { name: /Lisa veel üks laps/ }))
    // Markus is picked; two empty rows do not make it three.
    expect(screen.getByRole('button', { name: /^Loo tasuta kirjad/ })).toBeInTheDocument()
    await user.type(screen.getByLabelText('1. lapse nimi'), 'Mia')
    expect(screen.getByRole('button', { name: /Loo 2 lapsele tasuta kirjad/ })).toBeInTheDocument()
    await user.type(screen.getAllByLabelText('Vanus')[0]!, '5')
    await user.click(screen.getByRole('button', { name: /Loo 2 lapsele tasuta kirjad/ }))
    // The empty second row is left out, not an error.
    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\//), { timeout: 5000 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Jõulukirjad on valmis: Markus ja Mia' })).toBeInTheDocument()
  })

  it('lets a typed row be taken away again', async () => {
    await open('/joulukirjad')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Lisa veel üks laps/ }))
    await user.click(screen.getByRole('button', { name: 'Eemalda 2. laps' }))
    expect(screen.getAllByLabelText(/nimi$/)).toHaveLength(1)
    expect(screen.getByRole('button', { name: /^Loo tasuta kirjad/ })).toBeInTheDocument()
  })

  it('makes linked letters for siblings, as the wizard does', async () => {
    const { router, pinia } = await open('/joulukirjad', () => {
      useChildrenStore().restoreDemo()
    })
    const user = userEvent.setup()
    const kids = await screen.findByRole('group', { name: /Kellele\? võid valida mitu/ })
    await user.click(within(kids).getByRole('checkbox', { name: /^Pääru/ }))
    expect(screen.getByText(/Õed-vennad saavad seotud kirjad/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Loo 2 lapsele tasuta kirjad/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\//), { timeout: 5000 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Jõulukirjad on valmis: Markus ja Pääru' })).toBeInTheDocument()
    const creation = useCreationsStore(pinia).creations[0]!
    expect(creation.request.children.map((child) => child.name)).toEqual(['Markus', 'Pääru'])
    expect(creation.items).toHaveLength(48)

    // One child at a time: their own letters, and their own personal offer.
    const tabs = screen.getByRole('tablist', { name: 'Kelle kirjad' })
    await user.click(within(tabs).getByRole('tab', { name: /^Pääru/ }))
    expect(document.querySelectorAll('.letters__list .paper')).toHaveLength(3)
    expect(screen.queryByRole('heading', { level: 3, name: /Markus/ })).toBeNull()
    expect(screen.getAllByRole('heading', { level: 3, name: /Pääru/ }).length).toBeGreaterThan(0)
    const offer = screen.getByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })
    expect(within(offer).getByText(/igale lapsele eraldi ja igaüks kasutab Jõulupassist ühe kirjasarja/)).toBeInTheDocument()
  })

  it('writes one sibling’s personal letters beside the family letters, which stay', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } })))
    const { router, pinia } = await open('/joulukirjad', () => {
      useChildrenStore().restoreDemo()
    })
    const user = userEvent.setup()
    await user.click(within(await screen.findByRole('group', { name: /Kellele\?/ })).getByRole('checkbox', { name: /^Pääru/ }))
    await user.click(screen.getByRole('button', { name: /Loo 2 lapsele tasuta kirjad/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/joulukirjad\//), { timeout: 5000 })
    const familyId = router.currentRoute.value.path.split('/').pop()!
    await user.click(within(await screen.findByRole('tablist', { name: 'Kelle kirjad' })).getByRole('tab', { name: /^Pääru/ }))
    await user.click(screen.getByRole('button', { name: /Kirjuta Päärule isiklikud kirjad/ }))

    const done = await screen.findByRole('region', { name: 'Pääru isiklikud kirjad on valmis' }, { timeout: 5000 })
    const store = useCreationsStore(pinia)
    expect(store.creations).toHaveLength(2)
    expect(store.byId(familyId)?.items).toHaveLength(48)
    const personal = store.creations.find((creation) => creation.id !== familyId)!
    expect(personal.request.children[0]?.name).toBe('Pääru')
    expect(within(done).getByRole('link', { name: /Ava Pääru isiklikud kirjad/ })).toHaveAttribute('href', `/joulukirjad/${personal.id}`)
    // Markus can still get his own.
    await user.click(screen.getByRole('tab', { name: /^Markus/ }))
    expect(screen.getByRole('button', { name: /Kirjuta Markusele isiklikud kirjad/ })).toBeInTheDocument()
  })

  it('lets a letter be edited right there, and keeps the change', async () => {
    const { user, pinia } = await freeLetters()
    await user.click(screen.getAllByRole('button', { name: /^Muuda:/ })[0]!)
    const dialog = screen.getByRole('dialog')
    const body = within(dialog).getByLabelText('Tekst')
    await user.clear(body)
    await user.type(body, 'Minu oma algus')
    await user.click(within(dialog).getByRole('button', { name: /Salvesta/ }))
    expect(await screen.findByText('Minu oma algus')).toBeInTheDocument()
    expect(useCreationsStore(pinia).creations[0]?.items[0]).toMatchObject({ body: 'Minu oma algus', edited: true })
    // Template variants belong to the full preview, not this short page.
    expect(screen.queryByRole('button', { name: /^Uus variant/ })).toBeNull()
  })

  it('shows three letters first and all 24 on request', async () => {
    const { user } = await freeLetters()
    expect(document.querySelectorAll('.letters__list .paper')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Näita kõiki 24 kirja' }))
    expect(document.querySelectorAll('.letters__list .paper')).toHaveLength(24)
  })

  it('says the letters are gone in a browser that does not have them', async () => {
    await open('/joulukirjad/olematu')
    expect(await screen.findByRole('heading', { level: 1, name: 'Neid kirju selles brauseris ei ole' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tee uued kirjad' })).toHaveAttribute('href', '/joulukirjad')
  })
})

describe('Christmas letters: the optional personal letters', () => {
  it('is a gray "Varsti" box with only the lead while the pass is not on sale', async () => {
    sale.on = false
    await freeLetters()
    const offer = screen.getByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })
    expect(offer).toHaveClass('is-soon')
    expect(offer).toHaveTextContent('Varsti')
    expect(offer).toHaveTextContent('Lisa lapse päriselu tegemised, pereliikmed ja jõuluplaanid. Nii sünnib kirjasari, mis räägib just Mia maailmast.')
    expect(within(offer).queryByRole('table')).toBeNull()
    expect(within(offer).queryByRole('button')).toBeNull()
    expect(within(offer).queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('link', { name: /Tee kirjad isiklikumaks/ })).toBeNull()
    expect(document.body.textContent).not.toMatch(/Jõulupass/)
  })

  it('shows what free already has, what personal adds, the price and what one purchase covers', async () => {
    await freeLetters()
    const offer = screen.getByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })
    expect(within(offer).getByText(/Lisa lapse päriselu tegemised, pereliikmed ja jõuluplaanid/)).toBeInTheDocument()
    const table = within(offer).getByRole('table', { name: /Mis on tasuta kirjades/ })
    expect(within(table).getByRole('row', { name: /Pereliikmed ja lemmikloomad nimepidi/ })).toHaveTextContent('–Jah')
    expect(within(table).getByRole('row', { name: /Ise muutmine, printimine ja PDF/ })).toHaveTextContent('JahJah')
    const facts = within(offer).getByRole('list', { name: 'Mida Jõulupass sisaldab' })
    expect(facts).toHaveTextContent('9,90 € ühekordne makse')
    expect(facts).toHaveTextContent('10 kirjasarja või lugu')
    expect(facts).toHaveTextContent('õdedele-vendadele')
    expect(facts).toHaveTextContent('Kehtib 31. jaanuarini')
    expect(within(offer).getByRole('button', { name: /Osta Jõulupass 9,90 € ja kirjuta/ })).toBeInTheDocument()
    expect(within(offer).getByRole('checkbox', { name: /hakkaks kohe kehtima/ })).not.toBeChecked()
    expect(within(offer).getByText(/tasuta kirjad saad ka ilma passita välja printida/)).toBeInTheDocument()
  })

  it('can be declined: the free letters print without it', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const { user, router } = await freeLetters()
    await user.click(screen.getByRole('link', { name: /Prindi või salvesta PDF/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('preview'), { timeout: 5000 })
    expect(await screen.findByRole('button', { name: /Prindi \/ PDF/ })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('opens the checkout only after consent, with this page as the way back', async () => {
    const fetch = vi.fn(async () => Response.json({ error: 'too_many' }, { status: 429 }))
    vi.stubGlobal('fetch', fetch)
    const { user, path } = await freeLetters()
    const offer = screen.getByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })
    await user.click(within(offer).getByRole('button', { name: /Osta Jõulupass/ }))
    expect(await within(offer).findByRole('alert')).toHaveTextContent('nõustud tingimustega')
    expect(fetch).not.toHaveBeenCalled()

    await user.click(within(offer).getByRole('checkbox', { name: /hakkaks kohe kehtima/ }))
    await user.click(within(offer).getByRole('button', { name: /Osta Jõulupass/ }))
    expect(await within(offer).findByRole('alert')).toHaveTextContent('Liiga palju katseid')
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/ost')
    expect(JSON.parse(String(init.body))).toEqual({ returnTo: path })
    expect(localStorage.getItem(PENDING)).toBe(path.split('/').pop())
  })

  it('writes at once with a pass already in this browser, and tells what it uses', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    const fetch = vi.fn(async () => Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }))
    vi.stubGlobal('fetch', fetch)
    const { user, pinia } = await freeLetters()
    const offer = screen.getByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })
    expect(within(offer).getByText(/kasutab ühe kirjasarja, alles on 10/)).toBeInTheDocument()
    await user.type(within(offer).getByLabelText('Selle detsembri plaanid'), '12.12 vanaema juurde')
    await user.click(within(offer).getByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Mia isiklikud kirjad on valmis' }, { timeout: 5000 })).toBeInTheDocument()
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/kirjad')
    expect(JSON.parse(String(init.body)).child).toMatchObject({ name: 'Mia', december: '12.12 vanaema juurde', length: 'medium' })
    expect(useCreationsStore(pinia).creations).toHaveLength(1)
    expect(useCreationsStore(pinia).creations[0]?.items[0]?.body).toBe('Isiklik kiri 1.')
    expect(loadPass()?.generationsLeft).toBe(9)
    expect(screen.queryByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })).toBeNull()
    expect(localStorage.getItem(WRITING)).toBeNull()
  })

  it('lets the length be picked, and offers to write them all again or have one letter rewritten', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    const fetch = vi.fn(async (url: string) =>
      url === '/api/joulupass/parandus'
        ? Response.json({ letter: { heading: 'Kallis Mia!', body: 'Pikem kiri.', signature: 'Tuduja' }, pass: { ...PASS, generationsLeft: 9, fixesLeft: 29 } })
        : Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }),
    )
    vi.stubGlobal('fetch', fetch)
    const { user } = await freeLetters()
    const offer = screen.getByRole('region', { name: /Muuda kirjad veel isiklikumaks/ })
    const lengths = within(offer).getByRole('group', { name: 'Kirjade pikkus' })
    expect(within(lengths).getByRole('radio', { name: 'Keskmine' })).toBeChecked()
    await user.click(within(lengths).getByRole('radio', { name: 'Pikk' }))
    await user.click(within(offer).getByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ }))
    await screen.findByRole('heading', { level: 1, name: 'Mia isiklikud kirjad on valmis' }, { timeout: 5000 })
    expect(JSON.parse(String((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body)).child.length).toBe('long')

    // One letter rewritten by the elf, with the same length remembered.
    await user.click(screen.getAllByRole('button', { name: /^Muuda:/ })[0]!)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Kulub 1 päkapiku muudatus/)).toBeInTheDocument()
    await user.type(within(dialog).getByRole('textbox', { name: /Mida päkapikk/ }), 'tee pikemaks')
    await user.click(within(dialog).getByRole('button', { name: /Palu päkapikul muuta/ }))
    await vi.waitFor(() => expect(within(dialog).getByLabelText('Tekst')).toHaveValue('Pikem kiri.'))
    const fix = fetch.mock.calls.find((call) => call[0] === '/api/joulupass/parandus') as unknown as [string, RequestInit]
    expect(JSON.parse(String(fix[1].body))).toMatchObject({ day: 1, wish: 'tee pikemaks', child: { length: 'long' } })
    await user.click(within(dialog).getByRole('button', { name: /Salvesta/ }))

    // The whole series again, with a warning that hand-made changes go.
    const again = screen.getByRole('region', { name: 'Pole päris see, mida ootasid?' })
    expect(again).toHaveTextContent('Kasutab ühe kirjasarja, alles on 9')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(within(again).getByRole('button', { name: /Kirjuta kõik uuesti/ }))
    expect(confirm).toHaveBeenCalled()
    expect(fetch.mock.calls.filter((call) => call[0] === '/api/joulupass/kirjad')).toHaveLength(1)
    confirm.mockRestore()
  })

  it('shows an honest waiting state while writing: no stages or percentages', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    let answer: (value: Response) => void = () => undefined
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))))
    const { user } = await freeLetters()
    await user.click(screen.getByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ }))
    const status = await screen.findByText(/Päkapikk kirjutab Miale 24 isiklikku kirja/)
    const box = status.closest('section')!
    expect(box).toHaveTextContent('Tavaliselt võtab see paar minutit')
    expect(box.textContent).not.toMatch(/%/)
    expect(JSON.parse(localStorage.getItem(WRITING)!)).toMatchObject({ left: 10 })
    // A second press cannot start a second series while one is being written.
    expect(screen.queryByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ })).toBeNull()
    answer(Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Mia isiklikud kirjad on valmis' })).toBeInTheDocument()
  })

  it('says the series was kept when the writing fails, and offers to try again', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'busy' }, { status: 503 })))
    const { user } = await freeLetters()
    await user.click(screen.getByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ }))
    const alert = await screen.findByText(/Päkapikk on praegu väga hõivatud/)
    expect(alert).toHaveTextContent('Loomiskord jäi alles')
    expect(screen.getByRole('button', { name: /Proovi uuesti/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Mia saab 24 jõulukirja' })).toBeInTheDocument()
  })

  it('tells the truth when the request broke on the way but the series was used', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    const fetch = vi.fn(async (url: string) => {
      if (url === '/api/joulupass/kirjad') throw new TypeError('network')
      return Response.json({ pass: { ...PASS, generationsLeft: 9 } })
    })
    vi.stubGlobal('fetch', fetch)
    const { user } = await freeLetters()
    await user.click(screen.getByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ }))
    expect(await screen.findByText(/kulus üks kirjasari, aga kirjad ei jõudnud kohale/)).toHaveTextContent('info@kirjavolu.ee')
    expect(fetch.mock.calls.map((call) => call[0])).toEqual(['/api/joulupass/kirjad', '/api/joulupass/kood'])
  })
})

describe('Christmas letters: after paying', () => {
  it('writes the personal letters into the same creation after Stripe sends the buyer back', async () => {
    const first = await freeLetters()
    const id = first.path.split('/').pop()!
    localStorage.setItem(PENDING, id)
    const fetch = vi.fn(async (url: string) =>
      url.startsWith('/api/joulupass/ost')
        ? Response.json({ status: 'paid', pass: PASS })
        : Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }),
    )
    vi.stubGlobal('fetch', fetch)
    setupAnalytics('site-1')
    const sent: string[] = []
    ;(window as unknown as { umami: unknown }).umami = { track: (name: string) => sent.push(name) }

    const { router, pinia } = await reload(`${first.path}?session_id=cs_test_a1b2c3d4e5f6`, first.pinia)

    expect(await screen.findByRole('heading', { level: 1, name: 'Mia isiklikud kirjad on valmis' }, { timeout: 5000 })).toBeInTheDocument()
    // The code is shown, so it can be used on another device.
    expect(screen.getByRole('region', { name: /Aitäh! Jõulupass on sinu/ })).toHaveTextContent('KV-7KQM-3FXA')
    expect(useCreationsStore(pinia).byId(id)?.items[0]?.body).toBe('Isiklik kiri 1.')
    expect(useCreationsStore(pinia).creations).toHaveLength(1)
    expect(loadPass()?.generationsLeft).toBe(9)
    expect(fetch.mock.calls.map((call) => String(call[0]).split('?')[0])).toEqual(['/api/joulupass/ost', '/api/joulupass/kirjad'])
    expect(localStorage.getItem(PENDING)).toBeNull()
    // The session id leaves the address, so a reload does not ask Stripe again.
    expect(router.currentRoute.value.query).toEqual({})
    expect(sent).toEqual(['purchase', 'premium_generated'])
    delete (window as unknown as { umami?: unknown }).umami
  })

  it('never counts a payment the server has not confirmed', async () => {
    const first = await freeLetters()
    localStorage.setItem(PENDING, first.path.split('/').pop()!)
    const fetch = vi.fn(async () => Response.json({ status: 'expired' }))
    vi.stubGlobal('fetch', fetch)
    await reload(`${first.path}?session_id=cs_test_a1b2c3d4e5f6`, first.pinia)
    expect(await screen.findByText(/Makse jäi pooleli ja raha ei võetud/)).toBeInTheDocument()
    expect(loadPass()).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Mia saab 24 jõulukirja' })).toBeInTheDocument()
  })

  it('keeps a pass that is already paid after a reload, without asking Stripe again', async () => {
    const first = await freeLetters()
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await reload(first.path, first.pinia)
    expect(await screen.findByRole('button', { name: /Kirjuta Miale isiklikud kirjad/ })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('notices a page closed while writing, and checks whether the series was used', async () => {
    const first = await freeLetters()
    const id = first.path.split('/').pop()!
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    localStorage.setItem(WRITING, JSON.stringify({ id, left: 10 }))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ pass: { ...PASS, generationsLeft: 9 } })))
    await reload(first.path, first.pinia)
    expect(await screen.findByText(/Eelmine kirjutamine jäi pooleli/)).toHaveTextContent('info@kirjavolu.ee')
    expect(localStorage.getItem(WRITING)).toBeNull()
  })

  it('finishes a purchase started on the earlier /ud2 address there', async () => {
    const first = await freeLetters()
    const id = first.path.split('/').pop()!
    localStorage.setItem(PENDING, id)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.startsWith('/api/joulupass/ost')
          ? Response.json({ status: 'paid', pass: PASS })
          : Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }),
      ),
    )
    await reload(`/ud2/kirjad/${id}?session_id=cs_test_a1b2c3d4e5f6`, first.pinia)
    expect(await screen.findByRole('heading', { level: 1, name: 'Mia isiklikud kirjad on valmis' }, { timeout: 5000 })).toBeInTheDocument()
  })
})

describe('Christmas letters: the earlier addresses', () => {
  it('starts the same journey at /ud2/alusta', async () => {
    await open('/ud2/alusta')
    expect(await screen.findByRole('heading', { level: 1, name: 'Päkapikk kirjutab sinu lapsele 24 jõulukirja' })).toBeInTheDocument()
  })

  it('leads from the /ud2 home page to /joulukirjad', async () => {
    await open('/ud2')
    expect(await screen.findByText('Varasem testvaade: lühike jõuluteekond.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Loo jõulukirjad/ })).toHaveAttribute('href', '/joulukirjad')
    expect(screen.getByRole('link', { name: /Maagiline kiri/ })).toHaveAttribute('href', '/joulukirjad')
  })
})
