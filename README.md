# Kirjavõlu

Eestikeelne veebirakendus, mis aitab lapsevanematel luua lapsele personaalseid maagilisi elamusi: kirju, aardejahte, unejutte, mõistatusi, tegevuskalendreid ning diplomeid ja õnnitluskaarte.

**Idee:** sündmus + lapse profiil + sisutüüp + isikupärastus = ainulaadne elamus.

## Kaks peamist teekonda
- **Avaleht `/`**: kõik kuus sisutüüpi (iga kaart avab viisardi selle tüübiga), hooaja plokk, päris näidised, kolm sammu, „Minu loomingud“ (kui brauseris on loominguid) ja lapse andmete hoidmine. Tekstid on failis `src/features/home/content.ts`. Hooaja plokk ja menüü link tulevad failist `src/features/home/seasonal.ts`: praegu jõulud 1. novembrist 23. detsembrini, lihavõtted või sünnipäev on sama nimekirja üks rida juurde.
- **Jõulukirjad `/joulukirjad`** (`src/features/christmas/`): 1) „Kellele?“: üks või mitu olemasolevat last (midagi ei küsita uuesti) ja/või uus laps nime ja vanusega, ühe lapse puhul huviteemad valikuliselt. Mitu last saavad seotud pere sarja nagu viisardis. 2) `/joulukirjad/<id>`: 24 tasuta mallikirja lapse kohta kohe (pere puhul lapse kaupa vahelehtedel), igaüht saab samas muuta („Muuda“), „Prindi või salvesta PDF“ avab tavalise eelvaate. 3) Valikuline „Muuda kirjad veel isiklikumaks“: võrdlustabel (mis on tasuta kirjades, mida isiklikud lisavad), hind, kogus (10 sarja või lugu, üks sari = ühe lapse 24 kirja), kehtivus, kolm välja, kirjade pikkus (lühike 60–90, keskmine 120–170 (vaikimisi), pikk 200–260 sõna ehk umbes pool A4 lehte; pikkus ei sõltu lugemisoskusest, see mõjutab ainult lausete lihtsust) ja kas kohe kirjutamine (pass brauseris) või nõusolek ja Stripe'i makseaken samal lehel. Pärast makset kontrollib leht serverilt makset (`GET /api/joulupass/ost?session_id=…`), näitab passi koodi ja hakkab ise kirjutama. Kirjutamise ajal on aus ooteolek (kulunud aeg, mitte väljamõeldud etapid); lehe sulgemisel küsib brauser kinnitust. Kui päring katkeb või leht suleti kirjutamise ajal, küsib leht serverilt passi jääki ja ütleb ausalt, kas loomiskord kulus. Ühe lapse isiklikud kirjad asendavad mallikirjad samas loomingus; pere puhul tuleb iga lapse isiklik sari eraldi loominguna ja tasuta pere kirjad jäävad alles. Valmis isiklike kirjade juures: iga kirja „Muuda“ aknas „Palu päkapikul muuta“ (üks 30 muudatusest) ja „Kirjuta kõik uuesti“ valitud pikkusega (üks sari). 24 keskmise pikkusega kirja kirjutamine võttis kohalikus testis 92 sekundit.
- Varasemad testvaated (`/uus-disain…`, `/ud2…`, `/ud3`) vastavad endiselt, et vanad lingid ja Stripe'i tagasipöördumised töötaksid, aga ükski link neile ei vii. Üleviimise plaan: [docs/route-migration.md](docs/route-migration.md).

