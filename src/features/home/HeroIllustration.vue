<template>
  <svg viewBox="0 0 440 360" role="img" aria-label="Illustratsioon: kirjad, kaart ja tähed">
    <defs>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#2a2433" flood-opacity="0.12" />
      </filter>
    </defs>
    <!-- map card -->
    <g transform="rotate(-9 140 200)" filter="url(#soft)">
      <rect x="40" y="110" width="200" height="150" rx="18" fill="#fff" />
      <path d="M62 230c30-40 60 10 90-30s50-20 70-45" fill="none" stroke="var(--coral)" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />
      <path d="M205 140l12 12m0-12l-12 12" stroke="var(--coral-ink)" stroke-width="3.5" stroke-linecap="round" />
      <circle cx="68" cy="232" r="6" fill="var(--sage)" />
    </g>
    <!-- letter -->
    <g transform="rotate(6 280 170)" filter="url(#soft)">
      <rect x="180" y="70" width="210" height="170" rx="18" fill="#fffaf3" />
      <path d="M180 92l105 72 105-72" fill="none" stroke="var(--lavender-mid)" stroke-width="3" stroke-linejoin="round" />
      <rect x="208" y="178" width="120" height="8" rx="4" fill="var(--line-strong)" />
      <rect x="208" y="196" width="150" height="8" rx="4" fill="var(--line)" />
      <rect x="208" y="214" width="90" height="8" rx="4" fill="var(--line)" />
      <circle cx="285" cy="150" r="20" fill="var(--coral)" />
      <path d="M285 140l3.2 6.6 7.2 1-5.2 5 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5 7.2-1z" fill="#fff" />
    </g>
    <!-- story book -->
    <g transform="rotate(-3 300 290)" filter="url(#soft)">
      <path d="M220 250c30-12 60-12 80 0 20-12 50-12 80 0v70c-30-12-60-12-80 0-20-12-50-12-80 0z" fill="#fff" />
      <path d="M300 250v70" stroke="var(--sage)" stroke-width="3" />
      <rect x="236" y="268" width="48" height="6" rx="3" fill="var(--sage-soft)" />
      <rect x="236" y="282" width="40" height="6" rx="3" fill="var(--sage-soft)" />
      <rect x="316" y="268" width="48" height="6" rx="3" fill="var(--sage-soft)" />
      <rect x="316" y="282" width="36" height="6" rx="3" fill="var(--sage-soft)" />
    </g>
    <!-- sparkles -->
    <g fill="var(--gold)">
      <path d="M74 60l4.5 10.5L89 75l-10.5 4.5L74 90l-4.5-10.5L59 75l10.5-4.5z" />
      <path d="M400 34l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
      <path d="M118 300l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" />
    </g>
    <circle cx="150" cy="58" r="5" fill="var(--lavender-mid)" />
    <circle cx="414" cy="270" r="6" fill="var(--coral-soft)" />
  </svg>
</template>
