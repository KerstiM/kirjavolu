import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { useChildrenStore } from '@/features/children/childrenStore'
import { loadPass, PASS_KEY } from '@/features/pass/seasonPass'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { DEFAULT_GENERAL, defaultOptions } from '@/domain/defaults'

const PASS = { code: 'KV-7KQM-3FXA', generationsLeft: 10, validUntil: '2027-01-31T21:59:59.000Z' }

async function open(path: string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useChildrenStore().restoreDemo()
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  return { router, pinia }
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.removeItem(PASS_KEY)
})

describe('buying the Jõulupass on the new-design sample page', () => {
  it('offers the pass with its price next to the AI sample letter', async () => {
    await open('/uus-disain/naide')
    const section = await screen.findByRole('region', { name: 'Jõulupass' })
    expect(within(section).getByRole('button', { name: /Osta Jõulupass – 9,90 €/ })).toBeInTheDocument()
    expect(within(section).getByText(/10 AI-genereerimist, mis kehtivad kuni 31\. jaanuarini/)).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Mul on juba Jõulupass' })).toHaveAttribute('href', '/uus-disain/joulupass')
  })

  it('explains when the payment form cannot be opened', async () => {
    const fetch = vi.fn(async () => Response.json({ error: 'too_many' }, { status: 429 }))
    vi.stubGlobal('fetch', fetch)
    await open('/uus-disain/naide')
    const user = userEvent.setup()
    const section = await screen.findByRole('region', { name: 'Jõulupass' })
    await user.click(within(section).getByRole('button', { name: /Osta Jõulupass/ }))
    expect(await within(section).findByRole('alert')).toHaveTextContent('Liiga palju katseid')
    expect(fetch).toHaveBeenCalledWith('/api/joulupass/ost', { method: 'POST' })
  })

  it('is not on the current sample page', async () => {
    await open('/naide')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByRole('region', { name: 'Jõulupass' })).toBeNull()
  })
})

describe('the Jõulupass page', () => {
  it('shows the code after Stripe sends the buyer back, and remembers it', async () => {
    const fetch = vi.fn(async () => Response.json({ status: 'paid', pass: PASS }))
    vi.stubGlobal('fetch', fetch)
    const { router } = await open('/uus-disain/joulupass?session_id=cs_test_a1b2c3d4e5f6')
    expect(await screen.findByRole('heading', { name: /Aitäh! Sinu Jõulupass on valmis/ })).toBeInTheDocument()
    expect(screen.getByTestId('pass-code')).toHaveTextContent('KV-7KQM-3FXA')
    expect(screen.getByText(/AI-genereerimisi alles/)).toHaveTextContent('AI-genereerimisi alles: 10. Kehtib kuni 31. jaanuar 2027.')
    expect(fetch).toHaveBeenCalledWith('/api/joulupass/ost?session_id=cs_test_a1b2c3d4e5f6', undefined)
    expect(loadPass()).toEqual(PASS)
    await vi.waitFor(() => expect(router.currentRoute.value.query).toEqual({}))
  })

  it('says when the payment was left unfinished', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'open' })))
    await open('/uus-disain/joulupass?session_id=cs_test_a1b2c3d4e5f6')
    expect(await screen.findByRole('alert')).toHaveTextContent('Makse jäi pooleli ja raha ei võetud.')
    expect(loadPass()).toBeNull()
  })

  it('checks a code typed in on another device', async () => {
    const fetch = vi.fn(async () => Response.json({ pass: { ...PASS, generationsLeft: 7 } }))
    vi.stubGlobal('fetch', fetch)
    await open('/uus-disain/joulupass')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Jõulupassi kood'), 'kv-7kqm-3fxa')
    await user.click(screen.getByRole('button', { name: 'Kontrolli koodi' }))

    expect(await screen.findByTestId('pass-code')).toHaveTextContent('KV-7KQM-3FXA')
    expect(screen.getByText(/AI-genereerimisi alles/)).toHaveTextContent('alles: 7.')
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/kood')
    expect(JSON.parse(String(init.body))).toEqual({ code: 'kv-7kqm-3fxa' })
    expect(loadPass()?.generationsLeft).toBe(7)
  })

  it('says when a code is not known', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'not_found' }, { status: 404 })))
    await open('/uus-disain/joulupass')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Jõulupassi kood'), 'KV-AAAA-BBBB')
    await user.click(screen.getByRole('button', { name: 'Kontrolli koodi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Sellist koodi ei leitud.')
  })

  it('shows the pass this browser already has', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    await open('/uus-disain/joulupass')
    expect(await screen.findByTestId('pass-code')).toHaveTextContent('KV-7KQM-3FXA')
    expect(screen.getByRole('heading', { name: /Sinu Jõulupass/ })).toBeInTheDocument()
  })
})