## Funktsioonid
- Kuus sisutüüpi, igaühel oma loomisvoog ja seaded
- **Kolm ekraani eelvaateni**: „Mida ja mis puhul?“ → „Kellele?“ → eelvaade. Link tüübi ja tähtpäevaga (nt `/loo?tyyp=letter&puhk=christmas`) täidab need ette ning avab kohe „Kellele?“. Lapse saab lisada otse viisardis (nimi, vanus ja kõik sobivad huviteemad; lugemisoskus pakutakse vanuse järgi). „Vaata näidet“ (`/naide`) näitab näidislapse 1. detsembri kirja ilma andmeid sisestamata
- 11 sündmust (jõulud, lihavõtted, sünnipäev, halloween, mardi- ja kadripäev, vastlapäev, sõbrapäev, kooliaasta algus, suvevaheaeg, piimahammas, tavaline päev)
- Laste profiilid (lisamine, muutmine, kustutamine); alguses on nimekiri tühi, näidisprofiilid Ruben, Jasper ja Brita saab lisada ühe nupuga
- Umbes 40 huviteemat, mille lapsevanem valib loendist; iga teema kohta on kirjades käsitsi kirjutatud lood
- Ühised elamused õdedele-vendadele: ülesanded jagatakse vanuse järgi
- **Stsenaariumipõhised jõulukirjad**: 7 või 24 jõulukirja sari kirjutatakse terviklikest, käsitsi kirjutatud lugudest – igal kirjal on üks sündmus algusest lõpuni, mitte juhuslikult kokku pandud lõigud. Kogu sari planeeritakse enne kirjutamist (järjejutu etapid, iseseisvad lood, pere sündmused, ülesanded, isikupärastus) ja kontrollitakse automaatselt (kordused, ajajärjestus, saladused, mõistatuste vastused, kaardi pikkus). Vt [docs/scenario-engine.md](docs/scenario-engine.md)
- **Seotud pere sarjad**: mitme lapse puhul saab iga laps oma kirjasarja samast päkapikumaailmast – igal lapsel on huvide järgi välja pakutud abiline (nt Kõpsu-Mõpsu Kuubikuvõlur, Tipp-Topp Riisiterake) oma häälega, esimeses kirjas tutvustatakse ka õdede-vendade abilisi, umbes iga viies päev on paarisülesanne (vanem teeb nooremale midagi ja mõlema kiri teab sellest) ning viimases kirjas lõpetavad kõik koos. Eelvaates on iga lapse sari omas paigutuses
- **Ühine maailm**: osa sündmusi (nt „Välk harjutab maandumist“, „Täht on leitud“) juhtub kõigi laste kirjades samal päeval, igaüks kuuleb seda oma päkapiku käest; õdede-vendade abilised on lugudes tegelased (nt Tipp-Topp keedab putru, mis läheb trepist alla); väikelapse kaartidel on read suurtest õdedest-vendadest
- **Järjejutt „Kadunud täht“**: töökoja kuuselt kaob täht; vanem laps uurib sule, öökulli ja vana raamatu abil, noorem leiab hõbedast tolmu ja teeb küpsisepüüniseid, väikelaps näeb hõbedast linnukest. Vahepeal on iseseisvad naljakad ja soojad lood
- **Lapse väljakutsed**: nt kommideta päevad, korra hoidmine või oma väljakutse – laps saab esimesel päeval kutse ja viimasel kiituse, vanem õde või vend samal päeval salajase palve teda toetada; väljakutse ajal pühapäevakommi ei mainita
- **Mõistatus täna, vastus homme**: mõnes loos on mõistatus, salakiri või katse, mis kuulub selle loo juurde; vastus on lapsevanema lehel ja järgmise kirja P.S.-is. Ükski kiri ei eelda, et laps vastas või midagi tegi
- **Salajane abiline** (jõulud, vanim laps, 12+ kirja): kutse koos reeglitega (vastama ei pea – nõusolek tähendab saladuse hoidmist), salamissioonid nooremate heaks pakkumistena ja viimases kirjas tiitel „päkapikkude abiline“; nooremate kirjad sellest ei räägi
- **Iga päeva ettevalmistus**: lapsevanema lehel on iga lapse ja päeva kohta kirjas, mis sussi panna või ette valmistada (komm, katsevahendid, raamat ettelugemiseks jne)
- **Pere sündmused ja reeglid**: lapsevanem lisab kuupäevaga sündmused (metsaretk, suusatamine, külaskäik, esinemine, trenn, piparkoogipäev, pidu või muu) ja valib osalejad; selle päeva kiri räägib sündmusest igale lapsele vanusele sobivalt. Reegel „maiustused ainult pühapäeviti“ selgitatakse esimeses kirjas, pühapäeva kirjades on komm ja lapsevanema lehel on komme vajavad kuupäevad
- Eelvaade: kõik valikud (kirjade arv, saatja, järjejutt, pere sündmused, väljakutsed, toon) on eelvaate kõrval paneelis ja tekstid uuenevad kohe (käsitsi muudetud tekstide puhul küsitakse enne kinnitust); üks printimise valik „Kuidas prindid?“: „Kaardid sussi sisse“ (4 lehel), „Pool lehte“, „Terve leht“ ja sarja puhul „Pusleplakat“ (pikkade kirjadega suuremad kaardid ja rohkem lehti; hall koos põhjendusega ainult siis, kui mõni kiri ei mahu ka suurele kaardile); „Rohkem valikuid“ all on ainult „Mida printida“ ja trükitähed; tekstide muutmine (ka plakatil ja väikelapse kaartidel – nupp „Muuda“ avab redaktori), ühe osa uuesti genereerimine (käsitsi muudetud teksti puhul küsitakse kinnitust), printimine/PDF, tekstifaili eksport
- Lapsevanema juhised ja vastused on lapsele mõeldud materjalist eraldi
- Taust ja pilt (eelvaates kohe nähtav, mitte „Rohkem valikuid“ all): 8 SVG-taustamustrit (sündmusele sobivad eespool), tinti säästev raamirežiim, pusleplakatil „Plakatipilt“ või oma pilt taustana
- **Pusleplakat**: 7+ kirjaga sari prinditakse kaartidena, mis on paigutatud ussirada pidi (1. veerg alla, 2. üles jne) mitmele A4 lehele. Rada ja jaamad ühendavad päevi ning taustaks on sinu pilt või automaatne maastik. Kaardid lõigatakse lahti ja jõuludeks pannakse kokku terveks plakatiks. Igal lehel on märge („leht 1/4: pildi ülemine pool, vasak“), kaartidel kuupäev koos nädalapäevaga, tekst sobitub automaatselt ja alles lugema õppijale saab valida trükitähed
- **Väikelapse kaardid**: väikelapse päevasari prinditakse 12 kaardina A4 lehel – värvilised raamid, suur number koos nädalapäevaga, igal kaardil loomanägu (12 SVG-joonistust) ja suur tekst trükitähtedega. Igal päeval üks pisike asi ette lugemiseks: häälitsus, liigutus või midagi, mida koos vaadata; esimene kaart tutvustab päkapikku ja viimane on sündmuse tervitus
- Puslepilt (teistes paigutustes): oma pilt jagatakse tükkideks ja iga osa allserva tuleb nummerdatud väljalõigatav puslekild; lapsevanema lehel on kokkupaneku juhend ja vajadusel lisatükid
- Andmed salvestatakse brauseri localStorage'isse versioonitud skeemiga

