import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { useChildrenStore } from '@/features/children/childrenStore'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { loadPass, PASS_KEY } from '@/features/pass/seasonPass'

const PASS = { code: 'KV-7KQM-3FXA', generationsLeft: 10, fixesLeft: 30, validUntil: '2027-01-31T21:59:59.000Z' }
const LETTERS = Array.from({ length: 24 }, (_, i) => ({ heading: 'Kallis Mia!', body: `Isiklik kiri ${i + 1}.`, signature: 'Tuduja' }))

async function open(path: string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  return { router, pinia }
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.removeItem(PASS_KEY)
  localStorage.removeItem('kirjavolu.ud2.pending')
})

describe('the short Christmas journey at /ud2', () => {
  it('asks only who it is for and shows the 24 free letters at once', async () => {
    const { router, pinia } = await open('/ud2')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Lapse nimi'), 'Mia')
    await user.type(screen.getByLabelText('Vanus'), '5')
    await user.click(screen.getByRole('button', { name: /Vaata kirju/ }))

    await vi.waitFor(() => expect(router.currentRoute.value.path).toMatch(/^\/ud2\/kirjad\//), { timeout: 5000 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Mia 24 jõulukirja on valmis' })).toBeInTheDocument()
    expect(useCreationsStore(pinia).creations[0]?.items).toHaveLength(24)
    expect(useChildrenStore(pinia).children[0]).toMatchObject({ name: 'Mia', age: 5 })
    // Personal is offered right here; without a pass, with the price and the consent.
    const card = screen.getByRole('region', { name: /Tee need Mia kohta/ })
    expect(within(card).getByRole('button', { name: /Osta Jõulupass 9,90 € ja kirjuta/ })).toBeInTheDocument()
    expect(within(card).getByRole('checkbox', { name: /hakkaks kohe kehtima/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Prindi/ }).getAttribute('href')).toMatch(/^\/uus-disain\/looming\//)
  })

  it('needs a name before making the letters', async () => {
    await open('/ud2')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Vaata kirju/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kirjuta lapse nimi.')
  })

  it('opens the checkout with this page as the way back', async () => {
    const fetch = vi.fn(async () => Response.json({ error: 'too_many' }, { status: 429 }))
    vi.stubGlobal('fetch', fetch)
    const { router } = await open('/ud2')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Lapse nimi'), 'Mia')
    await user.type(screen.getByLabelText('Vanus'), '5')
    await user.click(screen.getByRole('button', { name: /Vaata kirju/ }))
    const card = await screen.findByRole('region', { name: /Tee need Mia kohta/ }, { timeout: 5000 })

    await user.click(within(card).getByRole('checkbox', { name: /hakkaks kohe kehtima/ }))
    await user.click(within(card).getByRole('button', { name: /Osta Jõulupass/ }))
    expect(await within(card).findByRole('alert')).toHaveTextContent('Liiga palju katseid')
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/joulupass/ost')
    expect(JSON.parse(String(init.body))).toEqual({ returnTo: router.currentRoute.value.path })
  })

  it('writes the personal letters into the same creation after Stripe sends the buyer back', async () => {
    const fetch = vi.fn(async (url: string) =>
      url.startsWith('/api/joulupass/ost')
        ? Response.json({ status: 'paid', pass: PASS })
        : Response.json({ letters: LETTERS, pass: { ...PASS, generationsLeft: 9 } }),
    )
    const first = await open('/ud2')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Lapse nimi'), 'Mia')
    await user.type(screen.getByLabelText('Vanus'), '5')
    await user.click(screen.getByRole('button', { name: /Vaata kirju/ }))
    await vi.waitFor(() => expect(first.router.currentRoute.value.path).toMatch(/^\/ud2\/kirjad\//), { timeout: 5000 })
    const lettersPath = first.router.currentRoute.value.path
    const id = lettersPath.split('/').pop()!
    localStorage.setItem('kirjavolu.ud2.pending', id)
    const creation = useCreationsStore(first.pinia).byId(id)!
    const child = useChildrenStore(first.pinia).children[0]!

    // The return from Stripe: a fresh page load with the session in the address.
    document.body.innerHTML = ''
    vi.stubGlobal('fetch', fetch)
    const pinia = createPinia()
    setActivePinia(pinia)
    useCreationsStore(pinia).add(creation)
    useChildrenStore(pinia).children.push(child)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push(`${lettersPath}?session_id=cs_test_a1b2c3d4e5f6`)
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })

    expect(await screen.findByRole('heading', { level: 1, name: 'Mia isiklikud kirjad on valmis' }, { timeout: 5000 })).toBeInTheDocument()
    expect(useCreationsStore(pinia).byId(id)?.items[0]?.body).toBe('Isiklik kiri 1.')
    expect(useCreationsStore(pinia).creations).toHaveLength(1)
    expect(loadPass()?.generationsLeft).toBe(9)
    expect(fetch.mock.calls.map((call) => String(call[0]).split('?')[0])).toEqual(['/api/joulupass/ost', '/api/joulupass/kirjad'])
    expect(localStorage.getItem('kirjavolu.ud2.pending')).toBeNull()
  })
})
