<script setup lang="ts">
import { useId } from 'vue'
import type { PatternId } from '../../../domain/models'

/**
 * Decorative SVG pattern behind a printable item. As a full background it is
 * drawn softly; in ink-saver mode it is only a frame along the edges.
 */
defineProps<{ pattern: PatternId; inkSaver: boolean }>()
const id = `pattern-${useId()}`
</script>

<template>
  <svg class="pattern" aria-hidden="true" focusable="false">
    <defs>
      <pattern :id="id" width="64" height="64" patternUnits="userSpaceOnUse">
        <g v-if="pattern === 'stars'">
          <path d="M14 6l2.2 5.8L22 14l-5.8 2.2L14 22l-2.2-5.8L6 14l5.8-2.2z" fill="#f2c46d" />
          <path d="M46 36l1.5 3.5L51 41l-3.5 1.5L46 46l-1.5-3.5L41 41l3.5-1.5z" fill="#b8acdf" />
          <circle cx="44" cy="12" r="1.8" fill="#e8a593" />
          <circle cx="18" cy="48" r="1.5" fill="#b8acdf" />
        </g>
        <g v-else-if="pattern === 'snow'" stroke="#a9b8dc" stroke-width="1.6" stroke-linecap="round">
          <path d="M16 6v20M6 16h20M9 9l14 14M23 9L9 23" />
          <path d="M46 38v14M39 45h14M41 40l10 10M51 40L41 50" stroke="#c5bde6" />
          <circle cx="48" cy="14" r="1.6" fill="#c5bde6" stroke="none" />
          <circle cx="14" cy="50" r="1.4" fill="#a9b8dc" stroke="none" />
        </g>
        <g v-else-if="pattern === 'eggs'">
          <ellipse cx="16" cy="18" rx="7" ry="9" fill="#f7d9cf" />
          <path d="M9.5 18h13" stroke="#e8a593" stroke-width="1.5" />
          <ellipse cx="46" cy="44" rx="7" ry="9" fill="#dde9de" />
          <circle cx="44" cy="42" r="1.4" fill="#7fa387" />
          <circle cx="48" cy="46" r="1.4" fill="#7fa387" />
          <circle cx="48" cy="14" r="1.6" fill="#f2c46d" />
        </g>
        <g v-else-if="pattern === 'confetti'">
          <rect x="10" y="10" width="8" height="4" rx="1" transform="rotate(25 14 12)" fill="#e8a593" />
          <rect x="40" y="16" width="8" height="4" rx="1" transform="rotate(-30 44 18)" fill="#b8acdf" />
          <rect x="20" y="42" width="8" height="4" rx="1" transform="rotate(60 24 44)" fill="#f2c46d" />
          <rect x="46" y="46" width="8" height="4" rx="1" transform="rotate(10 50 48)" fill="#9cc0a3" />
          <circle cx="32" cy="30" r="2" fill="#e8a593" />
        </g>
        <g v-else-if="pattern === 'hearts'">
          <path d="M16 24s-8-5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 24 14c0 5-8 10-8 10z" fill="#f4c7ba" />
          <path d="M46 52s-6-3.8-6-7.5a3.4 3.4 0 0 1 6-2.1 3.4 3.4 0 0 1 6 2.1c0 3.7-6 7.5-6 7.5z" fill="#d9d2f0" />
          <circle cx="48" cy="14" r="1.6" fill="#e8a593" />
        </g>
        <g v-else-if="pattern === 'leaves'">
          <path d="M8 22c4-12 14-14 18-14-2 10-8 16-18 14z" fill="#cfe0d1" />
          <path d="M8 22c6-5 11-9 18-14" stroke="#9cc0a3" stroke-width="1.2" fill="none" />
          <path d="M40 54c3-9 10-11 14-11-1.5 7.5-6 12-14 11z" fill="#f2deb0" />
          <circle cx="48" cy="16" r="1.6" fill="#9cc0a3" />
        </g>
        <g v-else-if="pattern === 'moons'">
          <path d="M20 8a10 10 0 1 0 6 18 8 8 0 1 1-6-18z" fill="#d9d2f0" />
          <path d="M48 38l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" fill="#f2c46d" />
          <circle cx="44" cy="14" r="1.5" fill="#b8acdf" />
        </g>
        <g v-else>
          <circle cx="16" cy="16" r="3" fill="#d9d2f0" />
          <circle cx="48" cy="48" r="3" fill="#f7d9cf" />
          <circle cx="48" cy="16" r="2" fill="#dde9de" />
          <circle cx="16" cy="48" r="2" fill="#fbf0d6" />
        </g>
      </pattern>
    </defs>
    <rect
      v-if="inkSaver"
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="none"
      :stroke="`url(#${id})`"
      stroke-width="56"
    />
    <rect v-else x="0" y="0" width="100%" height="100%" :fill="`url(#${id})`" />
  </svg>
</template>

<style scoped>
.pattern {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
