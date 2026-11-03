<script setup lang="ts">
import { computed, provide } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Eye, Gift } from 'lucide-vue-next'
import Mascot from '../../../components/brand/Mascot.vue'
import PostcardCard from '../../../components/brand/PostcardCard.vue'
import StampCard from '../../../components/brand/StampCard.vue'
import TestBar from '../../../components/brand/TestBar.vue'
import { DESIGN_KEY, designPath, NEW_DESIGN_ROOT, STAMP_COLORS } from '../../../components/brand/design'
import { iconFor } from '../../../components/ui/icons'
import { CONTENT_TYPES } from '../../../domain/contentTypes'
import { OCCASIONS } from '../../../domain/occasions/occasions'
import { isInSeason, sortBySeason } from '../../../domain/occasions/season'
import { useChildrenStore } from '../../children/childrenStore'
import RecentCreations from '../RecentCreations.vue'
import { COMING_SOON, isReady, NOT_READY_LABEL, PASS_MARK } from './readiness'
import PassComparison from '../../pass/PassComparison.vue'
import { isActive, loadPass, PASS_PRICE } from '../../pass/seasonPass'

/**
 * Test view of the new home page design (/uus-disain). The current home page at "/"
 * stays as it is until this one is chosen; the links lead into the same wizard.
 */
provide(DESIGN_KEY, 'new')
const childrenStore = useChildrenStore()
const occasions = computed(() => sortBySeason(OCCASIONS))
// The envelope in the picture is addressed to the family's own child when there is one.
const addressee = computed(() => childrenStore.children[0]?.name ?? 'Mia')

// The Jõulupass is offered right under the hero; a family that has one goes straight to it.
const pass = loadPass()
const hasPass = pass !== null && isActive(pass)

// Every link leads into the new-design wizard, so the whole new journey can be tried.
const WIZARD = designPath('new', '/loo')
</script>

