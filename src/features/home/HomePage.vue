<script setup lang="ts">
import { computed, nextTick, provide, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, ChevronDown, Eye, Gift, Lock } from 'lucide-vue-next'
import Mascot from '../../components/brand/Mascot.vue'
import PostcardCard from '../../components/brand/PostcardCard.vue'
import { DESIGN_KEY } from '../../components/brand/design'
import { iconFor } from '../../components/ui/icons'
import { getContentType } from '../../domain/contentTypes'
import { useChildrenStore } from '../children/childrenStore'
import { useCreationsStore } from '../preview/creationsStore'
import PrintableItem from '../preview/PrintableItem.vue'
import { isActive, loadPass } from '../pass/seasonPass'
import { PASS_ENABLED } from '../pass/availability'
import RecentCreations from './RecentCreations.vue'
import { COMING_SOON, isReady, NOT_READY_LABEL } from './new/readiness'
import { EXAMPLES, EXAMPLES_SECTION, HERO, PRIVACY, STEPS_SECTION, TYPE_CARDS, TYPES_SECTION } from './content'
import { currentPromo } from './seasonal'

/**
 * The home page: what Kirjavõlu is, the kinds ready now (the rest behind "Vaata veel") right under a compact hero, the season's
 * journey (Christmas letters now), real-looking samples, three steps, the family's own
 * creations and how the child's data is kept. Grew out of the /ud3 test version.
 */
provide(DESIGN_KEY, 'new')
const childrenStore = useChildrenStore()
const creations = useCreationsStore()
// The envelope is addressed to the family's own child when there is one.
const addressee = childrenStore.children[0]?.name ?? 'Pääru'

const WIZARD = '/loo'
const SAMPLE_PAGE = '/naide'
const promo = currentPromo()

// The Jõulupass is product state, not marketing: shown small, only when this browser has one.
const pass = PASS_ENABLED ? loadPass() : null
const passLeft = pass && isActive(pass) ? pass.generationsLeft : null

const cards = TYPE_CARDS.map((card) => ({ ...card, icon: iconFor(getContentType(card.id).icon) }))

// What can be made now comes first, with the one gray card coming next; everything else still
// being made opens under "Vaata veel", so the first choice is between real options.
const readyCards = cards.filter((card) => isReady(card.id))
const featuredSoon = COMING_SOON.filter((item) => item.featured)
const laterCards = cards.filter((card) => !isReady(card.id))
const laterSoon = COMING_SOON.filter((item) => !item.featured)
const showLater = ref(false)
const laterCount = computed(() => laterCards.length + laterSoon.length)

