<script setup lang="ts">
import { provide } from 'vue'
import { DESIGN_KEY, type Design } from '../../components/brand/design'
import { LEGAL_UPDATED, SELLER } from './seller'

/** Privaatsuspõhimõtted: what stays in the browser, what goes to the AI and to Stripe. */
const props = withDefaults(defineProps<{ design?: Design }>(), { design: 'new' })
provide(DESIGN_KEY, props.design)
const terms = '/tingimused'
</script>

<template>
  <div :class="{ 'design-new': design === 'new' }">
    <article class="container section legal">
      <span class="eyebrow">Kirjavõlu</span>
      <h1>Privaatsuspõhimõtted</h1>
      <p class="legal__updated">Viimati muudetud {{ LEGAL_UPDATED }}</p>

      <h2>Lühidalt</h2>
      <ul>
        <li>Kontot ei ole. Lapsed, loomingud ja pildid on ainult sinu brauseris, mitte meie serveris.</li>
        <li>Tehisarule lähevad laste andmed ainult siis, kui ise palud AI-kirja, -loo või muudatuse.</li>
        <li>Serveris hoiame ainult Jõulupassi koodi ja seda, mitu korda on alles.</li>
      </ul>

      <h2>Kes andmeid töötleb</h2>
      <p>{{ SELLER.name }}, registrikood {{ SELLER.registryCode }}, {{ SELLER.address }}, {{ SELLER.email }}.</p>

      <h2>Sinu brauseris</h2>
      <p>
        Laste profiilid (nimi, vanus, huvid jm), loomingud, üles laaditud pildid, detsembri plaanid ja Jõulupassi kood on
        sinu brauseri mälus. Need ei jõua meieni. Kui tühjendad brauseri andmed, kaovad ka need.
      </p>

      <h2>Tehisaru (Anthropic Claude)</h2>
      <p>
        AI-proovikirja, isiklike kirjade, loo või päkapiku muudatuse jaoks saadame Anthropicule lapse eesnime, vanuse,
        lugemisoskuse ja selle, mida profiilis või vormis kirjutasid (nt huvid, pere, detsembri plaanid). Märkmeid
        lapsevanemale ei saadeta kunagi. Meie neid andmeid ei salvesta. Anthropic töötleb neid meie nimel teksti
        kirjutamiseks oma ärikasutuse tingimuste järgi ega kasuta neid oma mudelite treenimiseks.
      </p>

      <h2>Makse (Stripe)</h2>
      <p>
        Jõulupassi makset töötleb Stripe. Kaardiandmed ja e-posti aadress, mille maksmisel sisestad, on Stripe'i juures,
        meie neid ei salvesta. Meie andmebaasis on ainult passi kood, makse viide, alles olevad korrad ja kehtivusaeg.
      </p>

      <h2>Majutus ja kaitse kuritarvituse eest</h2>
      <p>
        Kirjavõlu töötab Cloudflare'is. Liiga paljude päringute vältimiseks loeme päringuid IP-aadressi järgi kuni kaks
        päeva, siis loendurid kustuvad.
      </p>

      <h2>Kasutusstatistika</h2>
      <p>
        Loendame küpsisteta (Umami), kui palju lehti avatakse ja kui palju loomingut tehakse. Laste andmeid sinna ei
        saadeta.
      </p>

      <h2>Sinu õigused</h2>
      <p>
        Võid küsida, mis andmeid sinu kohta on, ja paluda need kustutada. Kirjuta {{ SELLER.email }} ja lisa oma Jõulupassi
        kood, kui küsimus puudutab passi. Kaebusega võid pöörduda ka Andmekaitse Inspektsiooni poole (aki.ee).
      </p>

      <p class="legal__more">Jõulupassi ostmise tingimused on <RouterLink :to="terms">müügitingimustes</RouterLink>.</p>
    </article>
  </div>
</template>

<style scoped lang="scss">
@use './legal';
</style>