<template>
  <div class="home-new">
    <TestBar text="Testvaade: uus avalehe disain." link="Vaata praegust avalehte" to="/" />

    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__text">
          <span class="hero__tag">Võlupost igaks päevaks</span>
          <h1>Kiri, mis teab <span class="hero__accent">sinu lapse</span> nime.</h1>
          <p class="hero__lead">
            Jõulukirjad, sünnipäevaseiklused, aardejahid ja hambahaldja kirjad. Valmis kahe klõpsuga – prindi ja peida.
          </p>
          <div class="hero__actions">
            <RouterLink :to="WIZARD" class="chunky chunky--primary">Alusta loomist <ArrowRight :size="18" aria-hidden="true" /></RouterLink>
            <RouterLink :to="designPath('new', '/naide')" class="chunky chunky--secondary"><Eye :size="18" aria-hidden="true" /> Vaata näidet</RouterLink>
          </div>
        </div>

        <div class="hero__art" aria-hidden="true">
          <svg viewBox="0 0 300 240" class="hero__svg">
            <path d="M40 60 C90 10 170 20 200 70" fill="none" stroke="#e8836b" stroke-width="2" stroke-dasharray="4 6" />
            <circle cx="40" cy="60" r="4" fill="#f2c46d" />
            <path class="twinkle" d="M250 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#f2c46d" />
            <path class="twinkle twinkle--late" d="M30 150 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#b8aee6" />
            <!-- The same envelope as the mascot: one lavender envelope in two tones. -->
            <g class="hero__envelope">
              <rect x="100" y="70" width="180" height="120" rx="10" fill="#afa9ec" />
              <path d="M104 186 L148 152 M276 186 L232 152" fill="none" stroke="#7f77dd" stroke-width="4" stroke-linecap="round" />
              <path d="M100 82 Q100 70 112 70 L268 70 Q280 70 280 82 L190 134 Z" fill="#7f77dd" />
              <circle cx="190" cy="132" r="11" fill="#d85a30" />
              <rect x="240" y="80" width="26" height="32" rx="2" fill="#fff" />
              <path d="M253 88 l2 4 4.5.5-3.3 3 .9 4.5-4.1-2.2-4.1 2.2.9-4.5-3.3-3 4.5-.5z" fill="#d85a30" />
              <text x="190" y="170" text-anchor="middle" class="hero__name">{{ addressee }}</text>
            </g>
          </svg>
          <Mascot mood="wave" :size="120" class="hero__mascot" />
          <p class="hero__bubble">Sulle on post!</p>
        </div>
      </div>
    </section>

    <section class="section pass-band" aria-labelledby="pass-band-title">
      <div class="container pass-band__inner">
        <div class="pass-band__text">
          <h2 id="pass-band-title"><Gift :size="24" aria-hidden="true" /> Jõulupass</h2>
          <p v-if="hasPass">
            Sul on Jõulupass, kirjasarju või lugusid alles {{ pass?.generationsLeft }}. Päkapikk kirjutab kõik 24 detsembrikirja sinu
            lapse, tema pere ja selle detsembri plaanide järgi.
          </p>
          <p v-else>
            Päkapikk kirjutab kõik 24 detsembrikirja päriselt sinu lapse kohta: tema huvid, pere, lemmikloomad
            ja selle detsembri plaanid. Kehtib 31. jaanuarini, ühekordne makse {{ PASS_PRICE }}.
          </p>
        </div>
        <RouterLink :to="`${NEW_DESIGN_ROOT}/joulupass`" class="chunky chunky--primary">
          {{ hasPass ? 'Kirjuta isiklikud kirjad' : 'Vaata Jõulupassi' }} <ArrowRight :size="18" aria-hidden="true" />
        </RouterLink>
      </div>
      <div v-if="!hasPass" class="container pass-band__compare">
        <PassComparison />
      </div>
    </section>

    <section class="section" aria-labelledby="new-types-title">
      <div class="container">
        <h2 id="new-types-title" class="section-title">Mida meisterdame?</h2>
        <ul class="postcards" role="list">
          <li v-for="(type, index) in CONTENT_TYPES" :key="type.id">
            <PostcardCard
              :to="isReady(type.id) ? { path: WIZARD, query: { tyyp: type.id } } : undefined"
              :title="type.title"
              :tagline="type.tagline"
              :description="type.description"
              :icon="iconFor(type.icon)"
              :index="index"
              :soon="isReady(type.id) ? '' : NOT_READY_LABEL"
              :pass="PASS_MARK[type.id]"
            />
          </li>
          <li v-for="(item, index) in COMING_SOON" :key="item.id">
            <PostcardCard
              :title="item.title"
              :tagline="item.tagline"
              :description="item.description"
              :icon="iconFor(item.icon)"
              :index="CONTENT_TYPES.length + index"
              :soon="item.label"
              pass="only"
            />
          </li>
        </ul>
      </div>
    </section>

    <section class="section stamps-section" aria-labelledby="new-occasions-title">
      <div class="container">
        <h2 id="new-occasions-title" class="section-title">Mis puhul?</h2>
        <ul class="stamps" role="list">
          <li v-for="(occasion, index) in occasions" :key="occasion.id">
            <StampCard
              :to="{ path: WIZARD, query: { puhk: occasion.id } }"
              :name="occasion.name"
              :when="occasion.when"
              :icon="iconFor(occasion.icon)"
              :color="STAMP_COLORS[occasion.id]"
              :index="index"
              :badge="isInSeason(occasion.id) ? 'Praegu' : ''"
            />
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
  transition: background 0.15s ease, border-color 0.15s ease;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
}
// The same as the primary button in the current design.
.chunky--primary {
  background: var(--lavender);
  color: #fff;
  box-shadow: 0 6px 16px rgba(107, 90, 168, 0.25);
  &:hover {
    background: var(--lavender-ink);
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

// --- Jõulupass -----------------------------------------------------------------
.pass-band {
  padding-block: 1.75rem;
  background: #fbe9e3;
  border-bottom: 2px dashed #ecd9bf;
}
.pass-band__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
}
.pass-band__compare {
  margin-top: 1.25rem;
}
.pass-band__text {
  flex: 1 1 28rem;
  min-width: 0;
  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.4rem;
    font-size: 1.4rem;
    color: var(--coral-ink);
  }
  p {
    margin: 0;
    max-width: 62ch;
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
// --- stamps -----------------------------------------------------------------
.stamps-section {
  background: #f6ead9;
  border-top: 2px dashed #ecd9bf;
}
.stamps {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(9.5rem, calc(50% - 0.6rem)), 1fr));
  gap: 1.1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
