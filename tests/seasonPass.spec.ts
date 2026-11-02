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
    await user.click(await screen.findByRole('button', { name: /Loo Rubeni jaoks AI-kirjad/ }))

    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/uus-disain\/looming\//))
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/kirjad')
    const body = JSON.parse(String(init.body))
    expect(body.code).toBe('KV-7KQM-3FXA')
    expect(Object.keys(body.child).sort()).toEqual(['age', 'interests', 'name', 'readingLevel'])
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

  it('says when the pass has run out on the server', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify(PASS))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'used_up' }, { status: 409 })))
    await open('/uus-disain/joulupass')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Loo Rubeni jaoks AI-kirjad/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI-loomised on otsas')
  })
})
