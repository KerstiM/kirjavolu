# Kirjavõlu

Eestikeelne veebirakendus, mis aitab lapsevanematel luua lapsele personaalseid maagilisi elamusi: kirju, aardejahte, unejutte, mõistatusi, tegevuskalendreid ning diplomeid ja õnnitluskaarte.

**Idee:** sündmus + lapse profiil + sisutüüp + isikupärastus = ainulaadne elamus.

## Funktsioonid
- Kuus sisutüüpi, igaühel oma loomisvoog ja seaded
- 11 sündmust (jõulud, lihavõtted, sünnipäev, halloween, mardi- ja kadripäev, vastlapäev, sõbrapäev, kooliaasta algus, suvevaheaeg, piimahammas, tavaline päev)
- Laste profiilid (lisamine, muutmine, kustutamine), näidisprofiilid Ruben, Jasper ja Brita
- Ühised elamused õdedele-vendadele: ülesanded jagatakse vanuse järgi
- **Seotud pere sarjad**: mitme lapse puhul saab iga laps oma kirjasarja, aga need on omavahel seotud – igal lapsel on huvide järgi välja pakutud abiline (nt Kõpsu-Mõpsu Kuubikuvõlur, Tipp-Topp Riisiterake), esimeses kirjas tutvustatakse ka õdede-vendade abilisi, umbes iga viies päev on paarisülesanne (vanem teeb nooremale midagi ja mõlema kiri teab sellest) ning viimases kirjas lõpetavad kõik koos. Eelvaates on iga lapse sari omas paigutuses
- **Abilised räägivad üksteisest**: umbes iga nelja päeva tagant tuleb lugu õe või venna abilisest (nt „Eile öösel eksis Tipp-Topp peaaegu kappi ära, sest ta ei leidnud Jasperi sussi üles“), väikelapse kaartidel read suurtest õdedest-vendadest; ükski lugu ei kordu pere sees
- **Lapse väljakutsed**: nt kommideta päevad, korra hoidmine või oma väljakutse – laps saab esimesel päeval kutse ja viimasel kiituse, vanem õde või vend samal päeval salajase palve teda toetada; väljakutse ajal pühapäevakommi ei mainita
- **Küsimus täna, vastus homme**: päevasarjas on umbes iga viies päev mõistatus, teaduskatse (jää ja sool, mandariin vees, rosinad mullivees) või küsimus ning järgmine kiri algab vastusega; vastused on lapsevanema lehel
- **Salajane abiline** (jõulud, vanim laps): kutse, abiliste reegel, salamissioonid nooremate heaks ja viimases kirjas tiitel „päkapikkude abiline“; nooremate kirjad sellest ei räägi
- **Iga päeva ettevalmistus**: lapsevanema lehel on iga lapse ja päeva kohta kirjas, mis sussi panna või ette valmistada (komm, katsevahendid, raamat ettelugemiseks jne)
- **Pere sündmused ja reeglid**: lapsevanem lisab kuupäevaga sündmused (metsaretk, suusatamine, külaskäik, esinemine, trenn, piparkoogipäev, pidu või muu) ja valib osalejad; selle päeva kiri räägib sündmusest igale lapsele vanusele sobivalt. Reegel „maiustused ainult pühapäeviti“ selgitatakse esimeses kirjas, pühapäeva kirjades on komm ja lapsevanema lehel on komme vajavad kuupäevad
- Eelvaade: tekstide muutmine (ka plakatil ja väikelapse kaartidel – nupp „Muuda“ avab redaktori), ühe osa uuesti genereerimine (käsitsi muudetud teksti puhul küsitakse kinnitust), kolm prindipaigutust, printimine/PDF, tekstifaili eksport
- Lapsevanema juhised ja vastused on lapsele mõeldud materjalist eraldi
- Kujundus: 8 SVG-taustamustrit (sündmusele sobivad eespool), tinti säästev raamirežiim või oma pilt heleda taustana
- **Pusleplakat**: 7+ kirjaga sari prinditakse kaartidena, mis on paigutatud ussirada pidi (1. veerg alla, 2. üles jne) mitmele A4 lehele. Rada ja jaamad ühendavad päevi ning taustaks on sinu pilt või automaatne maastik. Kaardid lõigatakse lahti ja jõuludeks pannakse kokku terveks plakatiks. Igal lehel on märge („leht 1/4: pildi ülemine pool, vasak“), kaartidel kuupäev koos nädalapäevaga, tekst sobitub automaatselt ja alles lugema õppijale saab valida trükitähed
- **Väikelapse kaardid**: väikelapse päevasari prinditakse 12 kaardina A4 lehel – värvilised raamid, suur number koos nädalapäevaga, igal kaardil loomanägu (12 SVG-joonistust) ja suur tekst trükitähtedega. Igal päeval üks pisike asi: paaritutel päevadel lühike lugu, paarispäevadel ühine tegevus; esimene kaart tutvustab päkapikku ja viimane on sündmuse tervitus
- Puslepilt (teistes paigutustes): oma pilt jagatakse tükkideks ja iga osa allserva tuleb nummerdatud väljalõigatav puslekild; lapsevanema lehel on kokkupaneku juhend ja vajadusel lisatükid
- Andmed salvestatakse brauseri localStorage'isse versioonitud skeemiga

