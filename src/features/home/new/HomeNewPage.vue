<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Eye, FlaskConical } from 'lucide-vue-next'
import Mascot from '../../../components/brand/Mascot.vue'
import { iconFor } from '../../../components/ui/icons'
import { CONTENT_TYPES } from '../../../domain/contentTypes'
import type { OccasionId } from '../../../domain/models'
import { OCCASIONS } from '../../../domain/occasions/occasions'
import { isInSeason, sortBySeason } from '../../../domain/occasions/season'
import { useChildrenStore } from '../../children/childrenStore'
import RecentCreations from '../RecentCreations.vue'

/**
 * Test view of the new home page design (/uus-disain). The current home page at "/"
 * stays as it is until this one is chosen; the links lead into the same wizard.
 */
const childrenStore = useChildrenStore()
const occasions = computed(() => sortBySeason(OCCASIONS))
// The envelope in the picture is addressed to the family's own child when there is one.
const addressee = computed(() => childrenStore.children[0]?.name ?? 'Mia')

const STAMP_COLORS: Record<OccasionId, string> = {
  christmas: '#c43b30',
  easter: '#7fa387',
  birthday: '#7c6bb8',
  halloween: '#e0782f',
  'mardi-kadri': '#8d5a97',
  vastlapaev: '#4f86b5',
  valentines: '#d9577a',
  'school-start': '#3d7a6a',
  summer: '#e8a33d',
  'lost-tooth': '#5aa4b8',
  everyday: '#6b5aa8',
}
// Airmail edge colours and a slight tilt per postcard, so they look tossed on a table.
const POSTCARDS = [
  { edge: ['#e8836b', '#7c6bb8'], tint: 'var(--coral-soft)', ink: 'var(--coral-ink)', tilt: -1.2 },
  { edge: ['#7fa387', '#f2c46d'], tint: 'var(--sage-soft)', ink: 'var(--sage-ink)', tilt: 0.8 },
  { edge: ['#7c6bb8', '#e8836b'], tint: 'var(--lavender-soft)', ink: 'var(--lavender-ink)', tilt: -0.6 },
  { edge: ['#f2c46d', '#7c6bb8'], tint: 'var(--gold-soft)', ink: '#8a6417', tilt: 1 },
  { edge: ['#e8836b', '#7fa387'], tint: 'var(--coral-soft)', ink: 'var(--coral-ink)', tilt: -0.9 },
  { edge: ['#7c6bb8', '#f2c46d'], tint: 'var(--lavender-soft)', ink: 'var(--lavender-ink)', tilt: 0.6 },
]
const STAMP_TILTS = [-3, 2, -1, 3, -2, 1.5]
</script>

