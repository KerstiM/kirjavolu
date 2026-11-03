import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { ref } from 'vue'
import DateInput from '@/components/ui/DateInput.vue'

function setup(initial = '2026-12-01', bounds: { min?: string; max?: string } = {}) {
  const model = ref(initial)
  render(DateInput, {
    props: { modelValue: model.value, 'onUpdate:modelValue': (value: string) => (model.value = value), label: 'Kuupäev', ...bounds },
  })
  return { model, field: screen.getByPlaceholderText('pp.kk.aaaa') as HTMLInputElement, user: userEvent.setup() }
}

describe('the Estonian date field', () => {
  it('shows the date as day.month.year, whatever the computer’s language', () => {
    expect(setup('2026-12-24').field.value).toBe('24.12.2026')
  })

  it('reads what a parent types, with dots, slashes or a short year', async () => {
    const { model, field, user } = setup()
    for (const [typed, iso] of [['5/12/2026', '2026-12-05'], ['24.12.26', '2026-12-24'], ['1-12-2026', '2026-12-01']] as const) {
      await user.clear(field)
      await user.type(field, typed)
      await user.tab()
      expect(model.value).toBe(iso)
    }
  })

  it('keeps the old date and marks the field when the date is not real or out of range', async () => {
    const { model, field, user } = setup('2026-12-01', { min: '2026-12-01', max: '2026-12-24' })
    await user.clear(field)
    await user.type(field, '31.02.2026')
    await user.tab()
    expect(model.value).toBe('2026-12-01')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    await user.clear(field)
    await user.type(field, '28.12.2026')
    await user.tab()
    expect(model.value).toBe('2026-12-01')
  })

  it('has a calendar button for the browser’s own picker', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Kuupäev: ava kalender' })).toBeInTheDocument()
  })
})
