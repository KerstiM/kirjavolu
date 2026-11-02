<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { GeneratedContent } from '../../domain/models'
import { joinList } from '../../domain/text/estonian'
import Mascot from '../../components/brand/Mascot.vue'

/**
 * A freshly made creation arrives as post: the parent opens the envelope, the first
 * letter peeks out, a little confetti, and then the preview is there to print.
 */
const props = defineProps<{ content: GeneratedContent }>()
const emit = defineEmits<{ done: [] }>()

type Stage = 'closed' | 'opening' | 'leaving'
const stage = ref<Stage>('closed')
const openButton = ref<HTMLButtonElement | null>(null)

const first = computed(() => props.content.items[0])
const addressee = computed(() => joinList(props.content.request.children.map((child) => child.name)))
const sender = computed(() => first.value?.signature?.split('\n').pop()?.trim() || 'Kirjavõlu')
const peek = computed(() => first.value?.body.split(/\n{2,}/)[0] ?? '')
// "2026-12-01" → "1.12"
const postmarkDate = computed(() => first.value?.date?.slice(5).split('-').reverse().map(Number).join('.') ?? '✦')

const COLORS = ['var(--coral)', 'var(--gold)', 'var(--lavender)', 'var(--sage)', '#e5484d']
// Pieces fly out of the envelope in a fan; fixed per mount so a re-render does not reshuffle them.
const confetti = Array.from({ length: 34 }, (_, i) => {
  const angle = -160 + (140 * i) / 33 + (Math.random() * 10 - 5)
  const distance = 150 + Math.random() * 170
  const rad = (angle * Math.PI) / 180
  return {
    x: `${Math.cos(rad) * distance}px`,
    y: `${Math.sin(rad) * distance}px`,
    spin: `${Math.round(Math.random() * 720 - 360)}deg`,
    delay: `${Math.round(Math.random() * 120)}ms`,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  }
})

const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let timers: ReturnType<typeof setTimeout>[] = []

function finish(): void {
  if (stage.value === 'leaving') return
  stage.value = 'leaving'
  timers.push(setTimeout(() => emit('done'), reducedMotion ? 0 : 350))
}

function open(): void {
  if (stage.value !== 'closed') return
  if (reducedMotion) return finish()
  stage.value = 'opening'
  timers.push(setTimeout(finish, 2600))
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') finish()
}

onMounted(() => {
  document.body.classList.add('has-reveal')
  document.addEventListener('keydown', onKey)
  openButton.value?.focus()
})
onBeforeUnmount(() => {
  document.body.classList.remove('has-reveal')
  document.removeEventListener('keydown', onKey)
  timers.forEach(clearTimeout)
  timers = []
})
</script>

<template>
  <div class="reveal no-print" :class="`is-${stage}`" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
    <p id="reveal-title" class="reveal__title">
      {{ stage === 'closed' ? 'Sulle on post!' : 'Valmis! Kiri on teel.' }}
    </p>

    <div class="stage">
      <div class="burst" aria-hidden="true">
        <span
          v-for="(piece, i) in confetti"
          :key="i"
          class="burst__piece"
          :class="{ 'is-round': piece.round }"
          :style="{ '--x': piece.x, '--y': piece.y, '--spin': piece.spin, '--delay': piece.delay, background: piece.color }"
        />
      </div>

      <button ref="openButton" type="button" class="envelope" :disabled="stage !== 'closed'" @click="open">
        <span class="visually-hidden">Ava ümbrik</span>
        <span class="envelope__back" aria-hidden="true" />
        <span class="letter" aria-hidden="true">
          <span v-if="first" class="letter__label">{{ first.label }}</span>
          <span v-if="first" class="letter__heading">{{ first.heading }}</span>
          <span class="letter__body">{{ peek }}</span>
        </span>
        <span class="envelope__front" aria-hidden="true" />
        <span class="address" aria-hidden="true">
          <span class="address__name">{{ addressee }}</span>
          <span class="address__from">Saatja: {{ sender }}</span>
        </span>
        <span class="envelope__flap" aria-hidden="true" />
        <span class="stamp" aria-hidden="true">
          <span class="stamp__art">★</span>
        </span>
        <span class="postmark" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <defs><path id="postmark-ring" d="M50 14 a36 36 0 1 1 -0.1 0" /></defs>
            <circle cx="50" cy="50" r="46" />
            <circle cx="50" cy="50" r="28" />
            <text><textPath href="#postmark-ring">KIRJAVÕLU · VÕLUPOST ·</textPath></text>
            <text x="50" y="56" text-anchor="middle" class="postmark__mid">{{ postmarkDate }}</text>
          </svg>
        </span>
        <span class="seal" aria-hidden="true">★</span>
      </button>
      <Mascot :mood="stage === 'closed' ? 'wave' : 'happy'" :size="84" class="reveal__mascot" />
    </div>

    <p class="reveal__hint" aria-hidden="true">{{ stage === 'closed' ? 'Vajuta ümbrikule' : ' ' }}</p>
    <button type="button" class="reveal__skip" @click="finish">Jäta vahele</button>
  </div>
