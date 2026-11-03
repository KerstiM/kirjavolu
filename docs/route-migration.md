# Kaks teekonda: audit ja marsruutide üleviimine

Haru `feature/two-journeys`. Neli katsetust (`/`, `/uus-disain`, `/ud2`, `/ud3`) on liidetud kaheks peamiseks teekonnaks: avaleht `/` ja jõulukirjad `/joulukirjad`. Ümbersuunamised **ei ole sisse lülitatud** ja tootmisse pole midagi viidud; see dokument on plaan heakskiitmiseks.

## 1. Audit: mis oli enne liitmist

| Aadress | Mis see oli | Mis töötas hästi | Mis jäi vajaka |
|---|---|---|---|
| `/` | Vana kujunduse avaleht (`HomePage.vue`), viisard `/loo`, eelvaade `/looming/:id`, lapsed `/lapsed`, näide `/naide` | Kõik kuus tüüpi viisardis, hooaja ideed, „Minu loomingud“, ümbrikuanimatsioon, printimine/PDF | Jõulupassi ega isiklikke kirju ei olnud; vana visuaal |
| `/uus-disain` | Uue kujunduse avaleht ja kõik alamlehed (`/uus-disain/loo`, `/looming`, `/lapsed`, `/naide`, `/joulupass`, `/tingimused`, `/privaatsus`) | Postkaardid, margid, aadressisildid, maskott; Jõulupassi ost ja AI-kirjad | Aardejaht, mõistatused, kalender ja diplom olid „Töös“ (hallid); pass eraldi lehel, kus laps ja andmed küsiti uuesti ning tehti uus looming |
| `/ud2` | `/uus-disain` avaleht lühikese jõuluteekonna linkidega + `/ud2/alusta` ja `/ud2/kirjad/:id` | Üks küsimus, 24 tasuta kirja kohe, isiklikumaks samal lehel, Stripe tuleb samale lehele tagasi | Pakkumine ilma võrdluse ja selge koguseta; ooteajal väljamõeldud etapid („Esimesed kirjad on pooleli…“); katkenud kirjutamist ei märgatud; passi koodi ei näidatud pärast ostu |
| `/ud3` | Uus avaleht (`Ud3Home.vue`): kompaktne kangelasplokk, kuus tüüpi kohe all, hooaeg, näidised, sammud, privaatsus | Selge, soe, kompaktne | Hooaeg kõvasti kodeeritud; „Minu loomingud“ puudus; lingid viisid `/uus-disain/...` alla |

**Maksed ja genereerimine (muutmata):** `worker/seasonPass.ts` (Stripe Embedded Checkout, kood `KV-XXXX-XXXX`, D1 `season_passes`, webhook + tagasituleku lehe kontroll), `worker/passLetters.ts` (24 AI-kirja ühe päringuga, loomiskord võetakse atomaarselt enne AI-kutset ja antakse tagasi, kui AI ebaõnnestub), `worker/passStory.ts`. Ainus serveri muudatus: `RETURN_TO` lubab lisaks `/ud2/kirjad/<id>`-le ka `/joulukirjad/<id>` ja `/joulupass`.

**Jõulupass praegu (ärireeglid muutmata):** ühekordne ost 9,90 €, mitte tellimus. Kood annab 10 loomiskorda (üks korda = ühe lapse 24-kirjaline sari või üks AI-lugu) ja 30 päkapiku muudatust (üks kiri või lehekülg ümber). Sobib mitmele lapsele (iga laps kulutab ühe sarja). Kehtib ostule järgneva 31. jaanuari lõpuni. Kordade lõppedes vastab server `used_up` ja leht pakub uut ostu. Jääk on menüüs („Jõulupass 9“), avalehe hooajaplokis ja `/joulupass` lehel. Taastamine: kood on brauseri `localStorage`'is ja Stripe'i kviitungil; teises seadmes sisestatakse kood (`/joulupass` või „Mul on juba kood“).

**Terminoloogia soovitus:** kasutajale on „loomiskord“ ja „kirjasari või lugu“ segased. Ettepanek (vajab otsust, pole tehtud): „Jõulupass: 10 isiklikku kirjasarja või lugu“ ja jäägi juures „isiklikke sarju alles 9“. „Päkapiku muudatus“ on arusaadav.

## 2. Mis nüüd kus on

| Teekond | Aadress | Kood |
|---|---|---|
| Avaleht | `/` (ka `/ud3`) | `src/features/home/HomePage.vue`, `content.ts`, `seasonal.ts` |
| Jõulukirjad | `/joulukirjad`, `/joulukirjad/:id` (ka `/ud2/alusta`, `/ud2/kirjad/:id`) | `src/features/christmas/` |
| Viisard, eelvaade, lapsed, näide | `/loo`, `/looming/:id`, `/lapsed`, `/naide` (ka `/uus-disain/...`) | samad komponendid, uus kujundus vaikimisi |
| Jõulupassi kood ja jääk | `/joulupass` (ka `/uus-disain/joulupass`) | `src/features/pass/PassPage.vue` |
| Võrdluseks alles | `/uus-disain`, `/ud2` (avalehed) | `src/features/home/new/HomeNewPage.vue`, ribaga „Varasem testvaade“ |

Ükski link rakenduses ei vii enam `/uus-disain…`, `/ud2…` ega `/ud3` aadressile.

## 3. Sõltuvused, mida ümbersuunamine peab arvestama

