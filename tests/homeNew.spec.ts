import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { useChildrenStore } from '@/features/children/childrenStore'

async function open(path: string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useChildrenStore().restoreDemo()
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