// "Vaata näidist" brings the samples into view and moves focus there, without leaving the page.
const examplesTitle = ref<HTMLElement | null>(null)
async function showExamples(): Promise<void> {
  await nextTick()
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  examplesTitle.value?.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  examplesTitle.value?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero" aria-labelledby="home-title">
      <div class="container hero__inner">
        <div class="hero__text">
          <p class="hero__eyebrow">{{ HERO.eyebrow }}</p>
          <h1 id="home-title">
            {{ HERO.titleStart }}<span class="hero__accent">{{ HERO.titleAccent }}</span>{{ HERO.titleEnd }}
          </h1>
          <p class="hero__lead">{{ HERO.lead }}</p>
          <div class="hero__actions">
            <RouterLink :to="WIZARD" class="btn-home btn-home--primary">
              {{ HERO.primary }} <ArrowRight :size="18" aria-hidden="true" />
            </RouterLink>
            <button type="button" class="btn-home btn-home--secondary" @click="showExamples">
              <Eye :size="18" aria-hidden="true" /> {{ HERO.secondary }}
            </button>
          </div>
          <ul class="hero__trust" aria-label="Kirjavõlu kasutamine">
            <li v-for="claim in HERO.trust" :key="claim">{{ claim }}</li>
          </ul>
        </div>

        <div class="hero__art" aria-hidden="true">
          <svg viewBox="0 0 300 220" class="hero__svg">
            <path d="M34 54 C84 6 164 16 194 64" fill="none" stroke="#e8836b" stroke-width="2" stroke-dasharray="4 6" />
            <circle cx="34" cy="54" r="4" fill="#f2c46d" />
            <path class="twinkle" d="M250 26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#f2c46d" />
            <path class="twinkle twinkle--late" d="M26 140 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#b8aee6" />
            <g class="hero__envelope">
              <rect x="100" y="64" width="180" height="120" rx="10" fill="#afa9ec" />
              <path d="M104 180 L148 146 M276 180 L232 146" fill="none" stroke="#7f77dd" stroke-width="4" stroke-linecap="round" />
              <path d="M100 76 Q100 64 112 64 L268 64 Q280 64 280 76 L190 128 Z" fill="#7f77dd" />
              <circle cx="190" cy="126" r="11" fill="#d85a30" />
              <rect x="240" y="74" width="26" height="32" rx="2" fill="#fff" />
              <path d="M253 82 l2 4 4.5.5-3.3 3 .9 4.5-4.1-2.2-4.1 2.2.9-4.5-3.3-3 4.5-.5z" fill="#d85a30" />
              <text x="190" y="164" text-anchor="middle" class="hero__name">{{ addressee }}</text>
            </g>
          </svg>
          <Mascot mood="wave" :size="104" class="hero__mascot" />
          <p class="hero__bubble">Sulle on post!</p>
        </div>
      </div>
    </section>

    <!-- The kinds, right under the hero -->
    <section class="section types" aria-labelledby="home-types">
      <div class="container">
        <header class="home-head">
          <h2 id="home-types">{{ TYPES_SECTION.title }}</h2>
          <p>{{ TYPES_SECTION.lead }}</p>
        </header>
        <ul class="types__grid" role="list">
          <li v-for="(card, index) in readyCards" :key="card.id">
            <PostcardCard
              :to="{ path: WIZARD, query: { tyyp: card.id } }"
              :title="card.title"
              :tagline="card.subtitle"
              :description="card.description"
              :icon="card.icon"
              :index="index"
            />
          </li>
          <!-- Coming later: gray, not links -->
          <li v-for="(item, index) in featuredSoon" :key="item.id">
            <PostcardCard
              :title="item.title"
              :tagline="item.tagline"
              :description="item.description"
              :icon="iconFor(item.icon)"
              :index="readyCards.length + index"
              :soon="item.label"
              :pass="item.pass"
            />
          </li>
        </ul>
        <button
          v-if="laterCount"
          type="button"
          class="types__more"
          :aria-expanded="showLater"
          aria-controls="home-types-later"
          @click="showLater = !showLater"
        >
          {{ showLater ? 'Peida' : `Vaata veel (${laterCount})` }}
          <ChevronDown :size="18" aria-hidden="true" class="types__chevron" :class="{ 'is-open': showLater }" />
        </button>
        <div v-show="showLater" id="home-types-later" class="types__later">
          <p class="types__later-lead">Need on veel töös ja tulevad peagi.</p>
          <ul class="types__grid" role="list" aria-label="Tulekul">
            <li v-for="(card, index) in laterCards" :key="card.id">
              <PostcardCard
                :soon="NOT_READY_LABEL"
                :title="card.title"
                :tagline="card.subtitle"
                :description="card.description"
                :icon="card.icon"
                :index="readyCards.length + featuredSoon.length + index"
              />
            </li>
            <li v-for="(item, index) in laterSoon" :key="item.id">
              <PostcardCard
                :title="item.title"
                :tagline="item.tagline"
                :description="item.description"
                :icon="iconFor(item.icon)"
                :index="readyCards.length + featuredSoon.length + laterCards.length + index"
                :soon="item.label"
                :pass="item.pass"
              />
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- The season: Christmas now, Easter or anything else later (seasonal.ts) -->
    <section v-if="promo" class="season" aria-labelledby="home-season">
      <div class="container season__inner">
        <div class="season__text">
          <h2 id="home-season"><Gift :size="22" aria-hidden="true" /> {{ promo.title }}</h2>
          <p>{{ promo.lead }}</p>
          <p class="season__note">{{ promo.note }}</p>
          <p v-if="passLeft !== null && promo.id === 'christmas'" class="season__pass">Jõulupass · kirjasarju või lugusid alles {{ passLeft }}</p>
        </div>
        <RouterLink :to="promo.to" class="btn-home btn-home--primary">
          {{ promo.cta }} <ArrowRight :size="18" aria-hidden="true" />
        </RouterLink>
      </div>
    </section>

    <!-- A returning family finds what they made -->
    <RecentCreations v-if="creations.creations.length" />

    <!-- What it looks like -->
    <section id="naidis" class="section examples" aria-labelledby="home-examples">
      <div class="container">
        <header class="home-head">
          <h2 id="home-examples" ref="examplesTitle" tabindex="-1">{{ EXAMPLES_SECTION.title }}</h2>
          <p>{{ EXAMPLES_SECTION.lead }}</p>
        </header>
        <ul class="examples__grid" role="list">
          <li v-for="example in EXAMPLES" :key="example.item.id" class="examples__item">
            <p class="examples__caption">{{ example.caption }}</p>
            <PrintableItem :item="example.item" readonly />
          </li>
        </ul>
        <RouterLink :to="SAMPLE_PAGE" class="examples__more">{{ EXAMPLES_SECTION.more }} <ArrowRight :size="16" aria-hidden="true" /></RouterLink>
      </div>
    </section>

    <!-- How it works -->
    <section class="section steps" aria-labelledby="home-steps">
      <div class="container">
        <h2 id="home-steps" class="steps__title">{{ STEPS_SECTION.title }}</h2>
        <ol class="steps__list">
          <li v-for="step in STEPS_SECTION.steps" :key="step.title">
            <strong>{{ step.title }}</strong>
            <span>{{ step.text }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- How the child's data is kept -->
    <section class="privacy" aria-labelledby="home-privacy">
      <div class="container privacy__inner">
        <Lock :size="22" aria-hidden="true" class="privacy__icon" />
        <div>
          <h2 id="home-privacy">{{ PRIVACY.title }}</h2>
          <p>
            {{ PRIVACY.text }}
            <RouterLink to="/privaatsus">{{ PRIVACY.link }}</RouterLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home {
  background: #fdf6ec;
}
h2 {
  font-weight: 600;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

// --- buttons: the same look as the current design's primary button -------------------
.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 3rem;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
}
.btn-home--primary {
  border: 0;
  background: var(--lavender);
  color: #fff;
  box-shadow: 0 6px 16px rgba(107, 90, 168, 0.25);
  &:hover {
    background: var(--lavender-ink);
  }
}
.btn-home--secondary {
  border: 2px solid var(--lavender-mid);
  background: #fff;
  color: var(--lavender-ink);
  &:hover {
    border-color: var(--lavender);
  }
}

// --- hero ----------------------------------------------------------------------
.hero {
  padding-block: clamp(1.75rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2rem);
}
.hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 3rem);
  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
  }
}
.hero__eyebrow {
  margin: 0;
  color: var(--coral-ink);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.hero h1 {
  margin: 0.6rem 0 0.9rem;
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-wrap: balance;
}
// Coral ink, not the light coral: readable on cream.
.hero__accent {
  color: var(--coral-ink);
}
.hero__lead {
  max-width: 34rem;
  margin: 0;
  color: var(--ink-soft);
  font-size: clamp(1.02rem, 1.6vw, 1.15rem);
  line-height: 1.55;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.4rem;
}
.hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.9rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--ink-soft);
  font-size: 0.9rem;
  li + li::before {
    content: '·';
    margin-right: 0.9rem;
    color: var(--ink-faint);
  }
}
.hero__art {
  position: relative;
  width: 100%;
  max-width: 380px;
  justify-self: center;
  @media (max-width: 760px) {
    max-width: 260px;
  }
  // On a phone the picture stays small, so the six kinds are only a short scroll away.
  @media (max-width: 560px) {
    max-width: 190px;
  }
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
  filter: drop-shadow(0 10px 14px rgba(84, 69, 140, 0.18));
}
.hero__name {
  font-family: var(--font-print);
  font-size: 15px;
  font-weight: 600;
  fill: #26215c;
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
  left: 36%;
  top: 2%;
  margin: 0;
  padding: 0.35rem 0.8rem;
  border: 2px solid #e3cfb4;
  border-radius: 14px 14px 14px 4px;
  background: #fff;
  font-weight: 600;
  font-size: 0.9rem;
}
.twinkle {
  animation: twinkle 1.6s ease-in-out infinite;
}
.twinkle--late {
  animation-delay: 0.8s;
}

