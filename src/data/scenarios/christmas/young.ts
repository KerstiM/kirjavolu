import type { Scenario } from '../../../domain/story/types'

/**
 * Letters from the young, lively elf to a reader of about 5–7. Short sentences,
 * warm and playful; the elf cooks, experiments and gets into harmless trouble.
 */

const COOKIES = 4 * 5 - 3 - 1

export const YOUNG_SCENARIOS: Scenario[] = [
  {
    id: 'three-panel-comic',
    title: 'Koomiks kolmest pildist',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['comics'],
    tags: ['comics', 'reindeer', 'drawing'],
    tones: ['humorous'],
    variants: {
      young: (c) => [
        'Ma joonistasin eile koomiksi! Selles on kolm pilti.',
        'Esimesel pildil kõnnib põhjapõder Välk jää peal. Teisel pildil libiseb ta – vuhh! – ja tal on jalad igas suunas. Kolmandat pilti ma veel ei joonistanud, sest ma ei tea, mis edasi juhtub.',
        c.uses('comics') &&
          'Sina loed ju Miki Hiire koomikseid, nii et sa tead: viimane pilt on kõige tähtsam!',
      ],
    },
    activities: {
      young: {
        text: () => 'Kui tahad, joonista sina kolmas pilt: mis Välgust sai?',
        prep: 'paber ja värvipliiatsid',
      },
    },
  },
  {
    id: 'riddle-contest',
    title: 'Mõistatusvõistlus Välguga',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['riddles'],
    tags: ['riddle', 'reindeer'],
    tones: ['humorous'],
    variants: {
      young: (c) => [
        'Eile pidasime mõistatusvõistlust: mina ja põhjapõder Välk. Välk teab ainult ühte mõistatust: „Kes on kõige ilusam põhjapõder?“ Vastus on alati „Välk“.',
        c.uses('riddles')
          ? 'Mina esitasin talle päris mõistatuse. Sina oled ju mõistatusesõber – see on sulle ka:'
          : 'Mina esitasin talle päris mõistatuse. Nüüd esitan selle sulle ka:',
        'Valge, aga ei ole suhkur. Külm, aga ei ole jäätis. Tuleb taevast ja sulab peos. Mis see on?',
      ],
    },
    activities: {
      young: {
        essential: true,
        text: () => 'Homme ütlen vastuse.',
        answer: 'lumi',
        reveal: () => 'Eilse mõistatuse vastus oli: lumi. Välk arvas, et jäätis.',
      },
    },
  },
  {
    id: 'bird-thieves',
    title: 'Tihased ja sokk',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['animals'],
    tags: ['birds', 'laundry'],
    tones: ['humorous', 'heartwarming'],
    variants: {
      young: (c) => [
        'Eile panin aknale lindudele seemneid. Tihased tulid, sõid kõhud täis – ja lendasid minema minu sokiga, mis aknal kuivas!',
        'Täna nägin oma sokki kuuse otsas. Tihased on teinud sellest talvemaja. Välja paistavad kaks pead ja üks saba.',
        c.uses('animals')
          ? 'Sina oled ju loomasõber, sa tead: linnud tahavad talvel sooja. Mina saan uue soki.'
          : 'Las nad peavad selle. Mina saan uue soki.',
      ],
    },
    activities: {
      young: {
        text: () => 'Kui tahad, pane koos täiskasvanuga aknalauale paar seemet.',
        prep: 'peotäis päevalilleseemneid lindudele (valikuline)',
      },
    },
  },
  {
    id: 'salt-ice',
    title: 'Jää ja sool',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['experiment', 'reindeer', 'sleigh'],
    tones: ['adventurous'],
    variants: {
      young: () => [
        'Mina olen töökoja katsetaja. Jõuluvana kelgujalased olid jäätunud ja ma tahtsin teada, kuidas jää kõige kiiremini sulab.',
        'Panin kaks jääkuubikut taldrikule ja puistasin ühele soola. Siis vaatasin. Ja vaatasin.',
        'Aga enne, kui ma tulemust nägin, sõi Välk mõlemad ära. Nüüd pead sina mind aitama.',
      ],
    },
    activities: {
      young: {
        essential: true,
        text: () => 'Palu täiskasvanult kaks jääkuubikut ja puista ühele soola. Kumb sulab enne?',
        answer: 'Soolaga jääkuubik sulab kiiremini.',
        reveal: () =>
          'Eilse katse vastus: soolaga jää sulab kiiremini. Seepärast puistatakse talvel teedele soola. Kelgujalased on nüüd jälle libedad.',
        prep: 'kaks jääkuubikut ja natuke soola',
      },
    },
  },
  {
    id: 'pancake-moon',
    title: 'Pannkook laes',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['kitchen'],
    tones: ['humorous'],
    variants: {
      young: () => [
        'Ma õppisin eile pannkooke keerama nagu päris kokad – pannilt õhku ja tagasi!',
        'Esimene pannkook kukkus põrandale. Teine kukkus kass Nurri peale. Kolmas lendas nii kõrgele, et jäi lakke kinni.',
        'Ta on seal siiani. Jõuluvana ütles, et las jääb, see on nüüd töökoja kuu. Õhtul, kui tuled kustuvad, on ta tõesti natuke kuu moodi.',
      ],
    },
  },
  {
    id: 'odd-sock',
    title: 'Üks sokk jäi üle',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['laundry', 'reindeer'],
    tones: ['humorous'],
    variants: {
      young: () => [
        'Töökojas oli pesupäev. Ma panin sokid paaridesse ja üks sokk jäi üle: punane, valgete triipudega. Paariline oli kadunud.',
        'Otsisin terve päeva. Kapist, voodi alt, pesukorvist. Ei kusagil!',
        'Õhtul tuli põhjapõder Välk tallist välja ja see sokk oli tal ühe kõrva peal. Ta ei öelnud midagi – ta on ju põder –, aga ta nägi välja väga uhke. Las kannab.',
      ],
    },
  },
  {
    id: 'jumping-frog',
    title: 'Hüppekonn supis',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['toys', 'santa', 'kitchen'],
    tones: ['humorous'],
    variants: {
      young: () => [
        'Minu eilne töö oli mänguasjade proovimine. Iga mänguasi peab enne kelku saamist läbi proovi: kas ta töötab ja kas ta teeb rõõmu.',
        'Kõige raskem oli hüppekonn. Kui ma talle selga vajutasin, hüppas ta nii kõrgele, et kadus. Otsisime teda tükk aega.',
        'Leidsime ta lõunasöögi ajal Jõuluvana supikausist. Jõuluvana ütles, et supp on nüüd eriti hüplik. Konn sai hindeks viie.',
      ],
    },
  },
  {
    id: 'glitter-sneeze',
    title: 'Aevastus sädelusetoas',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['sparkle', 'santa'],
    tones: ['humorous', 'magical'],
    variants: {
      young: () => [
        'Töökojas on üks tuba, kus hoitakse sädelust. Sinna tohib minna ainult hiilides ja hinge kinni hoides.',
        'Mina läksin eile sinna paelu tooma – ja mul hakkas nina sügelema. Aaa… aaa… AATŠIHH!',
        'Nüüd sädeleb kõik: seinad, laud, kass ja Jõuluvana habe. Jõuluvana vaatas peeglisse ja ütles, et nii pidulik pole ta kunagi olnud.',
      ],
    },
  },
  {
    id: 'snowball-machine',
    title: 'Lumepallimasin',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['mechanism', 'snow'],
    tones: ['humorous'],
    variants: {
      young: (c) => [
        `${c.cast.older} ehitas lumepallimasina. See pidi tegema lumesõja jaoks palle – ükshaaval, ilusti ja rahulikult.`,
        'Mina vajutasin kogemata suurt punast nuppu. Masin hakkas palle tegema sada tükki minutis! Neid lendas igale poole: aknasse, katusele ja Jõuluvana kapuutsi.',
        `${c.cast.older} ütles, et see nupp oli „ainult katsetamiseks“. Nüüd on meil lumepalle terveks talveks.`,
      ],
    },
  },
  {
    id: 'cookie-count',
    title: 'Piparkoogiplaat',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['riddles'],
    tags: ['kitchen', 'puzzle', 'reindeer'],
    tones: ['humorous'],
    variants: {
      young: (c) => [
        'Ma küpsetasin eile piparkooke. Plaadil oli neli rida ja igas reas viis piparkooki.',
        'Siis tuli põhjapõder Välk ja sõi ära kolm. Siis tuli kass Nurr ja nuusutas ühte, aga ei söönud. Siis tulin mina ja sõin ühe – ainult proovimiseks.',
        c.uses('riddles') ? 'Nüüd on nuputamise kord sinul:' : 'Kas sa oskad välja arvutada?',
      ],
    },
    activities: {
      young: {
        essential: true,
        text: () => 'Mitu piparkooki jäi plaadile?',
        answer: `${COOKIES} piparkooki (20 − 3 − 1)`,
        reveal: () =>
          `Eilse piparkoogiülesande vastus: ${COOKIES}. Nurri nuusutatud piparkook on ka alles.`,
        check: () => COOKIES === 16,
      },
    },
  },
  {
    id: 'reindeer-bath',
    title: 'Välgu pesupäev',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['reindeer', 'kitchen'],
    tones: ['humorous'],
    variants: {
      young: () => [
        'Põhjapõder Välk leidis eile kuuri tagant moosipaja ja lükkas selle ümber. Ta oli kleepuv, magus ja täiesti õnnelik.',
        'Me pesime teda kolmekesi: mina, Jõuluvana ja üks suur käsn. Välk arvas, et see on mäng, ja raputas end iga minut. Sahh! Kõik olid märjad.',
        'Lõpuks oli Välk puhas. Meie mitte. Jõuluvana habe oli õhtulgi moosine.',
      ],
    },
  },
  {
    id: 'hiccup-bells',
    title: 'Luksumine ja kellukesed',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['bells', 'reindeer'],
    tones: ['humorous', 'magical'],
    variants: {
      young: () => [
        'Mul oli eile luksumine! Aga mitte tavaline – iga kord, kui ma luksusin, helisesid töökojas kõik kellukesed: kõlin!',
        'Proovisin vett juua, hinge kinni hoida ja pea peal seista. Ei aidanud. Kõlin! Kõlin!',
        'Lõpuks hiilis põhjapõder Välk mulle selja taha ja ütles kõrva: „Pöö!“ Ehmusin nii, et luksumine läks ära. Kellukesed on nüüd vaiksed. Peaaegu kahju.',
      ],
    },
  },
  {
    id: 'elf-porridge',
    title: 'Miks päkapikud putru armastavad',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['porridge'],
    tags: ['porridge', 'kitchen', 'tradition'],
    tones: ['heartwarming', 'humorous'],
    earliest: 5,
    variants: {
      young: (c) => [
        'Kas sa tead, miks päkapikud putru armastavad? Vanasti jäeti jõuluõhtul päkapikule kauss putru ja ta hoidis selle eest aasta otsa talu loomi.',
        c.uses('porridge')
          ? 'Sina sööd ju ka kõige meelsamini riisiputru – sa tead, et see on õige puder!'
          : 'Meie lemmik on puder kaneeli ja võisilmaga.',
        'Mina olen töökoja pudrukeetja. Eile küsis Jõuluvana kolm korda juurde. Neljandal korral ütlesin, et pada on tühi. Polnud – aga mul oli endal ka kõht tühi.',
      ],
    },
  },
  {
    id: 'pot-band',
    title: 'Pottidest trumm',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['music'],
    tags: ['music', 'kitchen', 'cat'],
    tones: ['humorous'],
    variants: {
      young: (c) => [
        'Töökoja jõulukontserdiks tegime bändi! Mina mängin trummi. Trummiks on kolm potti ja kaks puulusikat: bumm, kõll, plõnn!',
        'Põhjapõder Välk raputab kellukesi ja kass Nurr nurrub mikrofoni – teda on kuulda ainult siis, kui teised vait on.',
        c.uses('music')
          ? 'Sulle meeldib ju muusika. Mis pilli sina meie bändis mängiksid? Eile proovisime esimest korda ja Jõuluvana ütles, et see oli väga… vali.'
          : 'Eile proovisime esimest korda. Jõuluvana kuulas ja ütles, et see oli väga… vali.',
      ],
    },
  },
]
