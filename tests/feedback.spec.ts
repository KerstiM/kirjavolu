import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import FeedbackCard from '@/features/feedback/FeedbackCard.vue'
import { routes } from '@/app/router'

describe('feedback', () => {
  it('asks how the letters went, closed like the other sections, and opens an e-mail to info@kirjavolu.ee', async () => {
    render(FeedbackCard)
    const toggle = screen.getByRole('button', { name: /Kuidas kirjad meeldisid\?/ })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'Anna tagasisidet' })).toBeNull()
    await fireEvent.click(toggle)
    const link = screen.getByRole('link', { name: 'Anna tagasisidet' })
    expect(link.getAttribute('href')).toMatch(/^mailto:info@kirjavolu\.ee\?subject=Kirjav%C3%B5lu%20tagasiside/)
  })

  it('is one link away in the footer of every page', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push('/')
    await router.isReady()
    render(AppFooter, { global: { plugins: [router] } })
    expect(screen.getByRole('link', { name: 'Anna tagasisidet' }).getAttribute('href')).toMatch(/^mailto:info@kirjavolu\.ee/)
  })
})
