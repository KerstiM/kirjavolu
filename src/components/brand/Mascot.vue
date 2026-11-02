<script setup lang="ts">
import type { MascotMood } from './mascot'
import { useDesign } from './design'
import MascotModern from './MascotModern.vue'

/**
 * Kirjavõlu's mascot: the envelope from the logo with eyes, arms and legs.
 * It suits every occasion, from Christmas to a lost tooth. The mood changes
 * the face, the arms and how it moves.
 */
withDefaults(defineProps<{ mood?: MascotMood; size?: number }>(), { mood: 'wave', size: 72 })
// The new design draws the same character simpler.
const design = useDesign()
</script>

<template>
  <MascotModern v-if="design === 'new'" :mood="mood" :size="size" />
  <svg
    v-else
    class="mascot"
    :class="`mascot--${mood}`"
    :width="size"
    :height="(size * 140) / 130"
    viewBox="0 0 130 140"
    aria-hidden="true"
    focusable="false"
  >
    <g class="mascot__body">
      <!-- legs and shoes -->
      <path class="mascot__limb" d="M48 108 L46 126" />
      <path class="mascot__limb" d="M82 108 L84 126" />
      <ellipse class="mascot__shoe" cx="42" cy="128" rx="9" ry="5.5" />
      <ellipse class="mascot__shoe" cx="88" cy="128" rx="9" ry="5.5" />

      <!-- arms: one waves, both cheer, one scratches the head while thinking -->
      <g v-if="mood === 'wave'">
        <path class="mascot__limb" d="M16 76 Q6 84 8 96" />
        <g class="mascot__wave">
          <path class="mascot__limb" d="M114 70 Q124 60 122 46" />
          <circle class="mascot__hand" cx="122" cy="42" r="6.5" />
        </g>
        <circle class="mascot__hand" cx="8" cy="99" r="6.5" />
      </g>
      <g v-else-if="mood === 'happy'" class="mascot__cheer">
        <path class="mascot__limb" d="M16 70 Q6 58 10 42" />
        <path class="mascot__limb" d="M114 70 Q124 58 120 42" />
        <circle class="mascot__hand" cx="10" cy="38" r="6.5" />
        <circle class="mascot__hand" cx="120" cy="38" r="6.5" />
      </g>
      <g v-else-if="mood === 'think'">
        <path class="mascot__limb" d="M16 78 Q6 88 10 98" />
        <path class="mascot__limb" d="M114 66 Q126 50 112 34" />
        <circle class="mascot__hand" cx="10" cy="101" r="6.5" />
        <circle class="mascot__hand" cx="110" cy="31" r="6.5" />
      </g>
      <g v-else>
        <path class="mascot__limb" d="M16 70 Q2 64 4 52" />
        <path class="mascot__limb" d="M114 70 Q128 64 126 52" />
        <circle class="mascot__hand" cx="4" cy="48" r="6.5" />
        <circle class="mascot__hand" cx="126" cy="48" r="6.5" />
      </g>

      <!-- the envelope -->
      <rect class="mascot__paper" x="16" y="30" width="98" height="80" rx="14" />
      <path class="mascot__flap" d="M20 36 L65 70 L110 36" />
      <path class="mascot__heart" d="M65 77 C58 72 57 65 61.5 63.5 C63.5 63 65 64.5 65 66 C65 64.5 66.5 63 68.5 63.5 C73 65 72 72 65 77 Z" />

      <circle class="mascot__cheek" cx="34" cy="96" r="6" />
      <circle class="mascot__cheek" cx="96" cy="96" r="6" />

      <!-- eyes -->
      <g v-if="mood === 'happy'" class="mascot__line">
        <path d="M38 88 Q44 80 50 88" />
        <path d="M80 88 Q86 80 92 88" />
      </g>
      <g v-else-if="mood === 'think'" class="mascot__ink">
        <circle cx="47" cy="84" r="4.5" />
        <circle cx="87" cy="84" r="4.5" />
      </g>
      <g v-else-if="mood === 'surprised'" class="mascot__ink">
        <circle cx="44" cy="87" r="6.5" />
        <circle cx="86" cy="87" r="6.5" />
        <circle class="mascot__glint" cx="46" cy="85" r="2.2" />
        <circle class="mascot__glint" cx="88" cy="85" r="2.2" />
      </g>
      <g v-else class="mascot__ink mascot__blink">
        <circle cx="44" cy="88" r="5" />
        <circle cx="86" cy="88" r="5" />
        <circle class="mascot__glint" cx="45.5" cy="86.5" r="1.6" />
        <circle class="mascot__glint" cx="87.5" cy="86.5" r="1.6" />
      </g>

      <!-- mouth -->
      <ellipse v-if="mood === 'surprised'" class="mascot__mouth" cx="65" cy="98" rx="4.5" ry="5.5" />
      <path v-else-if="mood === 'think'" class="mascot__line" d="M58 98 Q66 99 73 94" />
      <path v-else-if="mood === 'happy'" class="mascot__mouth" d="M54 93 Q65 108 76 93 Z" />
      <path v-else class="mascot__line" d="M57 94 Q65 102 73 94" />
    </g>

    <g v-if="mood === 'happy'" class="mascot__sparkles">
      <path d="M26 6 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
      <path d="M104 4 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
    </g>
    <g v-if="mood === 'think'" class="mascot__dots">
      <circle cx="96" cy="20" r="3" />
      <circle cx="84" cy="12" r="4" />
      <circle cx="70" cy="6" r="5" />
    </g>
  </svg>
