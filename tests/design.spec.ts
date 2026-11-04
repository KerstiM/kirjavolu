import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { useChildrenStore } from '@/features/children/childrenStore'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { makeRequest, MARKUS } from './helpers'

async function open(path: string | ((id: string) => string)) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useChildrenStore().restoreDemo()
  if (typeof path === 'function') {
    const content = await templateGenerator.generate(
      makeRequest('letter', { occasionId: 'christmas', children: [MARKUS], options: { startDate: '2026-12-01' } }),
    )
    useCreationsStore().add(content)
    path = path(content.id)
  }
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  return router
}

describe('the earlier /uus-disain home page, kept for comparison', () => {
  it('still answers, says it is an earlier test view, and leads into the main pages', async () => {
    await open('/uus-disain')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Kiri, mis teab sinu lapse nime.')
    expect(screen.getByText('Varasem testvaade: uus avalehe disain.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ava avaleht' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Alusta loomist' })).toHaveAttribute('href', '/loo')
    expect(screen.getByRole('link', { name: /Maagiline kiri/ })).toHaveAttribute('href', '/loo?tyyp=letter')
    expect(screen.getByRole('link', { name: /Sünnipäev/ })).toHaveAttribute('href', '/loo?puhk=birthday')
  })

  it('has the new home page at /', async () => {
    await open('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Väikesed üllatused. Suured imelised hetked.')
  })
})

describe('the wizard in the new design at /loo', () => {
  it('shows postcards, stamps and address labels', async () => {
    await open('/loo')
    const user = userEvent.setup()
    const types = await screen.findByRole('radiogroup', { name: 'Mida soovid luua?' })
    expect(screen.queryByText(/Testvaade/)).toBeNull()
    expect(document.querySelectorAll('.postcard')).toHaveLength(6)
    await user.click(within(types).getByRole('radio', { name: /Maagiline kiri/ }))
    // The choice stays as one line; "Muuda" opens the list again with it marked.
    expect(document.querySelector('.postcard')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Muuda, mida luua' }))
    expect(screen.getByRole('radio', { name: /Maagiline kiri/ })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('radio', { name: /Maagiline kiri/ }))

    await user.click(screen.getByRole('radio', { name: /Jõulud/ }))
    const kids = await screen.findByRole('group', { name: 'Kellele?' })
    await user.click(within(kids).getByRole('checkbox', { name: /Pääru/ }))
    expect(within(kids).getByRole('checkbox', { name: /Pääru/ })).toHaveAttribute('aria-checked', 'true')
    expect(document.querySelectorAll('.label')).toHaveLength(3)
  })

  it('draws the simpler envelope mascot', async () => {
    await open('/loo')
    await screen.findByRole('radiogroup', { name: 'Mida soovid luua?' })
    // The folds every envelope has: the flap and the two lower seams.
    expect(document.querySelector('.mascot__seam')).not.toBeNull()
    expect(document.querySelector('.mascot__hand')).toBeNull()
  })

  it('shows a type picked on the home page as one line, not the whole list again', async () => {
    await open('/loo?tyyp=certificate')
    expect(await screen.findByRole('button', { name: 'Muuda, mida luua' })).toBeInTheDocument()
    expect(document.querySelector('.picked')).toHaveTextContent('Diplom või õnnitluskaart')
    expect(document.querySelector('.postcard')).toBeNull()
    expect(screen.getByRole('radiogroup', { name: 'Mis puhul?' })).toBeInTheDocument()
  })

  it('offers the letter and the certificate; the other kinds are gray while they are polished', async () => {
    await open('/loo')
    const types = await screen.findByRole('radiogroup', { name: 'Mida soovid luua?' })
    expect(within(types).getAllByRole('radio').map((radio) => radio.textContent)).toEqual([
      expect.stringContaining('Maagiline kiri'),
      expect.stringContaining('Diplom või õnnitluskaart'),
    ])
    expect(document.querySelectorAll('.postcard.is-soon')).toHaveLength(4)
  })

  it('starts without a kind when a link names one that is switched off', async () => {
    await open('/loo?tyyp=story')
    expect(await screen.findByRole('radiogroup', { name: 'Mida soovid luua?' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Muuda, mida luua' })).toBeNull()
  })

  it('still answers at the earlier /uus-disain/loo', async () => {
    await open('/uus-disain/loo')
    expect(await screen.findByRole('radiogroup', { name: 'Mida soovid luua?' })).toBeInTheDocument()
  })
})

describe('what the earlier /uus-disain home page marks', () => {
  it('shows the Santa greeting as coming soon', async () => {
    await open('/uus-disain')
    const types = await screen.findByRole('region', { name: 'Mida meisterdame?' })
    expect(within(types).getByRole('link', { name: /Maagiline kiri/ })).toBeInTheDocument()
    expect(within(types).queryByRole('link', { name: /Aardejaht/ })).toBeNull()
    expect(within(types).getByText('Aardejaht').closest('.postcard')).toHaveTextContent('Töös')
    expect(within(types).getByText('Jõuluvana tervitus').closest('.postcard')).toHaveTextContent('Varsti')
  })

  it('marks only what the Jõulupass adds; free is unmarked', async () => {
    await open('/uus-disain')
    const types = await screen.findByRole('region', { name: 'Mida meisterdame?' })
    expect(within(types).getByText('Personaalne lugu').closest('.postcard')).toHaveTextContent('Jõulupass')
    expect(within(types).getByRole('link', { name: /Maagiline kiri/ })).toHaveTextContent('Jõulupassiga: isiklik versioon lapse ja pere järgi')
    expect(within(types).getByText('Aardejaht').closest('.postcard')).not.toHaveTextContent('Jõulupass')
    expect(within(types).getByText('Aardejaht').closest('.postcard')).not.toHaveTextContent('Tasuta')
    const band = screen.getByRole('region', { name: 'Jõulupass' })
    const table = within(band).getByRole('table', { name: 'Mis on tasuta ja mis Jõulupassiga' })
    expect(within(table).getByRole('row', { name: /Päkapiku muudatused/ })).toHaveTextContent('30')
  })
})

describe('the rest of the journey in the new design', () => {
  it('shows the preview at /looming/… with links to the main pages', async () => {
    await open((id) => `/looming/${id}`)
    expect(await screen.findByRole('link', { name: 'Tagasi avalehele' })).toHaveAttribute('href', '/')
    expect(document.querySelector('.preview--new')).not.toBeNull()
    expect(screen.queryByText(/Testvaade/)).toBeNull()
    expect(screen.getByRole('link', { name: /Lapsed ja tüüp/ }).getAttribute('href')).toMatch(/^\/loo\?muuda=/)
  })

  it('still opens a preview at the earlier /uus-disain/looming/… address', async () => {
    await open((id) => `/uus-disain/looming/${id}`)
    expect(await screen.findByRole('link', { name: 'Tagasi avalehele' })).toHaveAttribute('href', '/')
    expect(document.querySelector('.preview--new')).not.toBeNull()
  })

  it('shows children as address labels at /lapsed', async () => {
    await open('/lapsed')
    await screen.findByRole('heading', { level: 1, name: 'Lapsed' })
    expect(document.querySelectorAll('.child-card--label')).toHaveLength(3)
    const menu = screen.getByRole('navigation', { name: 'Peamenüü' })
    expect(within(menu).getByRole('link', { name: 'Lapsed' })).toHaveAttribute('href', '/lapsed')
    expect(within(menu).getByRole('link', { name: /Loo uus/ })).toHaveAttribute('href', '/loo')
  })

  it('leads from the sample at /naide into the Christmas letters', async () => {
    await open('/naide')
    expect(await screen.findByRole('link', { name: /Loo oma lapsele 24 kirja/ })).toHaveAttribute('href', '/joulukirjad')
    expect(screen.queryByText(/Testvaade/)).toBeNull()
  })
})

describe('AI sample letter on the sample page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks the server for a letter for the chosen child and shows it', async () => {
    const fetch = vi.fn(async () =>
      Response.json({ heading: 'Kallis Kai!', body: 'Tere!\n\nMina olen päkapikk.', signature: 'Sinu päkapikk Tuduja' }),
    )
    vi.stubGlobal('fetch', fetch)
    await open('/naide')
    const user = userEvent.setup()
    const section = await screen.findByRole('region', { name: 'Proovi AI-kirja' })
    await user.click(within(section).getByRole('radio', { name: 'Kai' }))
    await user.click(within(section).getByRole('button', { name: /Kirjuta Kai jaoks kiri/ }))

    expect(await within(section).findByRole('heading', { name: 'Kallis Kai!' })).toBeInTheDocument()
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/proovikiri')
    const sent = JSON.parse(String(init.body))
    expect(Object.keys(sent).sort()).toEqual(['age', 'interests', 'name', 'readingLevel'])
    expect(sent.name).toBe('Kai')
  })

  it('explains when the daily letters have run out', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'daily_limit' }, { status: 503 })))
    await open('/uus-disain/naide')
    const user = userEvent.setup()
    const section = await screen.findByRole('region', { name: 'Proovi AI-kirja' })
    await user.click(within(section).getByRole('button', { name: /Kirjuta .* jaoks kiri/ }))
    expect(await within(section).findByRole('alert')).toHaveTextContent('Tänased proovikirjad said otsa.')
  })

  it('is on the sample page at its main path', async () => {
    await open('/naide')
    expect(await screen.findByRole('region', { name: 'Proovi AI-kirja' })).toBeInTheDocument()
  })
})