describe('AI letters with the Jõulupass', () => {
  const LETTERS = Array.from({ length: 24 }, (_, i) => ({ heading: 'Kallis Ruben!', body: `Kiri ${i + 1}.`, signature: 'Sinu päkapikk Tuduja' }))

  it('shows the next step once a valid pass is in this browser', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    await open('/uus-disain/joulupass')
    const section = await screen.findByRole('region', { name: /Järgmine samm: AI-kirjad/ })
    expect(within(section).getByRole('button', { name: /Loo Rubeni jaoks AI-kirjad/ })).toBeInTheDocument()
  })

  it('is not offered for a pass that is used up', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify({ ...PASS, generationsLeft: 0 }))
    await open('/uus-disain/joulupass')
    await screen.findByTestId('pass-code')
    expect(screen.queryByRole('region', { name: /AI-kirjad/ })).toBeNull()
  })

  it('writes the series, counts the generation down and opens the letters', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    const fetch = vi.fn(async () => Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }))
    vi.stubGlobal('fetch', fetch)
    const { router, pinia } = await open('/uus-disain/joulupass')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Selle detsembri plaanid'), '12.12 läheme vanaema juurde')
    const family = screen.getByLabelText('Pere ja lemmikloomad')
    await user.clear(family)
    await user.type(family, 'ema, kass Miisu')
    await user.click(screen.getByRole('button', { name: /Loo Rubeni jaoks AI-kirjad/ }))

    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/uus-disain\/looming\//))
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/kirjad')
    const body = JSON.parse(String(init.body))
    expect(body.code).toBe('KV-7KQM-3FXA')
    expect(body.child).toMatchObject({ name: 'Ruben', family: ['ema', 'kass Miisu'], december: '12.12 läheme vanaema juurde' })
    expect(body.child).not.toHaveProperty('parentNotes')
    // What was typed stays in the profile, so it is not asked again.
    expect(useChildrenStore(pinia).children.find((c) => c.name === 'Ruben')?.family).toEqual(['ema', 'kass Miisu'])
    expect(loadPass()?.generationsLeft).toBe(9)

    const creation = useCreationsStore(pinia).creations[0]
    expect(creation?.generator.id).toBe('ai-joulupass')
    expect(creation?.items).toHaveLength(24)
    expect(creation?.items[0]?.label).toMatch(/^1\. detsember \d{4}$/)
    expect(creation?.items[23]?.date).toMatch(/-12-24$/)
    // The preview keeps the AI's words: they can be edited, but the template engine does not replace them.
    expect((await screen.findAllByRole('button', { name: /^Muuda: / })).length).toBe(24)
    expect(screen.queryAllByRole('button', { name: /^Uus variant/ })).toHaveLength(0)
    expect(screen.getByText(/kirjutas päkapikk Tuduja tehisaru abil/)).toBeInTheDocument()
  })

  it('rewrites one letter with the AI as the parent asks, using a fix', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify({ ...PASS, fixesLeft: 30 }))
    const fetch = vi.fn(async (url: string) =>
      url === '/api/joulupass/kirjad'
        ? Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9, fixesLeft: 30 } })
        : Response.json({ letter: { heading: 'Kallis Ruben!', body: 'Lühem kiri.', signature: 'Tuduja' }, pass: { ...PASS, generationsLeft: 9, fixesLeft: 29 } }),
    )
    vi.stubGlobal('fetch', fetch)
    const { pinia } = await open('/uus-disain/joulupass')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Loo Rubeni jaoks AI-kirjad/ }))
    const edits = await screen.findAllByRole('button', { name: /^Muuda: / })
    await user.click(edits[5]!)

    const dialog = await screen.findByRole('dialog', { name: /^Muuda: 6\. detsember/ })
    expect(within(dialog).getByText('AI-parandusi alles: 30.')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Mida AI peaks muutma?'), 'tee lühemaks')
    await user.click(within(dialog).getByRole('button', { name: 'Paranda AI-ga' }))
    await vi.waitFor(() => expect(within(dialog).getByLabelText('Tekst')).toHaveValue('Lühem kiri.'))

    const [url, init] = fetch.mock.calls[1] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/parandus')
    expect(JSON.parse(String(init.body))).toMatchObject({ code: PASS.code, day: 6, wish: 'tee lühemaks', before: 'Kiri 5.', after: 'Kiri 7.' })
    expect(loadPass()?.fixesLeft).toBe(29)

    // Nothing changes until the parent saves it.
    expect(useCreationsStore(pinia).creations[0]?.items[5]?.body).toBe('Kiri 6.')
    await user.click(within(dialog).getByRole('button', { name: 'Salvesta' }))
    expect(useCreationsStore(pinia).creations[0]?.items[5]).toMatchObject({ body: 'Lühem kiri.', edited: true })
  })

  it('says when the pass has run out on the server', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'used_up' }, { status: 409 })))
    await open('/uus-disain/joulupass')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Loo Rubeni jaoks AI-kirjad/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI-loomised on otsas')
  })
})

