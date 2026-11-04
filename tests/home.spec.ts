import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { PASS_KEY } from '@/features/pass/seasonPass'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { currentPromo } from '@/features/home/seasonal'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { makeRequest, MARKUS } from './helpers'

async function open(path: string, before?: () => Promise<void>) {
  const pinia = createPinia()
  setActivePinia(pinia)
  await before?.()
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  return { router }
}

const inSeason = () => vi.setSystemTime(new Date(2026, 10, 15, 12))
const offSeason = () => vi.setSystemTime(new Date(2026, 4, 15, 12))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  inSeason()
})
afterEach(() => {
  vi.useRealTimers()
  localStorage.removeItem(PASS_KEY)
})

describe('the home page', () => {
  it('says what Kirjavõlu is and what to do next', async () => {
    await open('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Väikesed üllatused. Suured imelised hetked.' })).toBeInTheDocument()
    expect(screen.getByText('KIRJAD · LOOD · SEIKLUSED')).toBeInTheDocument()
    expect(screen.getByText(/Kohanda ja prindi kodus\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Loo esimene üllatus/ })).toHaveAttribute('href', '/loo')
    expect(screen.getByRole('list', { name: 'Kirjavõlu kasutamine' })).toHaveTextContent('Ilma kasutajakontota')
    expect(screen.queryByText(/Testvaade/)).toBeNull()
    // The page sells the moment, not the technology (the shared footer is out of scope here).
    expect(document.querySelector('.home')!.textContent).not.toMatch(/tehisaru|\bAI\b/)
  })

  it('lists the six kinds right after the hero; only the letter and the certificate open the wizard for now', async () => {
    await open('/')
    const types = await screen.findByRole('region', { name: 'Mida soovid luua?' })
    const links = within(types).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/loo?tyyp=letter',
      '/loo?tyyp=certificate',
    ])
    expect(within(types).getByText('Salamissioon').closest('.postcard')).toHaveTextContent('Töös')
    expect(within(types).getByRole('link', { name: /Diplom ja õnnitluskaart/ })).toBeInTheDocument()
  })

  it('offers the Christmas letters in season, leading to /joulukirjad', async () => {
    await open('/')
    const season = await screen.findByRole('region', { name: /24 hommikut täis üllatusi/ })
    expect(within(season).getByText(/Loo oma lapsele terve detsembrikuu päkapikukirjad korraga/)).toBeInTheDocument()
    expect(within(season).getByRole('link', { name: /Loo jõulukirjad/ })).toHaveAttribute('href', '/joulukirjad')
    expect(within(season).queryByText(/Jõulupass/)).toBeNull()
    const menu = screen.getByRole('navigation', { name: 'Peamenüü' })
    expect(within(menu).getByRole('link', { name: 'Jõulukirjad' })).toHaveAttribute('href', '/joulukirjad')
  })

  it('has no seasonal block or menu link out of season', async () => {
    offSeason()
    await open('/')
    await screen.findByRole('region', { name: 'Mida soovid luua?' })
    expect(screen.queryByRole('region', { name: /24 hommikut/ })).toBeNull()
    expect(within(screen.getByRole('navigation', { name: 'Peamenüü' })).queryByRole('link', { name: 'Jõulukirjad' })).toBeNull()
  })

  it('shows the pass balance as small secondary information', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify({ code: 'KV-7KQM-3FXA', generationsLeft: 7, validUntil: '2099-01-31T21:59:59.000Z' }))
    await open('/')
    const season = await screen.findByRole('region', { name: /24 hommikut täis üllatusi/ })
    expect(within(season).getByText('Jõulupass · kirjasarju või lugusid alles 7')).toBeInTheDocument()
  })

  it('"Vaata näidist" moves to three printable samples, with the full sample one click away', async () => {
    await open('/')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Vaata näidist/ }))
    const heading = screen.getByRole('heading', { name: 'Vaata, milline võlu välja näeb' })
    expect(heading).toHaveFocus()
    const examples = screen.getByRole('region', { name: 'Vaata, milline võlu välja näeb' })
    expect(within(examples).getByRole('heading', { name: 'Kallis Pääru!' })).toBeInTheDocument()
    expect(within(examples).getByRole('heading', { name: 'Kuum jälg!' })).toBeInTheDocument()
    expect(within(examples).getByRole('heading', { name: 'Pääru ja kadunud täht' })).toBeInTheDocument()
    expect(within(examples).getByRole('link', { name: /Ava terve näidis/ })).toHaveAttribute('href', '/naide')
  })

  it('shows the three steps compactly', async () => {
    await open('/')
    const steps = await screen.findByRole('region', { name: 'Kolm sammu väikese võluhetkeni' })
    expect(within(steps).getAllByRole('listitem').map((item) => item.querySelector('strong')?.textContent)).toEqual([
      'Lisa laps',
      'Vali seiklus',
      'Kohanda ja prindi',
    ])
  })

  it('lists a returning family’s own creations, and nothing of the kind for a new one', async () => {
    await open('/')
    await screen.findByRole('region', { name: 'Mida soovid luua?' })
    expect(screen.queryByRole('region', { name: 'Minu loomingud' })).toBeNull()

    document.body.innerHTML = ''
    await open('/', async () => {
      useCreationsStore().add(await templateGenerator.generate(makeRequest('treasure-hunt', { children: [MARKUS] })))
    })
    const mine = await screen.findByRole('region', { name: 'Minu loomingud' })
    expect(within(mine).getByRole('link').getAttribute('href')).toMatch(/^\/looming\//)
  })

  it('tells how the child’s data is kept, and links to the privacy page', async () => {
    await open('/')
    const privacy = await screen.findByRole('region', { name: 'Lapse andmed jäävad sinu brauserisse.' })
    expect(within(privacy).getByRole('link', { name: 'Loe privaatsuse kohta' })).toHaveAttribute('href', '/privaatsus')
  })

  it('is also what the earlier /ud3 address shows', async () => {
    await open('/ud3')
    expect(await screen.findByRole('heading', { level: 1, name: 'Väikesed üllatused. Suured imelised hetked.' })).toBeInTheDocument()
  })
})

describe('the seasonal block', () => {
  it('runs from 1 November to 23 December', () => {
    expect(currentPromo(new Date(2026, 9, 31))).toBeNull()
    expect(currentPromo(new Date(2026, 10, 1))?.id).toBe('christmas')
    expect(currentPromo(new Date(2026, 11, 23))?.id).toBe('christmas')
    expect(currentPromo(new Date(2026, 11, 24))).toBeNull()
  })

  it('can run over New Year for a later season', () => {
    const promo = { ...currentPromo(new Date(2026, 10, 1))!, from: [12, 27] as [number, number], until: [1, 6] as [number, number] }
    expect(currentPromo(new Date(2026, 11, 30), [promo])).not.toBeNull()
    expect(currentPromo(new Date(2027, 0, 5), [promo])).not.toBeNull()
    expect(currentPromo(new Date(2027, 0, 7), [promo])).toBeNull()
  })
})
