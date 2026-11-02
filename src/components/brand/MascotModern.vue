<script setup lang="ts">
import type { MascotMood } from './mascot'

/**
 * The mascot in the new design: the same envelope character, drawn simpler. Flat colours,
 * crisp corners and the folds every envelope has (the flap and the two lower seams), so it
 * reads as an envelope first; short arms and legs without hands or shoes.
 */
withDefaults(defineProps<{ mood?: MascotMood; size?: number }>(), { mood: 'wave', size: 72 })
</script>

<template>
  <svg
    class="mascot"
    :class="`mascot--${mood}`"
    :width="size"
    :height="(size * 140) / 130"
    viewBox="0 0 130 140"
    aria-hidden="true"
    focusable="false"
  >
    <g class="mascot__body">
      <rect class="mascot__leg" x="42" y="104" width="10" height="22" rx="5" />
      <rect class="mascot__leg" x="78" y="104" width="10" height="22" rx="5" />

      <!-- arms: one waves, both cheer, one at the chin while thinking -->
      <g v-if="mood === 'wave'">
        <path class="mascot__arm" d="M16 78 L6 92" />
        <path class="mascot__arm mascot__wave" d="M114 72 L124 52" />
      </g>
      <g v-else-if="mood === 'happy'">
        <path class="mascot__arm" d="M16 70 L6 50" />
        <path class="mascot__arm" d="M114 70 L124 50" />
      </g>
      <g v-else-if="mood === 'think'">
        <path class="mascot__arm" d="M16 80 L6 94" />
        <path class="mascot__arm" d="M114 74 Q124 62 112 52" />
      </g>
      <g v-else>
        <path class="mascot__arm" d="M16 70 L4 60" />
        <path class="mascot__arm" d="M114 70 L126 60" />
      </g>

      <!-- the envelope: body, the two lower seams, the flap and its seal -->
      <rect class="mascot__paper" x="14" y="28" width="102" height="82" rx="6" />
      <path class="mascot__seam" d="M17 107 L44 86 M113 107 L86 86" />
      <path class="mascot__flap" d="M16 31 Q16 29 18 29 L112 29 Q114 29 114 31 L65 66 Z" />
      <circle class="mascot__seal" cx="65" cy="64" r="6.5" />

      <circle class="mascot__cheek" cx="35" cy="92" r="5" />
      <circle class="mascot__cheek" cx="95" cy="92" r="5" />

      <!-- eyes -->
      <g v-if="mood === 'happy'" class="mascot__line">
        <path d="M41 84 Q46 78 51 84" />
        <path d="M79 84 Q84 78 89 84" />
      </g>
      <g v-else-if="mood === 'surprised'" class="mascot__ink">
        <circle cx="46" cy="83" r="5.5" />
        <circle cx="84" cy="83" r="5.5" />
      </g>
      <g v-else class="mascot__ink mascot__blink">
        <circle cx="46" cy="83" r="4.5" />
        <circle cx="84" cy="83" r="4.5" />
      </g>

      <!-- mouth -->
      <ellipse v-if="mood === 'surprised'" class="mascot__ink" cx="65" cy="95" rx="3.5" ry="4.5" />
      <path v-else-if="mood === 'think'" class="mascot__line" d="M59 95 Q66 96 71 92" />
      <path v-else-if="mood === 'happy'" class="mascot__ink" d="M57 90 Q65 101 73 90 Z" />
      <path v-else class="mascot__line" d="M58 91 Q65 98 72 91" />
    </g>

    <g v-if="mood === 'happy'" class="mascot__sparkles">
      <path d="M26 8 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
      <path d="M104 4 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
    </g>
    <g v-if="mood === 'think'" class="mascot__dots">
      <circle cx="98" cy="18" r="3" />
      <circle cx="86" cy="10" r="4" />
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
  fill: var(--lavender-light, #7d6cbd);
}
.mascot__flap {
  fill: #b3a8e6;
}
.mascot__seam {
  fill: none;
  stroke: #b3a8e6;
  stroke-width: 3;
  stroke-linecap: round;
}
.mascot__seal {
  fill: var(--coral, #e07a5f);
}
.mascot__leg {
  fill: #3c3489;
}
.mascot__arm {
  fill: none;
  stroke: #3c3489;
  stroke-width: 7;
  stroke-linecap: round;
}
.mascot__cheek {
  fill: #f0997b;
}
.mascot__ink {
  fill: #221c4a;
}
.mascot__line {
  fill: none;
  stroke: #221c4a;
  stroke-width: 3.5;
  stroke-linecap: round;
}
.mascot__sparkles {
  fill: var(--gold, #f2c46d);
  animation: twinkle 1.2s ease-in-out infinite;
}
.mascot__dots {
  fill: #b3a8e6;
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
@media (prefers-reduced-motion: reduce) {
  .mascot__body,
  .mascot__wave,
  .mascot__blink,
  .mascot__sparkles {
    animation: none !important;
  }
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