describe('AI story with the Jõulupass', () => {
  async function storyPreview() {
    const pinia = createPinia()
    setActivePinia(pinia)
    const children = useChildrenStore()
    children.restoreDemo()
    const ruben = children.children.find((child) => child.name === 'Ruben')!
    const content = await templateGenerator.generate({
      contentType: 'story',
      children: [ruben],
      occasionId: 'christmas',
      general: { ...DEFAULT_GENERAL, length: 'short' },
      seed: 1,
      options: defaultOptions('christmas').story,
    })
    useCreationsStore(pinia).add(content)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push(`/uus-disain/looming/${content.id}`)
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    return { pinia, id: content.id }
  }

  it('writes the story again with the AI from the same choices, using a generation', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify({ ...PASS, fixesLeft: 30 }))
    const fetch = vi.fn(async () =>
      Response.json({ story: { title: 'Ruben ja lumehelbe saladus', pages: ['Üks.', 'Kaks.', 'Kolm.'] }, pass: { ...PASS, generationsLeft: 9, fixesLeft: 30 } }),
    )
    vi.stubGlobal('fetch', fetch)
    const { pinia, id } = await storyPreview()
    const user = userEvent.setup()
    const card = await screen.findByRole('region', { name: /Kirjuta lugu AI-ga/ })
    expect(within(card).getByText(/alles on 10/)).toBeInTheDocument()
    await user.click(within(card).getByRole('button', { name: 'Kirjuta lugu AI-ga' }))

    await vi.waitFor(() => expect(useCreationsStore(pinia).byId(id)?.generator.id).toBe('ai-joulupass'))
    const creation = useCreationsStore(pinia).byId(id)!
    expect(creation.title).toBe('Ruben ja lumehelbe saladus')
    expect(creation.items.map((item) => item.body)).toEqual(['Üks.', 'Kaks.', 'Kolm.'])
    expect(creation.request.contentType).toBe('story')
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/lugu')
    const body = JSON.parse(String(init.body))
    expect(body.story).toMatchObject({ genre: defaultOptions('christmas').story.genre, length: 'short', occasion: 'Jõulud' })
    expect(body.children[0]).toMatchObject({ name: 'Ruben' })
    expect(body.children[0]).not.toHaveProperty('parentNotes')
    expect(loadPass()?.generationsLeft).toBe(9)
    expect(await screen.findByText(/Selle loo kirjutas tehisaru/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /Kirjuta lugu AI-ga/ })).toBeNull()
  })

  it('tells what the pass gives when there is none', async () => {
    await storyPreview()
    const card = await screen.findByRole('region', { name: /Kirjuta lugu AI-ga/ })
    expect(within(card).getByRole('link', { name: 'Jõulupass' })).toHaveAttribute('href', '/uus-disain/joulupass')
    expect(within(card).queryByRole('button')).toBeNull()
  })
})
