# Kirjavõlu

Eestikeelne veebirakendus, mis aitab lapsevanematel luua lapsele personaalseid maagilisi elamusi: kirju, aardejahte, unejutte, mõistatusi, tegevuskalendreid ning diplomeid ja õnnitluskaarte.

**Idee:** sündmus + lapse profiil + sisutüüp + isikupärastus = ainulaadne elamus.

## Funktsioonid
- Kuus sisutüüpi, igaühel oma loomisvoog ja seaded
- 11 sündmust (jõulud, lihavõtted, sünnipäev, halloween, mardi- ja kadripäev, vastlapäev, sõbrapäev, kooliaasta algus, suvevaheaeg, piimahammas, tavaline päev)
- Laste profiilid (lisamine, muutmine, kustutamine), näidisprofiilid Ruben, Jasper ja Brita
- Ühised elamused õdedele-vendadele: ülesanded jagatakse vanuse järgi
- Eelvaade: tekstide muutmine, ühe osa uuesti genereerimine, kolm prindipaigutust, printimine/PDF, tekstifaili eksport
- Lapsevanema juhised ja vastused on lapsele mõeldud materjalist eraldi
- Andmed salvestatakse brauseri localStorage'isse versioonitud skeemiga

## Tehnoloogia
Vue 3, TypeScript (strict), Vite, Vue Router, Pinia, SCSS, Lucide ikoonid, Google Fonts (Playpen Sans prinditavatele materjalidele), Vitest, ESLint, Prettier.

## Paigaldamine ja arendus
```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm run test
npm run build
```

## Struktuur
```
src/
  app/          rakenduse kest, router, salvestamine
  components/   ui/ ja layout/ komponendid
  features/     home, children, creation (viisard), preview (eelvaade ja print)
  domain/       mudelid, sündmused, valideerimine, generaatorid, eesti keele abifunktsioonid
  data/         tekstimallid ja näidisprofiilid
  composables/  useGenerator
  utils/        id, kloonimine, localStorage, eksport
```

## Kohalik mallipõhine genereerimine
Sisu ei loo tehisintellekt. `TemplateGenerator` (`src/domain/generators`) paneb tekstid kokku käsitsi kirjutatud eestikeelsetest mallidest ja lapse profiilist. Genereerimine on deterministlik (seemne põhjal), arvestab vanust ja lugemisoskust, väldib korduvaid tekste ning käänab nimesid (nt Rubenile, Rubeni ja Jasperiga).

## Tulevane AI-integratsioon
UI kasutab ainult liidest `ContentGenerator` (`generate`, `regenerateItem`) läbi `useGenerator()`. AI-teenuse lisamiseks tee serveripoolne teenus, mis implementeerib sama liidese. API-võtmeid ei tohi kunagi panna frontendi.

## Teadaolevad piirangud
- Vaba teksti lisasoove mallimootor ei tõlgenda; need kuvatakse lapsevanemale meelespeana
- Ebareeglipäraste nimede käänded vajavad profiilis omastava vormi
- Andmed on ainult ühes brauseris; kontosid ega sünkroonimist pole
- Ühiktestid on veel kirjutamata (vt plaanid)

## Plaanitud täiendused
- Ühik- ja komponenditestid (valideerimine, salvestus, generaatorid, viisard)
- Rohkem malle ja sündmusi, piltidega prindikujundused
- Serveripoolne AI-pakkuja `ContentGenerator` liidese taga
- Andmete eksport/import ja jagamine
