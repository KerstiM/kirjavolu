import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

/**
 * Newer Node versions ship their own (disabled) localStorage global, which hides
 * the jsdom implementation. Provide a small in-memory Storage for tests.
 */
class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length(): number {
    return this.data.size
  }
  clear(): void {
    this.data.clear()
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string): void {
    this.data.delete(key)
  }
  setItem(key: string, value: string): void {
    this.data.set(key, String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: globalThis.localStorage, configurable: true })
}

afterEach(() => {
  localStorage.clear()
})
