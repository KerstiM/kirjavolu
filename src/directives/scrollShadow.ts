import type { Directive } from 'vue'

/**
 * `v-scroll-shadow` on a scrolling box: a soft shadow along the top and the bottom edge shows
 * that there is more in that direction, and goes away when the edge is reached. The look is in
 * styles/_scroll-shadow.scss; this only keeps the two classes up to date.
 */
interface Tracked extends HTMLElement {
  __scrollShadow?: { update: () => void; observer: ResizeObserver | undefined }
}

export const vScrollShadow: Directive<Tracked> = {
  mounted(el) {
    el.classList.add('scroll-shadow')
    const update = () => {
      const max = el.scrollHeight - el.clientHeight
      el.classList.toggle('has-more-above', el.scrollTop > 1)
      el.classList.toggle('has-more-below', max > 1 && el.scrollTop < max - 1)
    }
    el.addEventListener('scroll', update, { passive: true })
    // Content (or the window) changing size changes what is hidden.
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    observer?.observe(el)
    for (const child of Array.from(el.children)) observer?.observe(child)
    el.__scrollShadow = { update, observer }
    update()
  },
  updated(el) {
    el.__scrollShadow?.update()
  },
  unmounted(el) {
    el.removeEventListener('scroll', el.__scrollShadow?.update as EventListener)
    el.__scrollShadow?.observer?.disconnect()
  },
}