<template>
  <div class="home-new">
    <p class="test-bar">
      <FlaskConical :size="16" aria-hidden="true" />
      <span>Testvaade: uus avalehe disain.</span>
      <RouterLink to="/">Vaata praegust avalehte</RouterLink>
    </p>

    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__text">
          <span class="hero__tag">Võlupost igaks päevaks</span>
          <h1>Kiri, mis teab <span class="hero__accent">sinu lapse</span> nime.</h1>
          <p class="hero__lead">
            Jõulukirjad, sünnipäevaseiklused, aardejahid ja hambahaldja kirjad. Valmis kahe klõpsuga – prindi ja peida.
          </p>
          <div class="hero__actions">
            <RouterLink to="/loo" class="chunky chunky--primary">Alusta loomist <ArrowRight :size="18" aria-hidden="true" /></RouterLink>
            <RouterLink to="/naide" class="chunky chunky--secondary"><Eye :size="18" aria-hidden="true" /> Vaata näidet</RouterLink>
          </div>
        </div>

        <div class="hero__art" aria-hidden="true">
          <svg viewBox="0 0 300 240" class="hero__svg">
            <path d="M40 60 C90 10 170 20 200 70" fill="none" stroke="#e8836b" stroke-width="2" stroke-dasharray="4 6" />
            <circle cx="40" cy="60" r="4" fill="#f2c46d" />
            <path class="twinkle" d="M250 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#f2c46d" />
            <path class="twinkle twinkle--late" d="M30 150 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#b8aee6" />
            <g class="hero__envelope">
              <rect x="100" y="70" width="180" height="120" rx="12" fill="#f6e7cf" stroke="#e3cfb4" stroke-width="2" />
              <path d="M100 76 L190 135 L280 76" fill="#efdcbf" stroke="#e3cfb4" stroke-width="2" />
              <circle cx="190" cy="135" r="14" fill="#c43b30" />
              <path d="M190 127 l2.4 5 5.4.6-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.6z" fill="#ffd9cf" />
              <rect x="236" y="88" width="30" height="36" fill="#fff" />
              <rect x="240" y="92" width="22" height="28" fill="#7c6bb8" />
              <path d="M251 99 l2 4 4.5.5-3.3 3 .9 4.5-4.1-2.2-4.1 2.2.9-4.5-3.3-3 4.5-.5z" fill="#f2c46d" />
              <text x="190" y="173" text-anchor="middle" class="hero__name">{{ addressee }}</text>
            </g>
          </svg>
          <Mascot mood="wave" :size="120" class="hero__mascot" />
          <p class="hero__bubble">Sulle on post!</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="new-types-title">
      <div class="container">
        <h2 id="new-types-title" class="section-title">Mida meisterdame?</h2>
        <ul class="postcards" role="list">
          <li v-for="(type, index) in CONTENT_TYPES" :key="type.id">
            <RouterLink
              :to="{ path: '/loo', query: { tyyp: type.id } }"
              class="postcard"
              :style="{
                '--tilt': `${POSTCARDS[index % POSTCARDS.length]!.tilt}deg`,
                '--edge-a': POSTCARDS[index % POSTCARDS.length]!.edge[0],
                '--edge-b': POSTCARDS[index % POSTCARDS.length]!.edge[1],
                '--tint': POSTCARDS[index % POSTCARDS.length]!.tint,
                '--card-ink': POSTCARDS[index % POSTCARDS.length]!.ink,
              }"
            >
              <span class="postcard__edge" aria-hidden="true" />
              <span class="postcard__body">
                <span class="postcard__text">
                  <span class="postcard__title">{{ type.title }}</span>
                  <span class="postcard__tagline">{{ type.tagline }}</span>
                </span>
                <span class="postcard__icon" aria-hidden="true">
                  <component :is="iconFor(type.icon)" :size="20" :stroke-width="1.8" />
                </span>
              </span>
              <span class="postcard__desc">{{ type.description }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="section stamps-section" aria-labelledby="new-occasions-title">
      <div class="container">
        <h2 id="new-occasions-title" class="section-title">Mis puhul?</h2>
        <ul class="stamps" role="list">
          <li v-for="(occasion, index) in occasions" :key="occasion.id">
            <RouterLink
              :to="{ path: '/loo', query: { puhk: occasion.id } }"
              class="stamp"
              :style="{ '--tilt': `${STAMP_TILTS[index % STAMP_TILTS.length]}deg`, '--stamp': STAMP_COLORS[occasion.id] }"
            >
              <span class="stamp__face">
                <span v-if="isInSeason(occasion.id)" class="stamp__season">Praegu</span>
                <component :is="iconFor(occasion.icon)" :size="28" :stroke-width="1.7" aria-hidden="true" />
                <span class="stamp__name">{{ occasion.name }}</span>
                <span class="stamp__when">{{ occasion.when }}</span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <RecentCreations />
  </div>
</template>

<style scoped lang="scss">
.home-new {
  background: #fdf6ec;
}
.test-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem 0.6rem;
  margin: 0;
  padding: 0.5rem 1rem;
  background: var(--lavender-soft);
  color: var(--lavender-ink);
  font-size: 0.85rem;
  font-weight: 500;
  a {
    color: inherit;
    font-weight: 600;
  }
}

