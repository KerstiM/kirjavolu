import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { useCreationsStore } from '@/features/preview/creationsStore'
import type { RequestFor } from '@/domain/models'
import { JASPER, makeRequest, RUBEN } from './helpers'

async function openPreview(path: (id: string) => string) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const request = makeRequest('letter', {
    occasionId: 'christmas',
    children: [RUBEN, JASPER],
    options: { startDate: '2026-12-01' },
  }) as RequestFor<'letter'>
  const content = await templateGenerator.generate(request)
  useCreationsStore().add(content)
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path(content.id))
  await router.isReady()
  render(App, { global: { plugins: [pinia, router] } })
  await screen.findByRole('heading', { level: 1 })
  return { router, user: userEvent.setup() }
}

describe('envelope for a new creation', () => {
  it('arrives addressed to the children and leaves when skipped', async () => {
    const { router, user } = await openPreview((id) => `/looming/${id}?uus=1`)
    const dialog = screen.getByRole('dialog', { name: 'Sulle on post!' })
    expect(dialog).toHaveTextContent('Ruben ja Jasper')

    await user.click(screen.getByRole('button', { name: 'Jäta vahele' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /post|Valmis/ })).not.toBeInTheDocument())
    // A reload or "back" later does not bring the envelope again.
    expect(router.currentRoute.value.query.uus).toBeUndefined()
  })

  it('is not shown when an earlier creation is opened', async () => {
    await openPreview((id) => `/looming/${id}`)
    expect(screen.queryByRole('dialog', { name: 'Sulle on post!' })).not.toBeInTheDocument()
  })
})
