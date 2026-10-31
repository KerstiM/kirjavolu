<script setup lang="ts">
import { computed, useId } from 'vue'
import type { OccasionId } from '../../../domain/models'
import { createRng } from '../../../domain/text/random'

/**
 * Default poster picture when no own picture is uploaded: a soft landscape drawn
 * in poster millimetres, so each sheet shows its own slice of the same scene.
 */
const props = defineProps<{ occasionId: OccasionId; widthMm: number; heightMm: number }>()
const id = `art-${useId()}`

interface Palette {
  skyTop: string
  skyBottom: string
  far: string
  near: string
  tree: string
  sparkle: string
}

const WINTER: Palette = { skyTop: '#cfdcf3', skyBottom: '#f4f1fb', far: '#e6e9f6', near: '#ffffff', tree: '#7fa387', sparkle: '#f2c46d' }
const SPRING: Palette = { skyTop: '#d7ebfb', skyBottom: '#fbf7ef', far: '#d6e8d3', near: '#bcd9b5', tree: '#6f9a76', sparkle: '#f4b6a3' }
const AUTUMN: Palette = { skyTop: '#e3d6ee', skyBottom: '#fbf2e8', far: '#f1dcc7', near: '#e6c39f', tree: '#a5755a', sparkle: '#f2c46d' }

const PALETTES: Record<OccasionId, Palette> = {
  christmas: WINTER,
  vastlapaev: WINTER,
  valentines: WINTER,
  easter: SPRING,
  summer: SPRING,
  birthday: SPRING,
  'school-start': AUTUMN,
  halloween: AUTUMN,
  'mardi-kadri': AUTUMN,
  'lost-tooth': WINTER,
  everyday: SPRING,
}

const palette = computed(() => PALETTES[props.occasionId])

const scene = computed(() => {
  const w = props.widthMm
  const h = props.heightMm
  const rng = createRng(Math.round(w * 7 + h))
  const hill = (baseY: number, amplitude: number, waves: number) => {
    let d = `M0 ${h} L0 ${baseY}`
    const segment = w / waves
    for (let i = 0; i < waves; i++) {
      const x = i * segment
      d += ` Q${x + segment / 2} ${baseY - amplitude * (0.6 + rng.next() * 0.8)} ${x + segment} ${baseY}`
    }
    return `${d} L${w} ${h} Z`
  }
  const trees = Array.from({ length: Math.round(w / 45) }, () => ({
    x: rng.next() * w,
    y: h * (0.74 + rng.next() * 0.16),
    size: 9 + rng.next() * 9,
  }))
  const sparkles = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
    x: rng.next() * w,
    y: rng.next() * h * 0.62,
    r: 1.2 + rng.next() * 2.2,
  }))
  return { far: hill(h * 0.72, h * 0.06, 3), near: hill(h * 0.84, h * 0.05, 5), trees, sparkles }
})
</script>

<template>
  <g>
    <defs>
      <linearGradient :id="id" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="palette.skyTop" />
        <stop offset="1" :stop-color="palette.skyBottom" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" :width="widthMm" :height="heightMm" :fill="`url(#${id})`" />
    <circle :cx="widthMm * 0.82" :cy="heightMm * 0.12" :r="Math.min(widthMm, heightMm) * 0.06" fill="#fff6d8" />
    <path
      v-for="(s, i) in scene.sparkles"
      :key="`s${i}`"
      :d="`M${s.x} ${s.y - s.r * 2}L${s.x + s.r * 0.6} ${s.y - s.r * 0.6}L${s.x + s.r * 2} ${s.y}L${s.x + s.r * 0.6} ${s.y + s.r * 0.6}L${s.x} ${s.y + s.r * 2}L${s.x - s.r * 0.6} ${s.y + s.r * 0.6}L${s.x - s.r * 2} ${s.y}L${s.x - s.r * 0.6} ${s.y - s.r * 0.6}Z`"
      :fill="palette.sparkle"
      opacity="0.8"
    />
    <path :d="scene.far" :fill="palette.far" />
    <g v-for="(t, i) in scene.trees" :key="`t${i}`">
      <rect :x="t.x - t.size * 0.08" :y="t.y" :width="t.size * 0.16" :height="t.size * 0.3" fill="#8a6a55" />
      <path :d="`M${t.x} ${t.y - t.size * 1.4}L${t.x + t.size * 0.55} ${t.y}L${t.x - t.size * 0.55} ${t.y}Z`" :fill="palette.tree" />
    </g>
    <path :d="scene.near" :fill="palette.near" />
  </g>
</template>
