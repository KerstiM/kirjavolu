import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
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
  it('lives at /uus-disain and leads into the same wizard', async () => {
    await open('/uus-disain')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Kiri, mis teab sinu lapse nime.')
    expect(screen.getByRole('link', { name: 'Vaata praegust avalehte' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Maagiline kiri/ })).toHaveAttribute('href', '/loo?tyyp=letter')
    expect(screen.getByRole('link', { name: /Sünnipäev/ })).toHaveAttribute('href', '/loo?puhk=birthday')
  })

  it('leaves the current home page at /', async () => {
    await open('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Väikesed maagilised hetked sinu lapsele.')
  })
})
