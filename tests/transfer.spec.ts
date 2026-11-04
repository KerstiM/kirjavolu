import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { imageIds, newFromTransfer, pathOnNewAddress, readMoved, markMoved, TRANSFER_VERSION } from '@/app/transfer'
import { useChildrenStore } from '@/features/children/childrenStore'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { DEMO_CHILDREN } from '@/data/demo/children'
import { templateGenerator } from '@/domain/generators/templateGenerator'
import { sampleRequest } from '@/data/demo/sample'
import { EMPTY_DECORATION } from '@/domain/models'

const OLD = 'https://kerstim.github.io'

async function creation(id: string) {
  const content = await templateGenerator.generate(sampleRequest(2026))
  return { ...content, id }
}

afterEach(() => {
  vi.unstubAllEnvs()
  Object.defineProperty(window, 'opener', { value: null, configurable: true })
})

describe('moving to the new address', () => {
  it('brings only children and creations that are not here yet', async () => {
    const [markus, paaru] = DEMO_CHILDREN
    const kept = await creation('c1')
    const incoming = {
      schemaVersion: 1,
      children: [markus, paaru, { nonsense: true }],
      creations: [kept, await creation('c2'), { id: 'broken' }],
      demoSeeded: true,
    }
    const fresh = newFromTransfer({ children: [markus!], creations: [kept] }, incoming)
    expect(fresh.children.map((child) => child.name)).toEqual(['Pääru'])
    expect(fresh.creations.map((c) => c.id)).toEqual(['c2'])
    // Anything that is not saved data brings nothing.
    expect(newFromTransfer({ children: [], creations: [] }, 'garbage')).toEqual({ children: [], creations: [] })
    expect(newFromTransfer({ children: [], creations: [] }, { schemaVersion: 99, children: [markus] }).children).toEqual([])
  })

  it('finds every picture a creation uses', async () => {
    const one = await creation('c1')
    one.decoration = {
      ...EMPTY_DECORATION,
      image: { id: 'shared', width: 10, height: 10 },
      childDecorations: { a: { background: 'image', image: { id: 'own', width: 1, height: 1 } }, b: { background: 'shared', image: null } },
    }
    const two = { ...(await creation('c2')), decoration: { ...EMPTY_DECORATION, image: { id: 'shared', width: 1, height: 1 } } }
    expect(imageIds([one, two, await creation('c3')])).toEqual(['shared', 'own'])
  })

  it('keeps the page path without the old /kirjavolu/ prefix', () => {
    expect(pathOnNewAddress({ pathname: '/kirjavolu/looming/abc', search: '?x=1', hash: '' }, '/kirjavolu/')).toBe('/looming/abc?x=1')
    expect(pathOnNewAddress({ pathname: '/kirjavolu/', search: '', hash: '' }, '/kirjavolu/')).toBe('/')
    expect(pathOnNewAddress({ pathname: '/kirjavolu', search: '', hash: '' }, '/kirjavolu/')).toBe('/')
    expect(pathOnNewAddress({ pathname: '/loo', search: '?puhk=christmas', hash: '' }, '/')).toBe('/loo?puhk=christmas')
  })

  it('remembers that the data was carried over', () => {
    expect(readMoved()).toBe(false)
    markMoved()
    expect(readMoved()).toBe(true)
  })

  it('receives the data on /kolin only from the old address', async () => {
    vi.stubEnv('VITE_TRANSFER_FROM', OLD)
    const opener = { postMessage: vi.fn() }
    Object.defineProperty(window, 'opener', { value: opener, configurable: true })
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push('/kolin')
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })

    await vi.waitFor(() => expect(opener.postMessage).toHaveBeenCalledWith({ type: 'kirjavolu-ready' }, OLD))
    const data = {
      type: 'kirjavolu-data',
      version: TRANSFER_VERSION,
      state: { schemaVersion: 1, children: DEMO_CHILDREN.slice(0, 2), creations: [await creation('c9')], demoSeeded: true },
      images: [],
    }
    // A message from anywhere else is ignored.
    window.dispatchEvent(new MessageEvent('message', { data, origin: 'https://evil.example', source: opener as unknown as Window }))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(useChildrenStore().children).toHaveLength(0)

    window.dispatchEvent(new MessageEvent('message', { data, origin: OLD, source: opener as unknown as Window }))
    expect(await screen.findByRole('heading', { name: 'Andmed on üle toodud' })).toBeInTheDocument()
    expect(useChildrenStore().children.map((child) => child.name)).toEqual(['Markus', 'Pääru'])
    expect(useCreationsStore().creations.map((c) => c.id)).toEqual(['c9'])
    expect(opener.postMessage).toHaveBeenLastCalledWith({ type: 'kirjavolu-done', children: 2, creations: 1 }, OLD)
  })

  it('explains what to do when /kolin is opened directly', async () => {
    vi.stubEnv('VITE_TRANSFER_FROM', OLD)
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push('/kolin')
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    expect(await screen.findByRole('heading', { name: 'Andmete toomine vanalt aadressilt' })).toBeInTheDocument()
  })

  it('hands the data over from the old address when the parent asks', async () => {
    vi.stubEnv('VITE_MOVED_TO', 'https://kirjavolu.ee')
    const popup = { postMessage: vi.fn() }
    const open = vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window)
    const pinia = createPinia()
    setActivePinia(pinia)
    useChildrenStore().restoreDemo()
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push('/')
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    const user = userEvent.setup()

    expect(screen.getByRole('heading', { name: 'Kirjavõlu kolis aadressile kirjavolu.ee' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vii andmed üle' }))
    expect(open).toHaveBeenCalledWith('https://kirjavolu.ee/kolin', 'kirjavolu-kolin')

    const from = (data: unknown) => new MessageEvent('message', { data, origin: 'https://kirjavolu.ee', source: popup as unknown as Window })
    window.dispatchEvent(from({ type: 'kirjavolu-ready' }))
    await vi.waitFor(() => expect(popup.postMessage).toHaveBeenCalledTimes(1))
    const [sent, target] = popup.postMessage.mock.calls[0]!
    expect(target).toBe('https://kirjavolu.ee')
    expect(sent).toMatchObject({ type: 'kirjavolu-data', version: TRANSFER_VERSION, images: [] })
    expect(sent.state.children.map((child: { name: string }) => child.name)).toEqual(['Markus', 'Pääru', 'Kai'])

    window.dispatchEvent(from({ type: 'kirjavolu-done', children: 3, creations: 0 }))
    expect(await screen.findByText(/Valmis! Üle tuli 3 last ja 0 loomingut/)).toBeInTheDocument()
    expect(readMoved()).toBe(true)
    open.mockRestore()
  })
})
