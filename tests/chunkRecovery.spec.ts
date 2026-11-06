import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { isChunkLoadError, recoverFromChunkErrors } from '@/app/chunkRecovery'

describe('a page whose script file is gone', () => {
  beforeEach(() => sessionStorage.clear())

  it('recognises the browser’s messages', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/Create-1.js'))).toBe(true)
    expect(isChunkLoadError(new Error('Something else'))).toBe(false)
  })

  it('reloads once, then tells the parent what to do', async () => {
    const failing = () => Promise.reject(new TypeError('error loading dynamically imported module'))
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/loo', component: failing },
      ],
    })
    const reload = vi.fn()
    const notify = vi.fn()
    recoverFromChunkErrors(router, reload, notify, () => 1_000_000)
    await router.push('/loo').catch(() => undefined)
    expect(reload).toHaveBeenCalledWith('/loo')
    expect(notify).not.toHaveBeenCalled()
    await router.push('/loo').catch(() => undefined)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledOnce()
  })
})