1. **Stripe'i tagasipöördumine.** Pooleli ostud (alustatud enne deploy'd) tulevad tagasi aadressile `/ud2/kirjad/<id>?session_id=…` või `/uus-disain/joulupass?session_id=…`. Ümbersuunamine peab **päringu (`?session_id=…`) alles jätma**, muidu ostja ei näe koodi ja kirjad jäävad kirjutamata. Checkout Session aegub Stripe'is 24 tunni pärast, seega vähemalt 24 h pärast deploy'd peavad vanad aadressid kas töötama või päringuga edasi suunama.
2. **Serveri vaikimisi tagasitulek** (`RETURN_PATH = '/uus-disain/joulupass'`): kasutatakse ainult siis, kui klient `returnTo`'d ei saada (vanema versiooni JS vahemälust). Muuta `'/joulupass'`-ks alles pärast seda, kui `/uus-disain/joulupass` suunab päringuga edasi.
3. **Brauseri andmed** (`localStorage`: `kirjavolu.state`, `kirjavolu.joulupass`, `kirjavolu.joulupass.detsember`, `kirjavolu.ud2.pending`) on aadressist sõltumatud; võtmeid ei muudetud.
4. **Jagatud lingid ja kampaaniad.** Repos ei leidnud ühtegi viidet `/ud2`, `/ud3` ega `/uus-disain` aadressile väljaspool rakendust ennast (README, docs, workflow'd). Kampaaniamaterjale, e-kirju ja sotsiaalmeedia postitusi repos ei ole: **palun kontrolli need ise** (sh Stripe'i tootelehe ja kviitungi tekst, kui seal on link).
5. **Analüütika.** Umami loeb lehti aadressi järgi; pärast suunamist kaovad vanad aadressid statistikast.

## 4. Ümbersuunamise plaan (pärast heakskiitu)

Rakenduse sees (`src/app/router.ts`), päringut ja räsi säilitades. Näide:

```ts
{ path: '/ud3', redirect: '/' },
{ path: '/ud2', redirect: '/joulukirjad' },
{ path: '/ud2/alusta', redirect: '/joulukirjad' },
{ path: '/ud2/kirjad/:id', redirect: (to) => ({ path: `/joulukirjad/${to.params.id}`, query: to.query, hash: to.hash }) },
{ path: '/uus-disain', redirect: '/' },
{ path: '/uus-disain/:rest(.*)', redirect: (to) => ({ path: `/${to.params.rest}`, query: to.query, hash: to.hash }) },
```

Kliendipoolne suunamine sobib, sest Cloudflare serveerib igale aadressile `index.html`-i (`not_found_handling: single-page-application`). Otsingumootorite jaoks võib hiljem lisada Workeri 301-suunamise samade reeglitega.

Järjekord:

1. Ühenda see haru `main`-i ja deploy (vanad aadressid töötavad edasi).
2. Kontrolli tootmises Stripe'i **testrežiimis**: `/joulukirjad` → tasuta kirjad → ost testkaardiga `4242 4242 4242 4242` → tagasitulek → kirjutamine. Ka `/joulupass` ost.
3. Oota vähemalt 24 h (pooleli Checkout Sessionid aeguvad).
4. Lülita sisse ülaltoodud suunamised, muuda `RETURN_PATH` → `'/joulupass'`, uuenda teste.
5. Pärast kokkulepitud aega eemalda `HomeNewPage.vue`, `readiness.ts` hallide kaartide loogika ja vana kujunduse (`design === 'current'`) harud komponentides (`StepType`, `StepOccasion`, `StepChildren`, `ChildCard`, `EnvelopeReveal`, `Mascot`, `DemoPage`, `PreviewPage`, `ChildrenPage`, legal-lehed). Vana kood jääb Giti ajalukku.

## 5. Teadaolevad piirangud ja soovitused

- **Katkenud kirjutamine.** Server kirjutab 24 kirja ühe päringuga ja tagastab need ainult sellele päringule. Kui leht suletakse kirjutamise ajal, kulub loomiskord, aga kirjad kaovad. Nüüd: brauser küsib enne sulgemist kinnitust; uuesti avades märkab leht katkestust, küsib serverilt jääki ja ütleb ausalt, kas kord kulus (koos e-postiga, kuhu kirjutada). **Soovitus:** päringu idempotentsusvõti ja tulemuse lühiajaline hoidmine serveris, et uuesti avades saaks kirjad kätte. See tähendab lapse kirjade hoidmist serveris, mis **muudab privaatsuspõhimõtteid** („Neid ei salvestata“), seega vajab see eraldi otsust.
- **Kirjutamise kestus.** Tegelikku aega ei mõõdetud (päris AI-kutse kulutaks päris raha ja vajab saladusi). Varasem tekst ütles „umbes poolteist minutit“, README „paar minutit“; ooteolek ütleb nüüd „tavaliselt paar minutit“ ja näitab kulunud aega. Mõõda tootmise logidest (Cloudflare observability) ja täpsusta teksti.
- **Isiklikud kirjad asendavad tasuta kirjad.** Käsitsi tehtud muudatused mallikirjades kaovad; pakkumine ütleb seda. Kui see häirib, võiks isiklik sari tulla uue loominguna.
- **Kuus tüüpi uues kujunduses.** Aardejaht, salamissioon, kalender ja diplom olid `/uus-disain` all „Töös“. Nüüd on kõik kuus valitavad, sest need töötasid vanas kujunduses samade mallide, eelvaate ja printimisega. Kontrolli nende eelvaate välimust uues kujunduses üle (aardejaht on brauseris läbi proovitud).
