<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import type { ContentType } from '../../domain/models'
import { iconFor } from '../../components/ui/icons'

defineProps<{ type: ContentType; tone: 'lavender' | 'coral' | 'sage' | 'gold' }>()
</script>

<template>
  <RouterLink :to="{ path: '/loo', query: { tyyp: type.id } }" class="type-card" :class="`tone-${tone}`">
    <span class="type-card__icon" aria-hidden="true">
      <component :is="iconFor(type.icon)" :size="26" :stroke-width="1.7" />
    </span>
    <span class="type-card__body">
      <span class="type-card__title">{{ type.title }}</span>
      <span class="type-card__tagline">{{ type.tagline }}</span>
      <span class="type-card__desc">{{ type.description }}</span>
    </span>
    <ArrowRight class="type-card__arrow" :size="20" aria-hidden="true" />
  </RouterLink>
</template>

<style scoped lang="scss">
.type-card {
  position: relative;
  display: flex;
  gap: 1rem;
  height: 100%;
  padding: 1.35rem 1.35rem 1.35rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ink);
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lift);
    border-color: var(--tone-mid);
  }
  &:hover .type-card__arrow {
    transform: translateX(3px);
    color: var(--tone-ink);
  }
}
.tone-lavender {
  --tone-soft: var(--lavender-soft);
  --tone-ink: var(--lavender-ink);
  --tone-mid: var(--lavender-mid);
}
.tone-coral {
  --tone-soft: var(--coral-soft);
  --tone-ink: var(--coral-ink);
  --tone-mid: #f3c6b8;
}
.tone-sage {
  --tone-soft: var(--sage-soft);
  --tone-ink: var(--sage-ink);
  --tone-mid: #c3d7c6;
}
.tone-gold {
  --tone-soft: var(--gold-soft);
  --tone-ink: #8a5f10;
  --tone-mid: #f0d9a3;
}
.type-card__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 16px;
  background: var(--tone-soft);
  color: var(--tone-ink);
}
.type-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-right: 1.25rem;
}
.type-card__title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
}
.type-card__tagline {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tone-ink);
}
.type-card__desc {
  font-size: 0.93rem;
  color: var(--ink-soft);
  line-height: 1.5;
}
.type-card__arrow {
  position: absolute;
  top: 1.35rem;
  right: 1.2rem;
  color: var(--ink-faint);
  transition: transform 0.2s ease;
}
</style>
