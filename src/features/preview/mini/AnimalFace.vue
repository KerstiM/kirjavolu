<script setup lang="ts">
import type { AnimalId } from './animals'

/** Simple flat animal faces for toddler cards, drawn in a 40 × 40 box. */
defineProps<{ animal: AnimalId }>()
</script>

<template>
  <svg viewBox="0 0 40 40" class="face" aria-hidden="true" focusable="false">
    <g v-if="animal === 'mouse'">
      <circle cx="10" cy="12" r="7" fill="#c9c6d6" /><circle cx="10" cy="12" r="4" fill="#f4c2cf" />
      <circle cx="30" cy="12" r="7" fill="#c9c6d6" /><circle cx="30" cy="12" r="4" fill="#f4c2cf" />
      <circle cx="20" cy="23" r="12" fill="#d9d6e4" />
      <circle cx="15.5" cy="21" r="1.6" fill="#2e2a55" /><circle cx="24.5" cy="21" r="1.6" fill="#2e2a55" />
      <circle cx="20" cy="26" r="1.8" fill="#ef8fa8" />
      <circle cx="13" cy="26" r="2" fill="#f7c9d4" opacity="0.8" /><circle cx="27" cy="26" r="2" fill="#f7c9d4" opacity="0.8" />
    </g>
    <g v-else-if="animal === 'pig'">
      <path d="M9 8l7 6-8 3z" fill="#ef9fb4" /><path d="M31 8l-7 6 8 3z" fill="#ef9fb4" />
      <circle cx="20" cy="22" r="13" fill="#f7b8c8" />
      <circle cx="15" cy="19" r="1.6" fill="#2e2a55" /><circle cx="25" cy="19" r="1.6" fill="#2e2a55" />
      <ellipse cx="20" cy="26" rx="5.5" ry="4" fill="#ef9fb4" />
      <circle cx="18" cy="26" r="1.1" fill="#b65a74" /><circle cx="22" cy="26" r="1.1" fill="#b65a74" />
    </g>
    <g v-else-if="animal === 'bunny'">
      <ellipse cx="14" cy="9" rx="3.5" ry="8" fill="#f4f1f8" stroke="#d9d4e4" /><ellipse cx="14" cy="9" rx="1.6" ry="5.5" fill="#f7c9d4" />
      <ellipse cx="26" cy="9" rx="3.5" ry="8" fill="#f4f1f8" stroke="#d9d4e4" /><ellipse cx="26" cy="9" rx="1.6" ry="5.5" fill="#f7c9d4" />
      <circle cx="20" cy="25" r="11" fill="#fbf9fd" stroke="#d9d4e4" />
      <circle cx="16" cy="23" r="1.5" fill="#2e2a55" /><circle cx="24" cy="23" r="1.5" fill="#2e2a55" />
      <path d="M18.5 27h3l-1.5 1.6z" fill="#ef8fa8" />
    </g>
    <g v-else-if="animal === 'frog'">
      <circle cx="12" cy="13" r="6" fill="#7cc48a" /><circle cx="28" cy="13" r="6" fill="#7cc48a" />
      <circle cx="12" cy="13" r="3" fill="#fff" /><circle cx="28" cy="13" r="3" fill="#fff" />
      <circle cx="12" cy="13" r="1.5" fill="#2e2a55" /><circle cx="28" cy="13" r="1.5" fill="#2e2a55" />
      <ellipse cx="20" cy="25" rx="15" ry="10" fill="#8fd19b" />
      <path d="M12 26q8 6 16 0" fill="none" stroke="#2e2a55" stroke-width="1.6" stroke-linecap="round" />
    </g>
    <g v-else-if="animal === 'bear'">
      <circle cx="10" cy="11" r="5.5" fill="#b07a55" /><circle cx="30" cy="11" r="5.5" fill="#b07a55" />
      <circle cx="20" cy="22" r="13" fill="#c48d65" />
      <ellipse cx="20" cy="27" rx="6" ry="4.5" fill="#ecd2b8" />
      <circle cx="15" cy="19" r="1.6" fill="#2e2a55" /><circle cx="25" cy="19" r="1.6" fill="#2e2a55" />
      <ellipse cx="20" cy="25.5" rx="2" ry="1.4" fill="#2e2a55" />
    </g>
    <g v-else-if="animal === 'ladybug'">
      <circle cx="20" cy="9.5" r="5.5" fill="#2e2a55" />
      <path d="M17 5l-3-3M23 5l3-3" stroke="#2e2a55" stroke-width="1.4" stroke-linecap="round" />
      <circle cx="20" cy="23" r="12" fill="#e45b4f" />
      <path d="M20 11v24" stroke="#2e2a55" stroke-width="1.4" />
      <circle cx="14" cy="19" r="2.2" fill="#2e2a55" /><circle cx="26" cy="19" r="2.2" fill="#2e2a55" />
      <circle cx="14.5" cy="28" r="2" fill="#2e2a55" /><circle cx="25.5" cy="28" r="2" fill="#2e2a55" />
    </g>
    <g v-else-if="animal === 'chick'">
      <path d="M18 7q2-5 4 0" fill="none" stroke="#e8a93a" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="20" cy="21" r="13" fill="#f7d35c" />
      <circle cx="15" cy="18" r="1.6" fill="#2e2a55" /><circle cx="25" cy="18" r="1.6" fill="#2e2a55" />
      <path d="M17 22h6l-3 3.5z" fill="#f08c3c" />
      <path d="M8 14q12-6 24 0" fill="none" stroke="#5aa0d8" stroke-width="3" stroke-linecap="round" />
    </g>
    <g v-else-if="animal === 'cat'">
      <path d="M8 6l9 7-9 5z" fill="#f2a65a" /><path d="M32 6l-9 7 9 5z" fill="#f2a65a" />
      <circle cx="20" cy="22" r="13" fill="#f5b26b" />
      <path d="M12 13l4 3M28 13l-4 3" stroke="#d98a3d" stroke-width="1.4" stroke-linecap="round" />
      <circle cx="15" cy="20" r="1.6" fill="#2e2a55" /><circle cx="25" cy="20" r="1.6" fill="#2e2a55" />
      <path d="M18.6 24h2.8l-1.4 1.5z" fill="#ef8fa8" />
      <path d="M6 24h7M6 27h7M27 24h7M27 27h7" stroke="#8a6a55" stroke-width="0.8" stroke-linecap="round" />
    </g>
    <g v-else-if="animal === 'elephant'">
      <ellipse cx="8" cy="20" rx="7" ry="9" fill="#b9bfd4" /><ellipse cx="32" cy="20" rx="7" ry="9" fill="#b9bfd4" />
      <circle cx="20" cy="19" r="11" fill="#c9cfe1" />
      <path d="M20 22v8q0 4 4 3" fill="none" stroke="#c9cfe1" stroke-width="5" stroke-linecap="round" />
      <circle cx="16" cy="17" r="1.5" fill="#2e2a55" /><circle cx="24" cy="17" r="1.5" fill="#2e2a55" />
    </g>
    <g v-else-if="animal === 'butterfly'">
      <circle cx="12" cy="14" r="7" fill="#b79be0" /><circle cx="28" cy="14" r="7" fill="#b79be0" />
      <circle cx="13" cy="27" r="5.5" fill="#ef9fb4" /><circle cx="27" cy="27" r="5.5" fill="#ef9fb4" />
      <circle cx="12" cy="14" r="2.5" fill="#f7d35c" /><circle cx="28" cy="14" r="2.5" fill="#f7d35c" />
      <rect x="18.5" y="9" width="3" height="23" rx="1.5" fill="#2e2a55" />
      <path d="M19 9l-3-5M21 9l3-5" stroke="#2e2a55" stroke-width="1.2" stroke-linecap="round" />
    </g>
    <g v-else-if="animal === 'hedgehog'">
      <path d="M5 28l2-8-3-4 5-2 0-6 5 2 3-5 4 4 5-3 2 5 6-1-1 6 5 3-4 4 2 5z" fill="#8a6a55" />
      <ellipse cx="25" cy="27" rx="10" ry="8" fill="#ecd2b8" />
      <circle cx="26" cy="25" r="1.5" fill="#2e2a55" />
      <circle cx="34.5" cy="28" r="1.8" fill="#2e2a55" />
    </g>
    <g v-else>
      <path d="M8 8l6 6M32 8l-6 6" stroke="#9b7bb8" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="20" cy="22" rx="13" ry="14" fill="#b494cf" />
      <circle cx="14.5" cy="19" r="5" fill="#fff" /><circle cx="25.5" cy="19" r="5" fill="#fff" />
      <circle cx="14.5" cy="19" r="2.2" fill="#2e2a55" /><circle cx="25.5" cy="19" r="2.2" fill="#2e2a55" />
      <path d="M18 24h4l-2 3z" fill="#f2a65a" />
      <ellipse cx="20" cy="31" rx="6" ry="3.5" fill="#d7c4e8" />
    </g>
  </svg>
</template>

<style scoped>
.face {
  width: 100%;
  height: 100%;
}
</style>
