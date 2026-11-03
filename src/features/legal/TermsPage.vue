<script setup lang="ts">
import { provide } from 'vue'
import { DESIGN_KEY, type Design } from '../../components/brand/design'
import { PASS_PRICE } from '../pass/seasonPass'
import { LEGAL_UPDATED, SELLER } from './seller'

/** Müügitingimused: the Jõulupass is the only thing sold. Linked from the footer in both designs. */
const props = withDefaults(defineProps<{ design?: Design }>(), { design: 'new' })
provide(DESIGN_KEY, props.design)
const privacy = '/privaatsus'
</script>

<template>
  <div :class="{ 'design-new': design === 'new' }">
    <article class="container section legal">
      <span class="eyebrow">Kirjavõlu</span>
      <h1>Müügitingimused</h1>
      <p class="legal__updated">Viimati muudetud {{ LEGAL_UPDATED }}</p>

      <h2>Müüja</h2>
      <p>
        {{ SELLER.name }}, registrikood {{ SELLER.registryCode }}, {{ SELLER.address }}. Kontakt:
        {{ SELLER.email }}.
      </p>

      <h2>Mis on tasuta ja mis tasuline</h2>
      <p>
        Kirjavõlu kasutamine on tasuta: mallidest kirjad, lood, aardejahid, mõistatused ja muu prinditav, taustad ja oma pilt
        ning üks AI-proovikiri. Tasuline on ainult Jõulupass.
      </p>

      <h2>Jõulupass</h2>
      <ul>
        <li>Hind on {{ PASS_PRICE }}. Müüja ei ole käibemaksukohustuslane, hinnale käibemaksu ei lisandu.</li>
        <li>
          Pass annab 10 kirjasarja või lugu (üks sari on ühe lapse 24 isiklikku kirja) ja 30 päkapiku muudatust ühele kirjale
          või lehele.
        </li>
        <li>Pass kehtib ostule järgneva 31. jaanuari lõpuni. Kasutamata kordi pärast seda ei hüvitata.</li>
        <li>Püsimaksu ega kontot ei ole. Pass on kood kujul KV-XXXX-XXXX, mis on ka makse kirjelduses Stripe'i kviitungil.</li>
      </ul>

      <h2>Maksmine ja üleandmine</h2>
      <p>
        Makse toimub Stripe'i kaudu. Kaardiandmed lähevad otse Stripe'ile, Kirjavõlu neid ei näe. Kood ilmub ekraanile kohe,
        kui Stripe on makse kinnitanud, ja jääb selle brauseri mällu. Koodi saab sisestada ka teises seadmes.
      </p>

      <h2>Taganemisõigus</h2>
      <p>
        Jõulupass on digitaalne teenus, mis hakkab kohe pärast makset kehtima. Enne makset annad nõusoleku, et pass hakkab
        kohe kehtima, ja kinnitad, et tead, et sellega kaob 14-päevane taganemisõigus. Kui midagi ei tööta nagu lubatud,
        kirjuta {{ SELLER.email }} ja lahendame selle.
      </p>

      <h2>AI-ga kirjutatud tekstid</h2>
      <p>
        Isiklikud kirjad ja lood kirjutab päkapikk tehisaru (Anthropic Claude) abil vanema antud andmete põhjal. Loe tekstid
        enne lapsele andmist läbi. Iga teksti saad ise tasuta muuta. Kui tehisaru kutse ebaõnnestub, saad kasutatud korra
        tagasi.
      </p>

      <h2>Kaebused</h2>
      <p>
        Kirjuta {{ SELLER.email }}, vastame 14 päeva jooksul. Kui me kokkuleppele ei jõua, võid pöörduda
        Tarbijavaidluste komisjoni poole (ttja.ee).
      </p>

      <p class="legal__more">
        Kuidas andmeid kasutame, on kirjas <RouterLink :to="privacy">privaatsuspõhimõtetes</RouterLink>.
      </p>
    </article>
  </div>
</template>

<style scoped lang="scss">
@use './legal';
</style>
