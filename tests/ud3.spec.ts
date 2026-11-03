import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { PASS_KEY } from '@/features/pass/seasonPass'

async function open(path: string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  return { router }
}

afterEach(() => localStorage.removeItem(PASS_KEY))

describe('the home page test version at /ud3', () => {
  it('says what Kirjavõlu is and what to do next', async () => {
    await open('/ud3')
    expect(await screen.findByRole('heading', { level: 1, name: 'Väikesed kirjad. Suured imelised hetked.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Loo esimene üllatus/ })).toHaveAttribute('href', '/uus-disain/loo')
    expect(screen.getByRole('list', { name: 'Kirjavõlu kasutamine' })).toHaveTextContent('Ilma kasutajakontota')
    // The page sells the moment, not the technology (the shared footer is out of scope here).
    expect(document.querySelector('.ud3')!.textContent).not.toMatch(/tehisaru|\bAI\b/)
  })

  it('lists the six kinds right after the hero, each opening the wizard with it chosen', async () => {
    await open('/ud3')
    const types = await screen.findByRole('region', { name: 'Mida soovid luua?' })
    const links = within(types).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/uus-disain/loo?tyyp=letter',
      '/uus-disain/loo?tyyp=treasure-hunt',
      '/uus-disain/loo?tyyp=story',
      '/uus-disain/loo?tyyp=puzzle',
      '/uus-disain/loo?tyyp=calendar',
      '/uus-disain/loo?tyyp=certificate',
    ])
    expect(within(types).getByRole('link', { name: /Salamissioon/ })).toHaveTextContent('Väikestele nuputajatele')
  })

  it('offers the 24 Christmas letters, and shows the pass balance only with a pass', async () => {
    await open('/ud3')
    const season = await screen.findByRole('region', { name: /24 hommikut täis üllatusi/ })
    expect(within(season).getByRole('link', { name: /Loo 24 päkapikukirja/ })).toHaveAttribute(
      'href',
      '/uus-disain/loo?tyyp=letter&puhk=christmas',
    )
    expect(within(season).queryByText(/Jõulupass/)).toBeNull()
  })

  it('shows the pass balance as small secondary information', async () => {
    localStorage.setItem(PASS_KEY, JSON.stringify({ code: 'KV-7KQM-3FXA', generationsLeft: 7, validUntil: '2099-01-31T21:59:59.000Z' }))
    await open('/ud3')
    const season = await screen.findByRole('region', { name: /24 hommikut täis üllatusi/ })
    expect(within(season).getByText('Jõulupass · kirjasarju või lugusid alles 7')).toBeInTheDocument()
  })

  it('"Vaata näidist" moves to three printable samples, with the full sample one click away', async () => {
    await open('/ud3')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Vaata näidist/ }))
    const heading = screen.getByRole('heading', { name: 'Vaata, milline võlu välja näeb' })
    expect(heading).toHaveFocus()
    const examples = screen.getByRole('region', { name: 'Vaata, milline võlu välja näeb' })
    expect(within(examples).getByRole('heading', { name: 'Kallis Jasper!' })).toBeInTheDocument()
    expect(within(examples).getByRole('heading', { name: 'Kuum jälg!' })).toBeInTheDocument()
    expect(within(examples).getByRole('heading', { name: 'Jasper ja kadunud täht' })).toBeInTheDocument()
    expect(within(examples).getByRole('link', { name: /Ava terve näidis/ })).toHaveAttribute('href', '/uus-disain/naide')
  })

  it('tells how the child’s data is kept, and links to the privacy page', async () => {
    await open('/ud3')
    const privacy = await screen.findByRole('region', { name: 'Lapse andmed jäävad sinu brauserisse.' })
    expect(within(privacy).getByRole('link', { name: 'Loe privaatsuse kohta' })).toHaveAttribute('href', '/uus-disain/privaatsus')
    // The menu keeps the visitor on this test page.
    expect(screen.getByRole('link', { name: 'Kirjavõlu avaleht' })).toHaveAttribute('href', '/ud3')
  })
})
