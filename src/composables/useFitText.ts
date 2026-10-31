import { nextTick, onMounted, ref, watch, type Ref, type WatchSource } from 'vue'

/**
 * Shrinks the font of a fixed-size text box until its content fits, but never
 * below `minPt`. `overflow` stays true when even the minimum size is too big.
 * The box must have a single wrapper child whose height is the content height.
 */
export function useFitText(
  el: Ref<HTMLElement | null>,
  sources: WatchSource[],
  options: { maxPt: () => number; minPt: number; stepPt?: number; headroom?: () => number },
): { fontPt: Ref<number>; overflow: Ref<boolean> } {
  const fontPt = ref(options.maxPt())
  const overflow = ref(false)
  const step = options.stepPt ?? 0.25

  async function fit(): Promise<void> {
    const node = el.value
    if (!node) return
    let size = options.maxPt()
    node.style.fontSize = `${size}pt`
    const inner = node.firstElementChild as HTMLElement | null
    // Headroom: on screen the sheets are scaled, and print metrics differ slightly.
    const room = options.headroom?.() ?? 0.96
    const fits = () => (inner ? inner.offsetHeight : node.scrollHeight) <= node.clientHeight * room
    // Layout is synchronous: each assignment can be measured right away.
    while (!fits() && size - step >= options.minPt) {
      size -= step
      node.style.fontSize = `${size}pt`
    }
    fontPt.value = size
    overflow.value = !fits()
  }

  onMounted(async () => {
    await nextTick()
    await fit()
    // Web fonts change text metrics once they arrive.
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready
      await fit()
    }
  })
  watch(sources, async () => {
    await nextTick()
    await fit()
  })

  return { fontPt, overflow }
}
