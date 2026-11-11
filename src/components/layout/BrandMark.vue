<template>
  <!-- An envelope whose flap is a magic wand: a wavy trail, then the golden wand and its star. -->
  <svg class="mark" viewBox="0 0 100 100" width="34" height="34" aria-hidden="true">
    <rect width="100" height="100" rx="24" fill="var(--lavender)" />
    <rect x="20" y="36" width="60" height="40" rx="6" fill="none" stroke="#fffaf3" stroke-width="5.5" />
    <path
      d="M24 40L25.1 41.1L25.9 42.5L26.5 44.2L27.1 45.8L27.9 47.3L28.9 48.5L30.2 49.2L31.9 49.4L33.9 49.3L36 49L38.1 48.7L40.1 48.6L41.8 48.8L43.1 49.5L44.1 50.7L44.9 52.2L45.5 53.8L46.1 55.5L46.9 56.9L48 58"
      fill="none"
      stroke="#fffaf3"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M66 44.6 79 35" stroke="var(--lavender)" stroke-width="11" stroke-linecap="round" />
    <path d="M48 58 79 35" stroke="var(--gold)" stroke-width="5.5" stroke-linecap="round" />
    <path
      d="M83 22L85.4 27.8L91.6 28.2L86.8 32.2L88.3 38.3L83 35L77.7 38.3L79.2 32.2L74.4 28.2L80.6 27.8Z"
      fill="var(--gold)"
      stroke="var(--gold)"
      stroke-width="2.4"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.mark {
  flex-shrink: 0;
}
</style>