// --- section heads --------------------------------------------------------------
.section {
  padding-block: clamp(1.75rem, 4vw, 2.75rem);
}
.home-head {
  margin-bottom: 1.25rem;
  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  }
  p {
    margin: 0.35rem 0 0;
    color: var(--ink-soft);
  }
}

// --- the six kinds --------------------------------------------------------------
.types__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
  li {
    display: flex;
  }
}

// The rest of the kinds, behind "Vaata veel".
.types__more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 1.1rem;
  padding: 0.55rem 1.1rem;
  border: 2px solid var(--lavender-mid);
  border-radius: 999px;
  background: #fff;
  color: var(--lavender-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    border-color: var(--lavender);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
}
.types__chevron {
  transition: transform 0.2s ease;
  &.is-open {
    transform: rotate(180deg);
  }
}
.types__later {
  margin-top: 1.1rem;
}
.types__later-lead {
  margin: 0 0 0.9rem;
  color: var(--ink-soft);
}

// --- season ---------------------------------------------------------------------
.season {
  padding-block: clamp(1.5rem, 3vw, 2rem);
  background: #fbe9e3;
}
.season__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
}
.season__text {
  flex: 1 1 28rem;
  min-width: 0;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.4rem;
    font-size: clamp(1.35rem, 3vw, 1.7rem);
    color: var(--coral-ink);
  }
  p {
    max-width: 40rem;
    margin: 0;
  }
}
.season__note {
  margin-top: 0.35rem !important;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
.season__pass {
  display: inline-block;
  margin-top: 0.6rem !important;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #fff;
  color: var(--coral-ink);
  font-size: 0.85rem;
  font-weight: 600;
}

// --- samples --------------------------------------------------------------------
.home-head h2:focus {
  outline: none;
}
.home-head h2:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 4px;
}
// Clear of the sticky menu when "Vaata näidist" scrolls here.
#home-examples {
  scroll-margin-top: 5.5rem;
}
.examples__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    max-width: 30rem;
  }
}
.examples__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  :deep(.paper) {
    flex: 1;
    min-height: 0;
    font-size: 0.92rem;
  }
}
.examples__caption {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.85rem;
  font-weight: 600;
}
.examples__more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1.25rem;
  color: var(--lavender-ink);
  font-weight: 600;
}

