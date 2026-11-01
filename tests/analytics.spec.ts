import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { resetAnalytics, setupAnalytics, track } from '@/app/analytics'

type Win = { umami?: { track: (name: string, data?: Record<string, unknown>) => void } }

function fakeUmami() {
  const sent: [string, Record<string, unknown> | undefined][] = []
  ;(window as unknown as Win).umami = { track: (name, data) => sent.push([name, data]) }
  return sent
}

afterEach(() => {
  resetAnalytics()
  delete (window as unknown as Win).umami
  document.head.querySelectorAll('script[data-website-id]').forEach((script) => script.remove())
})

describe('analytics', () => {
  it('loads nothing and sends nothing without a website id', () => {
    const sent = fakeUmami()
    setupAnalytics(undefined)
    track('child_added', { from: 'wizard' })
    expect(document.head.querySelector('script[data-website-id]')).toBeNull()
    expect(sent).toEqual([])
  })

  it('loads the cookieless script once, limited to the published host', () => {
    setupAnalytics('site-1', 'kerstim.github.io')
    setupAnalytics('site-1', 'kerstim.github.io')
    const scripts = document.head.querySelectorAll<HTMLScriptElement>('script[data-website-id]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.src).toBe('https://cloud.umami.is/script.js')
    expect(scripts[0]?.dataset).toMatchObject({ websiteId: 'site-1', domains: 'kerstim.github.io', doNotTrack: 'true' })
  })

  it('keeps events until the script has loaded', () => {
    setupAnalytics('site-1')
    track('sample_shown', {})
    track('child_added', { from: 'profiles' })
    const sent = fakeUmami()
    expect(sent).toEqual([])
    document.head.querySelector('script[data-website-id]')?.dispatchEvent(new Event('load'))
    expect(sent).toEqual([
      ['sample_shown', {}],
      ['child_added', { from: 'profiles' }],
    ])
  })

  it('counts the way from a home page card to printing without any child data', async () => {
    setupAnalytics('site-1')
    const sent = fakeUmami()
    vi.spyOn(window, 'print').mockImplementation(() => undefined)
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push('/')
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    const user = userEvent.setup()

    await user.click(await screen.findByRole('link', { name: '24 päkapikukirja' }))
    await user.click(await screen.findByRole('button', { name: /Lisa laps/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Lisa laps' })
    await user.type(within(dialog).getByLabelText('Nimi'), 'Salme')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Dinosaurused' }))
    await user.click(within(dialog).getByRole('button', { name: 'Lisa laps' }))
    await user.click(screen.getByRole('button', { name: /Loo ja vaata eelvaadet/ }))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('preview'))
    await user.click(await screen.findByRole('button', { name: /Prindi/ }))

    expect(sent).toEqual([
      ['wizard_start', { type: 'letter', occasion: 'christmas' }],
      ['child_added', { from: 'wizard' }],
      ['preview_shown', { type: 'letter', occasion: 'christmas', items: 24, children: 1 }],
      ['print_clicked', { type: 'letter', layout: 'poster', mode: 'all' }],
    ])
    // The child's name, age and interests never leave the browser.
    expect(JSON.stringify(sent)).not.toMatch(/Salme|dinosaurs|"age"/)
  })
})
