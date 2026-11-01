<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Eye, Users } from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import { CONTENT_TYPES } from '../../domain/contentTypes'
import { OCCASIONS } from '../../domain/occasions/occasions'
import { sortBySeason } from '../../domain/occasions/season'
import { useChildrenStore } from '../children/childrenStore'
import ContentTypeCard from './ContentTypeCard.vue'
import OccasionCard from './OccasionCard.vue'
import RecentCreations from './RecentCreations.vue'
import HeroIllustration from './HeroIllustration.vue'

const childrenStore = useChildrenStore()
const occasions = computed(() => sortBySeason(OCCASIONS))
const tones = ['lavender', 'coral', 'sage', 'gold', 'coral', 'lavender'] as const
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__text">
          <span class="eyebrow">Kirjad · seiklused · mängud</span>
          <h1>Väikesed maagilised hetked sinu lapsele.</h1>
          <p class="hero__lead">
            Loo personaalseid kirju, seiklusi, mänge ja muinasjutte, mis arvestavad just sinu lapse huvidega.
          </p>
          <div class="hero__actions">
            <BaseButton to="/loo" size="lg">
              Alusta loomist
              <ArrowRight aria-hidden="true" />
            </BaseButton>
            <BaseButton to="/naide" variant="secondary" size="lg">
              <Eye aria-hidden="true" />
              Vaata näidet
            </BaseButton>
            <BaseButton v-if="childrenStore.children.length" to="/lapsed" variant="ghost" size="lg">
              <Users aria-hidden="true" />
              Laste profiilid
            </BaseButton>
          </div>
          <p v-if="childrenStore.children.length" class="hero__kids">
            Sinu lapsed:
            <span v-for="child in childrenStore.children" :key="child.id" class="kid-chip">{{ child.name }}</span>
          </p>
        </div>
        <HeroIllustration class="hero__art" />
      </div>
    </section>

    <section class="section" aria-labelledby="types-title">
      <div class="container">
        <div class="section-head">
          <div>
            <h2 id="types-title">Mida soovid luua?</h2>
            <p class="muted">Vali sisu tüüp – järgmises sammus saad valida lapse ja sündmuse.</p>
          </div>
        </div>
        <ul class="types-grid" role="list">
          <li v-for="(type, index) in CONTENT_TYPES" :key="type.id">
            <ContentTypeCard :type="type" :tone="tones[index] ?? 'lavender'" />
          </li>
        </ul>
      </div>
    </section>

    <section class="section section--tint" aria-labelledby="occasions-title">
      <div class="container">
        <div class="section-head">
          <div>
            <h2 id="occasions-title">Hooaja ideed</h2>
            <p class="muted">Eesti tähtpäevad, pere sündmused ja täiesti tavalised päevad.</p>
          </div>
        </div>
        <ul class="occasions-grid" role="list">
          <li v-for="occasion in occasions" :key="occasion.id">
            <OccasionCard :occasion="occasion" />
          </li>
        </ul>
      </div>
    </section>

    <RecentCreations />
  </div>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  overflow: hidden;
  padding-block: clamp(2.5rem, 7vw, 5rem) clamp(2rem, 5vw, 3.5rem);
  background:
    radial-gradient(60rem 30rem at 85% -10%, var(--lavender-soft), transparent 60%),
    radial-gradient(40rem 24rem at -10% 110%, var(--coral-soft), transparent 60%);
}
.hero__inner {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  align-items: center;
  gap: 2rem;
}
.hero h1 {
  font-size: clamp(2.2rem, 5.5vw, 3.6rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}
.hero__lead {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  color: var(--ink-soft);
  max-width: 34rem;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}
.hero__kids {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.92rem;
  color: var(--ink-soft);
}
.kid-chip {
  padding: 0.15rem 0.65rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink);
  font-weight: 500;
}
.hero__art {
  justify-self: center;
  width: min(100%, 440px);
}

.types-grid,
.occasions-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}
.types-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
}
.occasions-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
}
.section--tint {
  background: var(--bg-deep);
}

@media (max-width: 820px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }
  .hero__art {
    width: min(80%, 320px);
    order: -1;
  }
}
</style>