</template>

<style scoped lang="scss">
.mascot {
  display: block;
  overflow: visible;
  flex-shrink: 0;
}
.mascot__paper {
  fill: #fffaf3;
  stroke: #e3cfb4;
  stroke-width: 3;
}
.mascot__flap {
  fill: #f8ecdb;
  stroke: #e8836b;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.mascot__heart {
  fill: #e8836b;
}
.mascot__limb {
  fill: none;
  stroke: #4a3b44;
  stroke-width: 4;
  stroke-linecap: round;
}
.mascot__hand {
  fill: #fffaf3;
  stroke: #4a3b44;
  stroke-width: 3;
}
.mascot__shoe {
  fill: var(--lavender, #6b5aa8);
}
.mascot__cheek {
  fill: #f2a08f;
  opacity: 0.6;
}
.mascot__ink {
  fill: #3a2c33;
}
.mascot__glint {
  fill: #fff;
}
.mascot__line {
  fill: none;
  stroke: #3a2c33;
  stroke-width: 4;
  stroke-linecap: round;
}
.mascot__mouth {
  fill: #8a3b3b;
}
.mascot__sparkles {
  fill: var(--gold, #f2c46d);
  animation: twinkle 1.2s ease-in-out infinite;
}
.mascot__dots {
  fill: #fff;
  stroke: var(--line-strong, #d9cfc2);
  stroke-width: 1.5;
}

// --- moves ---------------------------------------------------------------
.mascot__body {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.mascot--wave .mascot__body,
.mascot--think .mascot__body {
  animation: bob 3s ease-in-out infinite;
}
.mascot--happy .mascot__body {
  animation: hop 0.9s cubic-bezier(0.3, 0, 0.3, 1) 2;
}
.mascot--surprised .mascot__body {
  animation: jolt 0.4s ease-out;
}
.mascot__wave {
  transform-box: fill-box;
  transform-origin: 0% 100%;
  animation: wave 1.6s ease-in-out infinite;
}
.mascot__blink {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 4.5s infinite;
}
@keyframes bob {
  50% {
    transform: translateY(-3px) rotate(-2deg);
  }
}
@keyframes hop {
  40% {
    transform: translateY(-14px) scale(1.04, 0.97);
  }
  70% {
    transform: translateY(0) scale(1.05, 0.94);
  }
}
@keyframes jolt {
  30% {
    transform: translateY(-8px) scale(1.06);
  }
}
@keyframes wave {
  0%,
  60%,
  100% {
    transform: rotate(0);
  }
  15%,
  45% {
    transform: rotate(-22deg);
  }
  30% {
    transform: rotate(10deg);
  }
}
@keyframes blink {
  0%,
  94%,
  100% {
    transform: scaleY(1);
  }
  96% {
    transform: scaleY(0.1);
  }
}
@keyframes twinkle {
  50% {
    opacity: 0.4;
  }
}
</style>
