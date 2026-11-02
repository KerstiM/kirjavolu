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
import { makeRequest, RUBEN } from './helpers'

async function open(path: string | ((id: string) => string)) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useChildrenStore().restoreDemo()
  if (typeof path === 'function') {
    const content = await templateGenerator.generate(
      makeRequest('letter', { occasionId: 'christmas', children: [RUBEN], options: { startDate: '2026-12-01' } }),
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

describe('new home page design as a test view', () => {
  it('lives at /uus-disain and leads into the wizard in the new design', async () => {
    await open('/uus-disain')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Kiri, mis teab sinu lapse nime.')
    expect(screen.getByRole('link', { name: 'Vaata praegust avalehte' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Alusta loomist' })).toHaveAttribute('href', '/uus-disain/loo')
    expect(screen.getByRole('link', { name: /Maagiline kiri/ })).toHaveAttribute('href', '/uus-disain/loo?tyyp=letter')
    expect(screen.getByRole('link', { name: /Sünnipäev/ })).toHaveAttribute('href', '/uus-disain/loo?puhk=birthday')
  })

  it('leaves the current home page at /', async () => {
    await open('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Väikesed maagilised hetked sinu lapsele.')
  })
})

describe('wizard in the new design', () => {
  it('shows postcards, stamps and address labels at /uus-disain/loo', async () => {
    await open('/uus-disain/loo')
    const user = userEvent.setup()
    expect(await screen.findByText('Testvaade: loomise sammud uues disainis.')).toBeInTheDocument()
    const types = screen.getByRole('radiogroup', { name: 'Mida soovid luua?' })
    await user.click(within(types).getByRole('radio', { name: /Maagiline kiri/ }))
    expect(within(types).getByRole('radio', { name: /Maagiline kiri/ })).toHaveAttribute('aria-checked', 'true')
    expect(document.querySelectorAll('.postcard')).toHaveLength(6)

    await user.click(screen.getByRole('radio', { name: /Jõulud/ }))
    const kids = await screen.findByRole('group', { name: 'Kellele?' })
    await user.click(within(kids).getByRole('checkbox', { name: /Jasper/ }))
    expect(within(kids).getByRole('checkbox', { name: /Jasper/ })).toHaveAttribute('aria-checked', 'true')
    expect(document.querySelectorAll('.label')).toHaveLength(3)
  })

  it('keeps the plain choice cards at /loo', async () => {
    await open('/loo')
    expect(await screen.findByRole('radiogroup', { name: 'Mida soovid luua?' })).toBeInTheDocument()
    expect(document.querySelector('.postcard')).toBeNull()
    expect(screen.queryByText(/Testvaade/)).toBeNull()
  })
})

describe('the rest of the journey in the new design', () => {
  it('shows the preview at /uus-disain/looming/… with links that stay in the new design', async () => {
    await open((id) => `/uus-disain/looming/${id}`)
    expect(await screen.findByText('Testvaade: eelvaade uues disainis.')).toBeInTheDocument()
    expect(document.querySelector('.preview--new')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Tagasi avalehele' })).toHaveAttribute('href', '/uus-disain')
    expect(screen.getByRole('link', { name: /Lapsed ja tüüp/ }).getAttribute('href')).toMatch(/^\/uus-disain\/loo\?muuda=/)
    expect(screen.getByRole('link', { name: 'Vaata praegust' }).getAttribute('href')).toMatch(/^\/looming\//)
  })

  it('shows children as address labels at /uus-disain/lapsed', async () => {
    await open('/uus-disain/lapsed')
    expect(await screen.findByText('Testvaade: lapsed uues disainis.')).toBeInTheDocument()
    expect(document.querySelectorAll('.child-card--label')).toHaveLength(3)
    const menu = screen.getByRole('navigation', { name: 'Peamenüü' })
    expect(within(menu).getByRole('link', { name: 'Lapsed' })).toHaveAttribute('href', '/uus-disain/lapsed')
    expect(within(menu).getByRole('link', { name: /Loo uus/ })).toHaveAttribute('href', '/uus-disain/loo')
  })

  it('leads from the sample at /uus-disain/naide into the new-design wizard', async () => {
    await open('/uus-disain/naide')
    expect(await screen.findByText('Testvaade: näide uues disainis.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Loo oma lapsele 24 kirja/ })).toHaveAttribute(
      'href',
      '/uus-disain/loo?puhk=christmas&tyyp=letter',
    )
  })

  it('keeps the current pages and menu as they are', async () => {
    await open('/lapsed')
    await screen.findByRole('heading', { level: 1, name: 'Lapsed' })
    expect(document.querySelector('.child-card--label')).toBeNull()
    expect(screen.queryByText(/Testvaade/)).toBeNull()
    const menu = screen.getByRole('navigation', { name: 'Peamenüü' })
    expect(within(menu).getByRole('link', { name: /Loo uus/ })).toHaveAttribute('href', '/loo')
  })
})

describe('AI sample letter on the new-design sample page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks the server for a letter for the chosen child and shows it', async () => {
    const fetch = vi.fn(async () =>
      Response.json({ heading: 'Kallis Brita!', body: 'Tere!\n\nMina olen päkapikk.', signature: 'Sinu päkapikk Tuduja' }),
    )
    vi.stubGlobal('fetch', fetch)
    await open('/uus-disain/naide')
    const user = userEvent.setup()
    const section = await screen.findByRole('region', { name: 'Proovi AI-kirja' })
    await user.click(within(section).getByRole('radio', { name: 'Brita' }))
    await user.click(within(section).getByRole('button', { name: /Kirjuta Brita jaoks kiri/ }))

    expect(await within(section).findByRole('heading', { name: 'Kallis Brita!' })).toBeInTheDocument()
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/proovikiri')
    const sent = JSON.parse(String(init.body))
    expect(Object.keys(sent).sort()).toEqual(['age', 'interests', 'name', 'readingLevel'])
    expect(sent.name).toBe('Brita')
  })

  it('explains when the daily letters have run out', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'daily_limit' }, { status: 503 })))
    await open('/uus-disain/naide')
    const user = userEvent.setup()
    const section = await screen.findByRole('region', { name: 'Proovi AI-kirja' })
    await user.click(within(section).getByRole('button', { name: /Kirjuta .* jaoks kiri/ }))
    expect(await within(section).findByRole('alert')).toHaveTextContent('Tänased proovikirjad said otsa.')
  })

  it('is not on the current sample page', async () => {
    await open('/naide')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByRole('region', { name: 'Proovi AI-kirja' })).toBeNull()
  })
})
