/** Deep copy for plain JSON data. Works with Vue reactive proxies, unlike structuredClone. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