// --- steps ----------------------------------------------------------------------
.steps {
  padding-top: 0;
}
.steps__title {
  margin: 0 0 1rem;
  font-size: clamp(1.4rem, 3vw, 1.8rem);
}
.steps__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
  }
  li {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr);
    column-gap: 0.75rem;
    counter-increment: step;
    &::before {
      content: counter(step);
      grid-row: span 2;
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: var(--lavender-soft);
      color: var(--lavender-ink);
      font-weight: 700;
    }
  }
  span {
    color: var(--ink-soft);
    font-size: 0.95rem;
  }
}

// --- privacy --------------------------------------------------------------------
.privacy {
  padding-block: 1.25rem 2.5rem;
}
.privacy__inner {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: var(--sage-soft);
  h2 {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
    font-family: var(--font-body);
  }
  p {
    margin: 0;
    max-width: 52rem;
    color: var(--ink-soft);
    font-size: 0.95rem;
  }
  a {
    color: var(--sage-ink);
    font-weight: 600;
  }
}
.privacy__icon {
  flex: none;
  margin-top: 0.15rem;
  color: var(--sage-ink);
}

@keyframes float {
  50% {
    transform: rotate(-4deg) translateY(-6px);
  }
}
@keyframes twinkle {
  50% {
    opacity: 0.3;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero__envelope,
  .twinkle {
    animation: none;
  }
}
</style>
