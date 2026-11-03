<script setup lang="ts">
import { provide } from 'vue'
import { DESIGN_KEY } from '../../components/brand/design'
import RecentCreations from './RecentCreations.vue'

/** /minu: everything made in this browser, free or written with the Jõulupass, in one place. */
provide(DESIGN_KEY, 'new')
</script>

<template>
  <div class="design-new">
    <RecentCreations />
  </div>
</template>
