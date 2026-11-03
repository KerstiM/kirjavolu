<script setup lang="ts">
import { PASS_PRICE } from './seasonPass'

/** What is free and what the Jõulupass adds, side by side: on the home page and the pass page. */
const ROWS: { label: string; free: string; pass: string; soon?: boolean }[] = [
  { label: 'Kirjad, aardejaht, mõistatused, kalender, diplom mallidest', free: 'Jah', pass: 'Jah' },
  { label: 'Taustad, oma pilt ja ise muutmine', free: 'Jah', pass: 'Jah' },
  { label: 'Isiklikud kirjad lapse, pere ja detsembri plaanide järgi', free: '–', pass: '10 sarja või lugu' },
  { label: 'Personaalne lugu, päris muinasjutt sinu lapsest', free: '–', pass: 'Sees' },
  { label: 'Päkapiku muudatused kirjale või lehele', free: '–', pass: '30' },
  { label: 'Jõuluvana tervitus', free: '–', pass: 'Varsti', soon: true },
]
</script>

<template>
  <div class="compare">
    <table>
      <caption class="visually-hidden">Mis on tasuta ja mis Jõulupassiga</caption>
      <thead>
        <tr>
          <td />
          <th scope="col" class="compare__free">Tasuta</th>
          <th scope="col" class="compare__pass">Jõulupass {{ PASS_PRICE }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in ROWS" :key="row.label" :class="{ 'is-soon': row.soon }">
          <th scope="row">{{ row.label }}</th>
          <td :class="{ 'is-none': row.free === '–' }">{{ row.free }}</td>
          <td>{{ row.pass }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.compare {
  overflow-x: auto;
  align-self: stretch;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1.5px solid #f0e2cf;
  border-radius: 12px;
  background: #fff;
  font-size: 0.9rem;
  overflow: hidden;
}
th,
td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f0e2cf;
  text-align: left;
  vertical-align: top;
}
thead th,
thead td {
  border-top: 0;
  font-weight: 700;
}
tbody th {
  font-weight: 400;
}
.compare__free {
  color: var(--ink-soft);
}
.compare__pass {
  background: var(--coral-soft);
  color: var(--coral-ink);
}
.is-none {
  color: var(--ink-faint);
}
.is-soon {
  color: var(--ink-faint);
}
</style>