// --- hero ------------------------------------------------------------------
.hero {
  padding-block: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 4vw, 2.5rem);
  border-bottom: 2px dashed #ecd9bf;
}
.hero__inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 2rem;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
}
.hero__tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: #fbe3db;
  color: var(--coral-ink);
  font-size: 0.85rem;
  font-weight: 600;
  transform: rotate(-2deg);
}
.hero h1 {
  margin: 1rem 0;
  font-size: clamp(2.3rem, 6vw, 3.8rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.025em;
}
.hero__accent {
  color: var(--coral);
}
.hero__lead {
  max-width: 32rem;
  margin: 0;
  color: var(--ink-soft);
  font-size: clamp(1.05rem, 2vw, 1.2rem);
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}
.chunky {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 3rem;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
}
.chunky--primary {
  background: var(--lavender);
  color: #fff;
  box-shadow: 0 5px 0 var(--lavender-ink);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 0 var(--lavender-ink);
  }
  &:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 var(--lavender-ink);
  }
}
.chunky--secondary {
  background: #fff;
  color: var(--lavender-ink);
  border: 2px solid var(--lavender-mid);
  &:hover {
    border-color: var(--lavender);
  }
}

.hero__art {
  position: relative;
  max-width: 460px;
  justify-self: center;
  width: 100%;
}
.hero__svg {
  display: block;
  width: 100%;
  height: auto;
}
.hero__envelope {
  transform-box: fill-box;
  transform-origin: center;
  transform: rotate(-6deg);
  animation: float 5s ease-in-out infinite;
}
.hero__name {
  font-family: var(--font-print);
  font-size: 15px;
  font-weight: 600;
  fill: #4a3b33;
}
.hero__mascot {
  position: absolute;
  left: 2%;
  bottom: 0;
  width: 30%;
  height: auto;
}
.hero__bubble {
  position: absolute;
  left: 38%;
  top: 6%;
  margin: 0;
  padding: 0.45rem 0.9rem;
  border: 2px solid #e3cfb4;
  border-radius: 14px 14px 14px 4px;
  background: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  animation: bubble 0.5s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.twinkle {
  animation: twinkle 1.6s ease-in-out infinite;
}
.twinkle--late {
  animation-delay: 0.8s;
}
@keyframes float {
  50% {
    transform: rotate(-4deg) translateY(-6px);
  }
}
@keyframes bubble {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
@keyframes twinkle {
  50% {
    opacity: 0.3;
  }
}

// --- postcards ----------------------------------------------------------------
.section-title {
  margin: 0 0 1.25rem;
  font-size: clamp(1.6rem, 3.5vw, 2rem);
}
.postcards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.postcard {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  height: 100%;
  padding: 0.9rem 1.1rem 1.1rem;
  border: 2px solid #f0e2cf;
  border-radius: 16px;
  background: #fff;
  color: var(--ink);
  text-decoration: none;
  transform: rotate(var(--tilt));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
  &:hover {
    transform: rotate(0) translateY(-4px);
    box-shadow: 0 10px 0 -4px var(--tint), var(--shadow);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
}
.postcard__edge {
  height: 7px;
  border-radius: 4px;
  background: repeating-linear-gradient(90deg, var(--edge-a) 0 12px, #fff 12px 18px, var(--edge-b) 18px 30px, #fff 30px 36px);
}
.postcard__body {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}
.postcard__text {
  display: flex;
  flex-direction: column;
}
.postcard__title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
}
.postcard__tagline {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.postcard__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--tint);
  color: var(--card-ink);
}
.postcard__desc {
  padding-top: 0.6rem;
  border-top: 1.5px dashed #f0e2cf;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

// --- stamps -----------------------------------------------------------------
.stamps-section {
  background: #f6ead9;
  border-top: 2px dashed #ecd9bf;
}
.stamps {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.6rem, 1fr));
  gap: 1.1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.stamp {
  display: block;
  padding: 6px;
  background: #fff;
  // Perforated edge: holes only in the padding, the face itself stays whole.
  mask:
    linear-gradient(#000 0 0) content-box,
    radial-gradient(circle 4px at 4px 4px, transparent 98%, #000) -4px -4px / 11px 11px;
  color: #fff;
  text-decoration: none;
  transform: rotate(var(--tilt));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  &:hover {
    transform: rotate(0) scale(1.08);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 4px;
  }
}
.stamp__face {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  aspect-ratio: 9 / 10;
  padding: 0.5rem;
  background: var(--stamp);
  text-align: center;
}
.stamp__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.15;
}
.stamp__when {
  font-size: 0.75rem;
  opacity: 0.85;
}
.stamp__season {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: #fff;
  color: var(--stamp);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