## Majutus ja kolimine aadressile kirjavolu.ee
- **Cloudflare Workers** (`wrangler.jsonc`, `worker/index.ts`) serveerib rakendust kaustast `dist/` aadressidel kirjavolu.ee ja www.kirjavolu.ee ning vastab aadressidele `/api/…` (praegu `/api/health`). Domeenid on `wrangler.jsonc` failis `routes` all; DNS on Cloudflare'is, domeeni registreerija on Zone. Deploy: `.github/workflows/cloudflare.yml`, mis käivitub alles siis, kui repos on muutuja `CLOUDFLARE_ACCOUNT_ID` ja saladus `CLOUDFLARE_API_TOKEN`. Kohalikult `npm run worker:dev`.
- **AI-proovikiri** (`worker/sampleLetter.ts`, näidislehel `/naide`). `POST /api/proovikiri` küsib Claude'ilt (`claude-opus-5-5`) päkapiku kirja 1. detsembriks, ilma kontota. Serverisse saadetakse ainult lapse eesnimi, vanus, lugemisoskus ja huvid ning midagi ei salvestata. Kulu piiravad: päringud ainult samalt aadressilt, kuhu päring saadeti (ja arenduses localhostist), 3 minutis ja 5 päevas ühelt aadressilt (`SAMPLE_LIMIT`, KV `USAGE`), kokku `AI_DAILY_LIMIT` (300) päevas ning Anthropicu Console'i kuulimiit. API võti on Cloudflare'i saladus `ANTHROPIC_API_KEY`, mis pannakse dashboardis ja mida repos pole.
- **Jõulupass** (`worker/seasonPass.ts`, `src/features/pass/`; ostetakse jõulukirjade lehel `/joulukirjad/<id>`, näidislehel `/naide` või lehel `/joulupass`). 9,90 € ühekordne makse Stripe'i Embedded Checkoutiga (makseaken on lehe sees, Stripe Tax on väljas, sest firma ei ole käibemaksukohustuslane). Kontosid ei ole: ostja saab koodi kujul `KV-XXXX-XXXX`, millega on 10 AI-genereerimist ja mis kehtib ostule järgneva 31. jaanuari lõpuni. Kood tehakse makse alustamisel (`POST /api/joulupass/ost`) ja pannakse makse kirjeldusse ja metadata'sse. Kehtima hakkab see alles siis, kui Stripe makse kinnitab: allkirjastatud webhookiga (`POST /api/stripe/webhook`, sündmused `checkout.session.completed`, `checkout.session.async_payment_succeeded` ja `…_failed`) või tagasituleku lehelt, mis küsib Stripe'ilt ise (`GET /api/joulupass/ost?session_id=…`). Tagasituleku leht on `POST /api/joulupass/ost` `{ returnTo }` järgi `/joulukirjad/<id>`, `/joulupass` või (varasem) `/ud2/kirjad/<id>`; muu korral `/uus-disain/joulupass`. Mõlemad salvestavad koodi üks kord sessiooni kohta D1 tabelisse `season_passes` (`migrations/`). Brauser jätab koodi meelde (`localStorage` võti `kirjavolu.joulupass`). Lehel „Mul on Jõulupass“ saab koodi teises seadmes sisestada (`POST /api/joulupass/kood`) ja server ütleb, mitu korda on alles. Päringud tulevad ainult oma lehtedelt, kuni 10 korda minutis ühelt aadressilt (`PASS_LIMIT`). Saladused `STRIPE_SECRET_KEY` (piiratud võti, õigus ainult „Checkout Sessions: Write“) ja `STRIPE_WEBHOOK_SECRET` pannakse Cloudflare'i dashboardis. Avalik `STRIPE_PUBLISHABLE_KEY` ja hind `STRIPE_PRICE_ID` on `wrangler.jsonc` failis ning praegu Stripe'i testkeskkonnast (KH Creative sandbox). Uus tabel või veerg: lisa fail kausta `migrations/` ja käivita `npx wrangler d1 migrations apply kirjavolu --remote` enne deploy'd. Kohalik testimine: `.dev.vars` failis `STRIPE_SECRET_KEY` ja `STRIPE_WEBHOOK_SECRET` (`stripe listen --print-secret`), siis `npx wrangler d1 migrations apply kirjavolu --local`, `stripe listen --forward-to localhost:8788/api/stripe/webhook` ja `npm run build && npx wrangler dev --port 8788 --local-upstream localhost:8788` (ilma `--local-upstream`'ita paneb wrangler päringu aadressiks kirjavolu.ee ja Stripe suunab pärast makset sinna). Testkaart: 4242 4242 4242 4242.
- **AI-kirjad Jõulupassiga** (`worker/passLetters.ts`, `src/features/pass/PassLetters.vue`, `src/features/pass/passLetters.ts`). Kui brauseris on kehtiv pass, näitab leht `/joulupass` järgmist sammu „Järgmine samm: AI-kirjad“: vali laps (või lisa uus), täida vorm „Mida päkapikk peaks … kohta teadma?“ ja vajuta „Loo … jaoks AI-kirjad“. Vorm on lapse enda profiil juba eeltäidetuna (pere ja lemmikloomad, huvid, iseloom, mida õpib, lemmiktoidud, muu, teemad loendist), muudatused salvestuvad profiili, nii et midagi ei pea kaks korda täitma. Lisaks on väli „Selle detsembri plaanid“ (kuupäevadega, nt „12.12 läheme vanaema juurde“): päkapikk räägib neist õigel päeval ja küsib järgmisel päeval, kuidas läks. See jääb brauserisse lapse kaupa meelde (`localStorage` võti `kirjavolu.joulupass.detsember`). Kui lapse kohta pole peaaegu midagi teada, ütleb vorm, et kirjad tulevad üldisemad. Päkapikk Tuduja kirjutab tehisaru (Claude `claude-opus-5-5`) abil ühe korraga kõik 24 detsembrikirja (1.–24. detsember) ühe looga. **Üks lapse 24-kirjaline AI-sari = üks loomiskord.** Päring `POST /api/joulupass/kirjad` saadab koodi, lapse profiili (eesnimi, vanus, lugemisoskus, huvid, iseloom, pere, lemmiktoidud, saavutused, lisadetailid; **mitte** „Märkmed lapsevanemale“) ja detsembri plaanid. Need lähevad mudelile `<laps>` ja `<detsember>` sildi sees andmetena ning mudelil on keelatud pereliikmeid ja sündmusi juurde mõelda. Server võtab korra maha ühe atomaarse D1 päringuga (`UPDATE … SET generations_left = generations_left - 1 WHERE code = ? AND generations_left > 0 AND valid_until > ? RETURNING …`) **enne** AI-kutset, nii et kaks samaaegset päringut ei saa viimast korda kaks korda kulutada; kui AI-kutse ebaõnnestub, antakse kord tagasi. Vastused: 404 `not_found` (tundmatu kood), 410 `expired` (aegunud), 409 `used_up` (kordi pole), 429 `too_many` (`PASS_LIMIT`), 502/503 (AI ebaõnnestus, kord jäi alles). Valmis kirjad salvestatakse tavalise loominguna brauserisse ja avanevad eelvaates, alles olevate kordade arv uueneb ekraanil ja `localStorage`'is. AI-kirju saab eelvaates käsitsi muuta, aga mallimootor neid üle ei kirjuta (nupp „Uus variant“ ja kohandamise paneel on peidus). Kohalikuks proovimiseks lisa `.dev.vars` faili ka `ANTHROPIC_API_KEY`; 24 kirja kirjutamine võtab paar minutit.
- **AI-kirja parandamine** (`POST /api/joulupass/parandus`). Eelvaates saab iga AI-kirja muuta käsitsi („Muuda“) ja samas aknas ka „Paranda AI-ga“: vanem kirjutab, mida muuta (nt „tee lühemaks“, „Liisi on beebi, ta ei räägi veel“), AI kirjutab ümber ainult selle kirja, nähes lapse andmeid, detsembri plaane ning eelmist ja järgmist kirja. Uus tekst tuleb välja sisse: „Salvesta“ võtab selle, „Tühista“ jätab vana. Parandus ei kuluta loomiskorda, vaid passi eraldi parandusi (**30 passi kohta**, veerg `fixes_left`, `migrations/0002_season_pass_fixes.sql`), maha võetud atomaarselt ja tagasi antud, kui AI ebaõnnestub. **AI-kulu piirangud:** iga pass 10 sarja ja 30 parandust; kõigi kasutajate peale kokku päevas kuni `PASS_SERIES_DAILY_LIMIT` sarja (100) ja `PASS_FIX_DAILY_LIMIT` parandust (600) (`wrangler.jsonc`, loendurid KV-s `USAGE`), üle selle vastab server 503 `daily_limit` ilma korda kulutamata; viimane kaitse on kulupiirang Anthropic Console'is. Enne deploy'd: `npx wrangler d1 migrations apply kirjavolu --remote`.
- **AI-lugu Jõulupassiga** (`worker/passStory.ts`, `src/features/preview/AiStoryCard.vue`). Mallimootor paneb loo kokku valmis lõikudest; uue disaini loo eelvaates on kaart „Kirjuta lugu AI-ga“, mis kirjutab samade valikute järgi (žanr, toon, õpetlik teema, lisategelased, pikkus, märkused, tähtpäev) päris loo, kus lapsed on peategelased (`POST /api/joulupass/lugu`, **üks loomiskord**). Lehekülgi on 3/5/7 (lühike/keskmine/pikk), lehekülje pikkus vastavalt kõige algajama lugeja lugemisoskusele. Iga lehekülge saab „Muuda“ aknas „Paranda AI-ga“ (`POST /api/joulupass/lugu/parandus`, üks parandus). Päevane piirang `PASS_SERIES_DAILY_LIMIT` loeb sarju ja lugusid kokku. Ilma passita ütleb kaart, mida pass annab.
- **Andmete ülekanne.** Brauseri mälu kuulub ühele aadressile, seega kolimisel kaovad muidu profiilid ja loomingud. Kui GitHub Pagesi ehitusel on repo muutuja `MOVED_TO` (nt `https://kirjavolu.ee`), näitab vana aadress ribaga „Kirjavõlu kolis…“ ja nupuga „Vii andmed üle“. Nupp avab uue aadressi lehe `/kolin` ning annab lapsed, loomingud ja pildid `postMessage` kaudu üle; kumbki pool võtab sõnumeid vastu ainult teise täpselt aadressilt ja serverit see ei läbi. Andmeteta külastaja suunatakse kohe uuele aadressile. Loogika: `src/app/transfer.ts`.

## Kasutusstatistika
Avalik leht loendab küpsisteta [Umamiga](https://umami.is), mitu inimest jõuab loomise eri sammudeni. Saadetakse ainult need sündmused (`src/app/analytics.ts`), väljadeks on ainult valikud ja arvud, mitte lapse andmed:

| Sündmus | Millal | Andmed |
|---|---|---|
| `wizard_start` | viisard avati (mitte vana loomingu muutmiseks) | tüüp ja tähtpäev, kui kaart need valis |
| `child_added` | laps lisati | kas viisardis või lehel „Lapsed“ |
| `preview_shown` | looming avati eelvaates | tüüp, tähtpäev, osade ja laste arv |
| `print_clicked` | vajutati „Prindi / PDF“ | tüüp, paigutus, mida prinditi |
| `sample_shown` | avati „Vaata näidet“ | – |
| `christmas_start` | avati `/joulukirjad` | – |
| `free_generated` | tehti tasuta looming (viisardis või jõulukirjade lehel) | tüüp, tähtpäev, osade arv |
| `paywall_shown` | isiklike kirjade pakkumine on tasuta kirjade all näha (ilma passita) | tüüp, osade arv |
| `premium_selected` | vajutati „Osta Jõulupass“ | toode |
| `checkout_started` | Stripe'i makseaken avanes | toode |
| `purchase` | server kinnitas makse Stripe'ilt | toode |
| `premium_generated` | isiklikud kirjad valmisid | tüüp, osade arv |
| `premium_failed` | isiklike kirjade kirjutamine ebaõnnestus | serveri põhjus (suletud loend, nt `busy`) |

Statistika lülitub sisse ainult siis, kui ehitamisel on olemas `VITE_UMAMI_WEBSITE_ID` (GitHubi repo muutuja `UMAMI_WEBSITE_ID`). Arendus ja testid ei loenda midagi ning „Do Not Track“ seadega külastajaid ei loendata.

## Demo
https://kerstim.github.io/kirjavolu/ – uuendatakse automaatselt iga `main`-i muudatusega (`.github/workflows/pages.yml`). Andmed (laste profiilid, loodud kirjad) jäävad iga külastaja enda brauserisse.

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
- `home.spec.ts` – avaleht: kuus tüüpi, hooaja plokk hooajal ja väljaspool, näidised, sammud, „Minu loomingud“
- `christmas.spec.ts` – jõulukirjad: lapse valik, tasuta kirjad, muutmine, pakkumine ja selle tagasilükkamine, makse alustamine, Stripe'ilt tagasitulek, kinnitamata makse, taastamine, katkenud kirjutamine, vanad aadressid
- `design.spec.ts` – uus kujundus põhiaadressidel ja varasemad testvaated
- `story.spec.ts` – stsenaariumimootor: lugude kogu kontroll, planeerimine, vanuserühmad, isikupärastus, järjejutu järjekord, ühised sündmused, saladused, mõistatuste vastused, kaardi pikkus ja sadade sarjade automaatne kontroll
- `golden.spec.ts` – kirjutab terved näidissarjad kausta `docs/samples` (muutmiseks `npx vitest run -u tests/golden.spec.ts`), et neid saaks tervikuna läbi lugeda

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

Jõulude päevasarjad kirjutab **stsenaariumimootor** (`src/domain/story`, lood kaustas `src/data/scenarios`): kõigepealt planeeritakse kogu sari (`planner.ts`), siis kirjutatakse plaani järgi kirjad (`render.ts`) ja lõpuks kontrollitakse tervikut (`validate.ts`). Näidissarjad Rubenile, Jasperile ja Britale on kaustas [docs/samples](docs/samples); arhitektuur, toimetamise põhimõtted ja juhised uute lugude, järjejuttude, tegelaste ja sündmuste lisamiseks on failis [docs/scenario-engine.md](docs/scenario-engine.md).

## Tulevane AI-integratsioon
UI kasutab ainult liidest `ContentGenerator` (`generate`, `regenerateItem`) läbi `useGenerator()`. AI-teenuse lisamiseks tee serveripoolne teenus, mis implementeerib sama liidese. API-võtmeid ei tohi kunagi panna frontendi.

## Teadaolevad piirangud
- Vaba teksti lisasoove mallimootor ei tõlgenda; need kuvatakse lapsevanemale meelespeana
- Ebareeglipäraste nimede käänded vajavad profiilis omastava vormi
- Andmed on ainult ühes brauseris; kontosid ega sünkroonimist pole
- Malliandmepangad on piiratud: vanema generaatori (üksikkirjad, 3 kirja, ühine kiri mitmele lapsele, muud sündmused) pikas sarjas võib üksik lause korduda
- Stsenaariumimootor katab praegu jõulude 7- ja 24-kirjalisi sarju; kaks samas vanuserühmas last jagavad järjejutu vaatenurka ning lapse päris vastust ei saa veel kinnitada (lood on kirjutatud nii, et vastust pole vaja)
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
