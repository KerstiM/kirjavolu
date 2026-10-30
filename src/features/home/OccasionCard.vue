<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Occasion } from '../../domain/models'
import { iconFor } from '../../components/ui/icons'
import { isInSeason } from '../../domain/occasions/season'

const props = defineProps<{ occasion: Occasion }>()
const inSeason = isInSeason(props.occasion.id)
</script>

<template>
  <article class="occasion" :class="{ 'is-season': inSeason }">
    <header class="occasion__head">
      <span class="occasion__icon" aria-hidden="true">
        <component :is="iconFor(occasion.icon)" :size="22" :stroke-width="1.7" />
      </span>
      <div>
        <h3 class="occasion__name">
          <RouterLink :to="{ path: '/loo', query: { puhk: occasion.id } }" class="occasion__link">
            {{ occasion.name }}
          </RouterLink>
        </h3>
        <p class="occasion__when">
          {{ occasion.when }}<span v-if="inSeason" class="season-badge">Praegu hooajal</span>
        </p>
      </div>
    </header>
    <p class="occasion__desc">{{ occasion.description }}</p>
    <ul class="occasion__ideas" role="list" :aria-label="`${occasion.name}: ideed`">
      <li v-for="idea in occasion.ideas" :key="idea.label">
        <RouterLink :to="{ path: '/loo', query: { puhk: occasion.id, tyyp: idea.type } }" class="idea">
          {{ idea.label }}
        </RouterLink>
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
.occasion {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  padding: 1.15rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: var(--shadow);
    transform: translateY(-2px);
  }
  &.is-season {
    border-color: #f0d9a3;
    background: linear-gradient(180deg, #fffaf0, var(--surface) 60%);
  }
}
.occasion__head {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.occasion__icon {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: var(--sage-soft);
  color: var(--sage-ink);
  flex-shrink: 0;
  .is-season & {
    background: var(--gold-soft);
    color: #8a5f10;
  }
}
.occasion__name {
  font-size: 1.1rem;
  margin: 0;
}
.occasion__link {
  color: var(--ink);
  text-decoration: none;
  // Whole card is clickable via the heading link.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius);
  }
  &:focus-visible {
    outline: none;
    &::after {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
  }
}
.occasion__when {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.season-badge {
  margin-left: 0.4rem;
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  background: var(--gold-soft);
  color: #7a5410;
  font-size: 0.75rem;
  font-weight: 600;
}
.occasion__desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--ink-soft);
  line-height: 1.5;
}
.occasion__ideas {
  list-style: none;
  padding: 0;
  margin: auto 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.idea {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
  transition: all 0.15s ease;
  &:hover {
    background: var(--lavender-soft);
    border-color: var(--lavender-mid);
    color: var(--lavender-ink);
  }
}
</style>