</template>

<style scoped lang="scss">
.reveal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 1rem;
  background:
    radial-gradient(40rem 26rem at 50% 45%, rgba(242, 196, 109, 0.35), transparent 70%),
    rgba(42, 36, 51, 0.82);
  backdrop-filter: blur(6px);
  animation: reveal-in 0.3s ease-out;
  transition: opacity 0.35s ease;
  overflow: hidden;
  &.is-leaving {
    opacity: 0;
    pointer-events: none;
  }
}
@keyframes reveal-in {
  from {
    opacity: 0;
  }
}
.reveal__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 6vw, 2.6rem);
  font-weight: 600;
  color: #fff;
  text-align: center;
  animation: title-pop 0.5s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.is-opening .reveal__title {
  animation: title-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes title-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
}
.reveal__hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
}
.reveal__skip {
  position: absolute;
  top: 1rem;
  right: 1rem;
  min-height: 2.75rem;
  padding: 0.4rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  &:focus-visible {
    outline: 3px solid var(--gold);
    outline-offset: 2px;
  }
}

.stage {
  position: relative;
  width: min(92vw, 400px);
  aspect-ratio: 8 / 5;
  margin-top: clamp(5rem, 16vh, 8rem);
  perspective: 900px;
}

// --- envelope -------------------------------------------------------------
$paper: #f6e7cf;
$paper-dark: #e9d3b0;

.envelope {
  position: absolute;
  inset: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transform-style: preserve-3d;
  animation: wiggle 2.4s 0.6s ease-in-out infinite;
  &:focus-visible {
    outline: 3px solid var(--gold);
    outline-offset: 8px;
    border-radius: 10px;
  }
  &:disabled {
    cursor: default;
    animation: none;
  }
}
@keyframes wiggle {
  0%,
  70%,
  100% {
    transform: rotate(0) translateY(0);
  }
  76% {
    transform: rotate(-3deg) translateY(-6px);
  }
  82% {
    transform: rotate(3deg) translateY(-6px);
  }
  88% {
    transform: rotate(-2deg) translateY(-3px);
  }
}
.envelope__back {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: $paper-dark;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.35);
}
.envelope__front {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 10px;
  // The pocket: the whole front except the opening under the flap.
  clip-path: polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%);
  background: $paper;
}
.envelope__flap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 50%;
  z-index: 4;
  background: linear-gradient(to bottom, #f3dfbf, $paper-dark);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  border-radius: 10px 10px 0 0;
  transform-origin: top;
  transition: transform 0.55s cubic-bezier(0.5, 0, 0.3, 1), z-index 0s 0.27s;
}
.is-opening .envelope__flap,
.is-leaving .envelope__flap {
  transform: rotateX(180deg);
  z-index: 1;
}