## Tehnoloogia
Vue 3, TypeScript (strict), Vite, Vue Router, Pinia, SCSS, Lucide ikoonid, Google Fonts (Playpen Sans prinditavatele materjalidele), Vitest, ESLint, Prettier.

## Paigaldamine ja arendus
```bash
npm install
npm run dev        # http://localhost:5173 (kui port on hõivatud, valib Vite järgmise)
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

## Testimine
`npm run test` käivitab Vitesti (jsdom). Testid asuvad kaustas `tests/`:
- `validation.spec.ts` – lapse profiili ja genereerimispäringu valideerimine
- `storage.spec.ts` – localStorage'i salvestus, skeemi migratsioon, laste store
- `estonian.spec.ts` – nimede käänamine, kuupäevad, salakirjade abifunktsioonid
- `generators.spec.ts` – iga sisutüübi ja sündmuse kombinatsioon, vanusele kohandamine, mitu last, aardejahi peidukohtade ahel, mõistatuste vastuste õigsus, ühe osa uuesti genereerimine
- `components.spec.ts` – profiilivorm, teksti muutmine eelvaates ja terve loomise voog viisardist eelvaateni

## Arhitektuur
- **Domeen on UI-st eraldi.** `src/domain` ei impordi Vue't; kõik tekstiloogika on puhtad funktsioonid, mida saab testida ilma brauserita.
- **Andmed ja reeglid ei ole mallides.** Tekstipangad on `src/data/templates`, sündmuste kirjeldused `src/domain/occasions`.
- **Genereeritud sisu on renderdusest eraldi.** Generaator tagastab `GeneratedContent` objekti (osad, lapsevanema juhised, vastused); eelvaade ja print ainult kuvavad seda.
- **Deterministlik ja osade kaupa uuendatav.** Struktuur (nt peidukohtade järjekord) sõltub ainult seemnest; iga osa tekst sõltub seemnest, osa järjekorranumbrist ja variandist. Nii saab ühe kaardi uuesti luua, ilma et teised muutuksid.
- **Olek.** Pinia store'id `children` ja `creations`; `app/persistence.ts` salvestab need versioonitud kujul (`schemaVersion`) võtme `kirjavolu.state` alla. Skeemi muutmisel lisa samm funktsiooni `migrate`.

## Kujundus ja puslepilt
- Kujundus on puhtalt visuaalne (`GeneratedContent.decoration`) ega muuda tekste.
- Üles laaditud pilt vähendatakse brauseris (kuni 2000 px) ja salvestatakse **IndexedDB-sse** (`src/utils/imageStore.ts`), sest localStorage'i maht on fotode jaoks liiga väike. Pilt ei lahku seadmest. Loomingu kustutamisel kustutatakse ka pilt.
- Pusle ruudustik (`src/domain/puzzleGrid.ts`) valitakse nii, et tükke oleks vähemalt nii palju kui osi, liigseid tükke oleks vähe ja tükid oleksid umbes postkaardi kujuga. Näiteks 24 kirja ja 4:3 foto puhul on ruudustik 6 × 4.
- Tükid ja taustapilt on `<img>`-elemendid, mitte CSS-taustad, et need prindiksid ka siis, kui brauseri prindiseadetes on taustagraafika välja lülitatud.

### Seotud pere sarjad
`src/domain/generators/linkedLetters.ts` koostab **enne kirjade kirjutamist** pere päevaplaani: millisel päeval, kes kellele ja millise paarismalliga (`src/data/templates/pairs.ts`). Mõlema lapse kiri kirjutatakse samast plaanireast, nii et need klapivad alati. Iga lapse sari tehakse tavalise kirjageneraatoriga, kuid ühise „kasutatud tekstide“ registriga, et õed-vennad ei saaks sama lugu. Järjejuttu jutustatakse ainult vanimale lapsele.

### Pere sündmused
`src/domain/generators/familyEvents.ts` arvutab, millisele päevale sündmus langeb, ja annab selle päeva kirjale sündmuse lõigu (`src/data/templates/events.ts`, igal sündmusel tekst vanemale, nooremale ja väikelapsele). Sündmus asendab päeva tavalise ülesande. Paarisülesanne nihkub järgmisele päevale ainult siis, kui andjal või saajal on samal päeval sündmus.

### Pusleplakati geomeetria
`src/domain/posterLayout.ts` arvutab veerud (kuni 12 osa: 2, rohkem: 4), read ja lehed (2 veergu ja kuni 4 rida lehel). Päev *i* asub veerus `floor(i / read)` ja paarisveergudes ülalt alla, paaritutes alt üles, nii et järjestikused päevad on alati naabrid ja rada ei hüppa. Taust ja rada joonistatakse plakati koordinaatides ning iga leht näitab oma lõiku, nii et kokku pandud lehtedel jätkuvad need katkematult. 7+ kirjaga sarjades jäetakse täitelaused ära, et tekst kaardile mahuks.

## Kohalik mallipõhine genereerimine
Sisu ei loo tehisintellekt. `TemplateGenerator` (`src/domain/generators`) paneb tekstid kokku käsitsi kirjutatud eestikeelsetest mallidest ja lapse profiilist. Genereerimine on deterministlik (seemne põhjal), arvestab vanust ja lugemisoskust, väldib korduvaid tekste ning käänab nimesid (nt Rubenile, Rubeni ja Jasperiga).

## Tulevane AI-integratsioon
UI kasutab ainult liidest `ContentGenerator` (`generate`, `regenerateItem`) läbi `useGenerator()`. AI-teenuse lisamiseks tee serveripoolne teenus, mis implementeerib sama liidese. API-võtmeid ei tohi kunagi panna frontendi.

## Teadaolevad piirangud
- Vaba teksti lisasoove mallimootor ei tõlgenda; need kuvatakse lapsevanemale meelespeana
- Ebareeglipäraste nimede käänded vajavad profiilis omastava vormi
- Andmed on ainult ühes brauseris; kontosid ega sünkroonimist pole
- Malliandmepangad on piiratud: pikas sarjas võib üksik lause korduda
- Väikelapse unejutul ei ole alternatiivseid variante
- Printimist on kontrollitud brauseri prindieelvaate stiilide tasemel, mitte igal printeril
- Sündmuste tekstid on mallid: täpsustus (nt „vanaema juurde Valka“) lisatakse lausesse sellisena, nagu lapsevanem selle kirjutas
- Oma pilt on salvestatud ainult selles brauseris; teises seadmes avatud loomingul pilti ei ole
- Väikese eraldusvõimega pildi puhul võivad prinditud puslekillud jääda uduseks (rakendus hoiatab)

## Plaanitud täiendused
- End-to-end testid päris brauseris (nt Playwright), sh printimise eelvaade
- Rohkem malle ja sündmusi, piltidega prindikujundused
- Serveripoolne AI-pakkuja `ContentGenerator` liidese taga
- Andmete eksport/import ja jagamine
