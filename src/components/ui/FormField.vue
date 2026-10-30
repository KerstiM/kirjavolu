<script setup lang="ts">
defineProps<{
  id: string
  label: string
  hint?: string
  error?: string
}>()
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label :for="id" class="field__label">{{ label }}</label>
    <slot :described-by="error ? `${id}-error` : hint ? `${id}-hint` : undefined" :invalid="!!error" />
    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field__label {
  font-weight: 600;
  font-size: 0.95rem;
}
.field__hint,
.field__error {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}
.field__hint {
  color: var(--ink-soft);
}
.field__error {
  color: var(--danger);
}
</style>