.seal {
  position: absolute;
  z-index: 5;
  left: 50%;
  top: 50%;
  width: 3.4rem;
  height: 3.4rem;
  margin: -1.7rem 0 0 -1.7rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #e86a5a, #b8322a 60%, #8f2019);
  box-shadow:
    0 0 0 4px rgba(184, 50, 42, 0.35),
    0 4px 10px rgba(0, 0, 0, 0.3);
  color: rgba(255, 230, 220, 0.9);
  font-size: 1.45rem;
  line-height: 1;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  animation: seal-pulse 1.6s ease-in-out infinite;
  transition:
    transform 0.25s ease-in,
    opacity 0.25s ease-in;
}
@keyframes seal-pulse {
  50% {
    box-shadow:
      0 0 0 10px rgba(242, 196, 109, 0.35),
      0 4px 10px rgba(0, 0, 0, 0.3);
  }
}
// Once the flap is up, the stamp is just part of the pocket the letter slides out of.
.is-opening .stamp,
.is-opening .postmark,
.is-leaving .stamp,
.is-leaving .postmark {
  z-index: 3;
}
.is-opening .seal,
.is-leaving .seal {
  animation: none;
  transform: scale(1.5) rotate(25deg);
  opacity: 0;
}

.stamp {
  position: absolute;
  z-index: 5;
  top: 10%;
  right: 6%;
  width: 3.2rem;
  height: 3.8rem;
  padding: 4px;
  background: #fff;
  // Perforated edge.
  mask: radial-gradient(circle 3px at 3px 3px, transparent 98%, #000) -3px -3px / 8px 8px;
  transform: rotate(4deg);
}
.stamp__art {
  display: grid;
  place-items: center;
  height: 100%;
  background: linear-gradient(160deg, var(--lavender), #3d6b52);
  color: var(--gold);
  font-size: 1.6rem;
}
.postmark {
  position: absolute;
  z-index: 5;
  top: 8%;
  right: 15%;
  width: 4.6rem;
  opacity: 0.55;
  transform: rotate(-14deg);
  svg {
    display: block;
    fill: none;
    stroke: #6b3d33;
    stroke-width: 2;
  }
  text {
    fill: #6b3d33;
    stroke: none;
    font-family: var(--font-body);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .postmark__mid {
    font-size: 13px;
  }
}
.address {
  position: absolute;
  z-index: 3;
  left: 10%;
  right: 10%;
  bottom: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4a3b33;
  font-family: var(--font-print);
  line-height: 1.25;
}
.address__name {
  font-size: clamp(1.15rem, 4.5vw, 1.45rem);
  font-weight: 600;
  text-align: center;
}
.address__from {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

// --- letter ----------------------------------------------------------------
.letter {
  position: absolute;
  z-index: 2;
  left: 7%;
  right: 7%;
  top: 6%;
  height: 88%;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.9rem 1.1rem;
  border-radius: 6px;
  background: #fffdf8;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  color: var(--ink);
  text-align: left;
  font-family: var(--font-print);
  overflow: hidden;
}
.is-opening .letter,
.is-leaving .letter {
  animation: letter-out 0.8s 0.45s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
}
@keyframes letter-out {
  60% {
    z-index: 2;
  }
  100% {
    z-index: 6;
    transform: translateY(-55%) rotate(-2deg) scale(1.04);
  }
}
.letter__label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--coral-ink);
}
.letter__heading {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--lavender-ink);
}
.letter__body {
  font-size: 0.85rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// The little envelope brought the big one and waves beside it.
.reveal__mascot {
  position: absolute;
  z-index: 8;
  left: -9%;
  bottom: -24%;
  animation: mascot-in 0.5s 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  pointer-events: none;
}
@keyframes mascot-in {
  from {
    transform: translate(-30px, 30px) rotate(-15deg);
    opacity: 0;
  }
}

// --- confetti ----------------------------------------------------------------
.burst {
  position: absolute;
  left: 50%;
  top: 30%;
  z-index: 7;
  pointer-events: none;
}
.burst__piece {
  position: absolute;
  width: 8px;
  height: 13px;
  border-radius: 2px;
  opacity: 0;
  &.is-round {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
}
.is-opening .burst__piece {
  animation: confetti 1.5s cubic-bezier(0.15, 0.7, 0.35, 1) forwards;
    animation-delay: calc(0.75s + var(--delay));
}
@keyframes confetti {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0) scale(0.4);
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(var(--x), calc(var(--y) + 140px)) rotate(var(--spin)) scale(1);
  }
}
</style>
