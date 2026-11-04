import type { ChildProfile } from '../domain/models'

/**
 * Topics a parent picks for a child. Free text cannot be woven into a story without a
 * language model (the words would not decline, and nothing would know what happens
 * around them), so every topic here comes with hand-written story pieces. The scenarios
 * in data/scenarios/…/topics.ts build whole letters around them; hand-written scenarios
 * can also check for a topic (`c.uses('riddles')`).
 *
 * The list shows broad topics ("Pallimängud"), and their stories never assume more than
 * that. Under a picked topic the parent may write the child's own favourite in a few
 * words ("korvpall"); a narrower topic found there (`within`) brings its own stories.
 * Narrower topics are also found in the other free-text fields of the profile.
 */

export type TopicGroupId = 'play' | 'nature' | 'sport' | 'creative' | 'science' | 'stories'

export const TOPIC_GROUPS: { id: TopicGroupId; label: string }[] = [
  { id: 'play', label: 'Mängud ja mänguasjad' },
  { id: 'nature', label: 'Loomad ja loodus' },
  { id: 'sport', label: 'Sport ja liikumine' },
  { id: 'creative', label: 'Loovus' },
  { id: 'science', label: 'Teadus ja nuputamine' },
  { id: 'stories', label: 'Tegelased ja fantaasia' },
]

export type TopicId =
  | 'lego'
  | 'dolls'
  | 'vehicles'
  | 'boardgames'
  | 'videogames'
  | 'animals'
  | 'dinosaurs'
  | 'nature'
  | 'ballgames'
  | 'swimming'
  | 'cycling'
  | 'wintersports'
  | 'dance'
  | 'gymnastics'
  | 'drawing'
  | 'crafts'
  | 'music'
  | 'baking'
  | 'theatre'
  | 'riddles'
  | 'science'
  | 'space'
  | 'robots'
  | 'books'
  | 'characters'
  | 'superheroes'
  | 'fairytales'
  | 'pirates'
  | 'rubik'
  | 'codes'
  | 'chess'
  | 'minecraft'
  | 'cars'
  | 'trains'
  | 'cats'
  | 'dogs'
  | 'horses'
  | 'football'
  | 'basketball'
  | 'skating'
  | 'skiing'
  | 'comics'
  | 'peppa'
  | 'pawpatrol'
  | 'frozen'
  | 'princesses'
  | 'knights'
  | 'porridge'
  | 'pancakes'
  | 'icecream'

/** The parent's own words under a picked topic: `{ ballgames: 'korvpall' }`. */
export type TopicNotes = Partial<Record<TopicId, string>>

export interface Topic {
  id: TopicId
  /** Shown on the profile form and in parent-facing summaries. */
  label: string
  /** Where a listed topic is shown on the form; narrower topics have none. */
  group?: TopicGroupId
  /** Examples for the parent's own words under a listed topic. */
  hint?: string
  /** A narrower topic: found in what is written under this topic (or among the favourite foods). */
  within?: TopicId | 'foods'
  /** A narrower topic as words under its broad one, for profiles that picked it from the older list. */
  note?: string
  /** Finds the topic in free-text profile fields (older profiles, "Muud huvid", the words under a topic). */
  match: RegExp
  /** Finds the topic in a written letter, so the validator can report an unplanned mention. */
  mentions: RegExp
  /** The helper tries the child's interest on a free evening: two or three sentences, first person. */
  tryout: string
  /** Reindeer Välk has caught the same interest: two or three sentences. */
  reindeer: string
  /** One-line versions of the same two stories for the smallest children. */
  toddlerTryout: string
  toddlerReindeer: string
}

export const TOPICS: Topic[] = [
  // Mängud ja mänguasjad
  {
    id: 'lego',
    label: 'Klotsid ja ehitamine',
    group: 'play',
    hint: 'nt LEGO, Duplo, magnetklotsid',
    match: /lego|klots/i,
    mentions: /klotsimeist|klotsiehit/i,
    tryout:
      'Ehitasin klotsidest Jõuluvanale uue kelgu: katuse, tulede ja isegi kohvitopsihoidjaga. Kõik oli valmis, ainult üks klots jäi üle. Nüüd ei saa ma aru, kuhu see klots käima pidi, ja kelk kõigub natuke.',
    reindeer:
      'Ta on õppinud klotse kokku panema – ninaga. Eile ehitas ta torni, mis oli peaaegu sama kõrge kui tema ise. Siis aevastas. Klotse korjasime kahekesi õhtuni.',
    toddlerTryout: 'Ma ehitan klotsidest torni: üks, kaks, kolm klotsi. Torn kõigub … ja kukub: põmm!',
    toddlerReindeer: 'Välk pani klotsi klotsi peale. Torn läks kõrgeks! Siis tuli aevastus: põmm!',
  },
  {
    id: 'dolls',
    label: 'Nukud ja kaisuloomad',
    group: 'play',
    hint: 'nt kaisujänes, nukumaja',
    match: /nukk|nuku|kaisu|mängukaru/i,
    mentions: /\bnukk|nukumaja|nukuvank/i,
    tryout:
      'Õmblesin töökoja vanale kaisukarule uue kampsuni. Varrukad tulid eri pikkusega ja kaelaauk jäi liiga väikeseks. Nüüd kannab karu kampsunit peas nagu mütsi ja näeb väga rahul välja.',
    reindeer:
      'Ta on leidnud endale kaisukaru. Ta kannab seda suus igale poole kaasa ja õhtul paneb selle enda kõrvale heinale magama. Kui keegi karu puudutab, vaatab Välk väga tõsiselt.',
    toddlerTryout: 'Kaisukaru on pehme. Kallistame karu: kalli-kalli! Karu jääb magama: tsss.',
    toddlerReindeer: 'Välgul on kaisukaru. Välk paneb karu heinale magama. Head ööd, karu!',
  },
  {
    id: 'vehicles',
    label: 'Sõidukid ja masinad',
    group: 'play',
    hint: 'nt autod, rongid, traktorid',
    match: /sõiduk|masinad|lennuk|buss|ekskavaator|tuletõrje|prügiauto/i,
    mentions: /sõiduk/i,
    tryout:
      'Ehitasin töökojas oma sõiduki: pappkastist kere, niidirullidest rattad ja potikaanest rool. Lükkasin selle mäe otsa ja istusin peale. Sõiduk sõitis alla väga kiiresti – kahjuks ilma minuta. Ühte ratast otsime siiani.',
    reindeer:
      'Ta seisab iga päev tee ääres ja vaatab, kes mööda sõidab: kelgud, lumesahk, postiauto. Igale sõidukile noogutab ta tervituseks. Eile noogutas postiauto juht vastu ja Välk oli terve päeva väga uhke.',
    toddlerTryout: 'Mul on väike sõiduk. Rattad teevad: vurr-vurr! Sõidame ümber kuuse: tuut-tuut, tee vabaks!',
    toddlerReindeer: 'Välk vaatab teed. Seal sõidab suur masin: brumm-brumm! Välk lehvitab sabaga. Lehvita sina ka!',
  },
  {
    id: 'boardgames',
    label: 'Laua- ja kaardimängud',
    group: 'play',
    hint: 'nt male, Uno, Alias',
    match: /lauamäng|täring|kaardimäng|monopol|alias/i,
    mentions: /lauamäng|täring/i,
    tryout:
      'Mängisime päkapikkudega lauamängu. Viskasin täringuga kolm kuut järjest ja jõudsin peaaegu lõppu. Siis astusin mao peale ja pidin algusesse tagasi minema. Mäng kestis südaööni.',
    reindeer:
      'Ta on õppinud täringut veeretama. Kui tuleb kuus, hüppab ta rõõmust. Kui tuleb üks, keerab ta täringu salaja ümber. Mina nägin seda, aga ei öelnud kellelegi.',
    toddlerTryout: 'Täring veereb: rull-rull-rull. Mitu silma täringul on? Loeme koos: üks, kaks, kolm!',
    toddlerReindeer: 'Välk veeretas täringut ninaga. Täring hüppas: hopp! Täringul tuli kuus silma. Hurraa!',
  },
  {
    id: 'videogames',
    label: 'Videomängud',
    group: 'play',
    hint: 'nt Minecraft, Mario, Roblox',
    match: /videomäng|arvutimäng|konsool|playstation|nintendo|xbox|mario|roblox|fortnite|minecraft/i,
    mentions: /videomäng|arvutimäng|mängupul/i,
    tryout:
      'Jõuluvana arvutis on üks videomäng, kus päkapikk püüab langevaid kingipakke. Püüdsin kolm pakki, siis kukkus mu päkapikk korstnasse. Mängisin südaööni ja jõudsin teise tasemeni. Jõuluvana ütles, et tema pole sinna kunagi jõudnud.',
    reindeer:
      'Ta on avastanud videomängud. Ta vaatab ekraani nii lähedalt, et nina jätab klaasile jälje, ja vajutab mängupuldil sõrgaga alati sama nuppu. Tema päkapikk hüppab ja hüppab ega jõua kuhugi, aga Välk on väga õnnelik.',
    toddlerTryout: 'Ekraanil hüppab väike päkapikk: hopp, hopp! Vajutan nuppu: piip! Päkapikk püüab tähe. Hurraa!',
    toddlerReindeer: 'Välk vajutas ninaga nuppu: piip! Ekraanil hüppas jänku. Välk hüppas ka: hopp!',
  },
  // Loomad ja loodus
  {
    id: 'animals',
    label: 'Loomad',
    group: 'nature',
    hint: 'nt kassid, koerad, hobused',
    match: /loom(?!ing)/i,
    mentions: /loomasõb/i,
    tryout:
      'Käisin metsas loomade jälgi otsimas. Leidsin jänese, rebase ja ühe väga suure jälje. Ajasin seda tükk aega taga, kuni selgus, et see oli minu enda saapajälg.',
    reindeer:
      'Ta on kutsunud metsloomad lauta külla: jänese, oravapere ja ühe uudishimuliku rebase. Jänes ja oravad söövad tema heina, rebane soojendab end nurgas ja Välk on väga õnnelik. Jõuluvana ütles, et laut on nüüd loomaaed.',
    toddlerTryout: 'Metsas elab jänes. Jänes hüppab: hopp, hopp! Hüppame nagu jänes!',
    toddlerReindeer: 'Välgul olid külas jänes ja orav. Jänes sõi heina. Orav sõi käbi. Krõmps!',
  },
  {
    id: 'dinosaurs',
    label: 'Dinosaurused',
    group: 'nature',
    hint: 'nt türannosaurus',
    match: /dino|türannosaur/i,
    mentions: /dinosau/i,
    tryout:
      'Tegin lumest dinosauruse: pikk kael, hiiglaslik saba ja selg täis teravaid jääpurikaid. Hommikuks oli ta pooleldi sulanud ja nägi välja nagu suur lumine part. Jõuluvana kiitis ikkagi.',
    reindeer:
      'Ta käib ringi suurte sammudega ja möirgab. Ta arvab, et on dinosaurus. Kõige naljakam on see, et päkapikud jooksevad tõesti peitu – kuni ta ise naerma hakkab.',
    toddlerTryout: 'Dinosaurus teeb suuri samme: tömps, tömps! Ja möirgab: ruaah! Möirga sina ka!',
    toddlerReindeer: 'Välk mängis dinosaurust. Ta astus: tömps, tömps! Ja möirgas: ruaah! Hirmus?',
  },
  {
    id: 'nature',
    label: 'Loodus ja matkamine',
    group: 'nature',
    hint: 'nt seenel käimine, linnuvaatlus',
    match: /mets|loodus|matk/i,
    mentions: /matkal|matkaja|loodusesõb/i,
    tryout:
      'Käisin metsas matkal. Võtsin kaasa termose, kompassi ja kolm võileiba. Kompass näitas kogu aeg põhja ja mina läksin kompassi järgi. Jõudsin otse tagasi töökotta – meie töökoda ongi ju kõige põhjas.',
    reindeer:
      'Ta käib igal hommikul metsas ja toob midagi kaasa: käbi, samblatüki või puukoore. Kõik need on ta lauda seina äärde ritta pannud. Arvan, et ta teeb muuseumi.',
    toddlerTryout: 'Metsas on kuused ja käbid. Käbi on pruun ja krobeline. Leiame koos ühe käbi!',
    toddlerReindeer: 'Välk tõi metsast käbi. Ja samblat. Ja oksa. Nüüd on laudas oma väike mets!',
  },
  // Sport ja liikumine
  {
    id: 'ballgames',
    label: 'Pallimängud',
    group: 'sport',
    hint: 'nt jalgpall, korvpall',
    match: /pallimäng|korvpall|jalgpall|võrkpall|käsipall|sulgpall|tennis/i,
    mentions: /pallimäng/i,
    tryout:
      'Leidsin töökojast vana palli ja proovisin kõiki pallimänge korraga: viskasin, põrgatasin, lõin jalaga ja püüdsin. Kõige paremini läks püüdmine – kui Välk palli tagasi tõi. Nüüd on pall natuke lömmis ja Välk väga rahul.',
    reindeer:
      'Ta on hakanud pallimänge mängima. Reegleid ta ei tea, seega mõtleb ise välja: palli võib lükata ninaga, visata sarvedega ja vahel ka lihtsalt ära peita. Päkapikud mängivad kaasa, aga keegi pole veel aru saanud, kes võidab.',
    toddlerTryout: 'Pall põrkab: põmm-põmm! Pall veereb: rull-rull! Viska mulle palli – ma püüan kinni!',
    toddlerReindeer: 'Välk põrgatas palli ninaga: põmm! Pall hüppas üles. Välk hüppas ka: hopp!',
  },
  {
    id: 'swimming',
    label: 'Ujumine ja veemängud',
    group: 'sport',
    hint: 'nt ujumistrenn, veepark',
    match: /ujumi|ujuma|bassein/i,
    mentions: /ujuja|ujumi|bassein/i,
    tryout:
      'Proovisin ujuda. Talvel on järv jääs, seega täitsin pesukausi sooja veega ja tegin seal kolm tõmmet. Pärast oli pool töökoda märg ja Jõuluvana küsis, kas meil on uus bassein.',
    reindeer:
      'Ta on kuulnud, et põhjapõdrad oskavad ujuda. Nüüd harjutab ta lumes: lamab kõhuli ja liigutab jalgu nagu ujuja. Lumi lendab igas suunas, aga edasi ta ei liigu.',
    toddlerTryout: 'Kalake ujub: lips-lops. Mina ujun ka: käed ette ja jalad sulpsti-sulpsti!',
    toddlerReindeer: 'Välk tahtis ujuda. Aga järv oli jääs! Välk libises kõhuli üle jää: vuhh!',
  },
  {
    id: 'cycling',
    label: 'Rattasõit',
    group: 'sport',
    hint: 'nt jalgratas, tõukeratas',
    match: /jalgratas|jalgratta|rattasõi|tõukeratas/i,
    mentions: /jalgratta|rattasõi/i,
    tryout:
      'Proovisin jalgrattaga sõita. Lumes see eriti hästi ei lähe: ratas sõitis edasi, aga mina jäin hange istuma. Järgmine kord ootan kevadet ja kuiva teed.',
    reindeer:
      'Ta seisis eile tükk aega töökoja jalgratta kõrval ja nuusutas pedaale. Siis proovis ta ise peale ronida. Neli jalga ja kaks pedaali – see ei läinud kokku. Nüüd vaatab ta ratast austusega.',
    toddlerTryout: 'Ratas veereb: vurr-vurr! Kell teeb: tilin-tilin! Sõidame koos: vurr!',
    toddlerReindeer: 'Välk nägi jalgratast. Kell tegi: tilin! Välk ehmus ja hüppas: hopp!',
  },
  {
    id: 'wintersports',
    label: 'Talverõõmud',
    group: 'sport',
    hint: 'nt kelgutamine, suusatamine, uisutamine',
    match: /talverõõm|talisport|talvesport|kelgut|hoki/i,
    mentions: /kelgut|talisport/i,
    tryout:
      'Läksin õhtul kelgumäele. Esimene sõit läks hästi, teine veel paremini ja kolmandaks korraks võtsin peale kolm päkapikku. Kelk sõitis nii kaugele, et tagasi jalutasime pool tundi. Kelgutamine on vist parim asi, mida talvel teha.',
    reindeer:
      'Ta on avastanud kelgutamise – ilma kelguta. Ta jookseb mäe otsa, viskab end kõhuli ja libiseb alla nagu suur pruun kelk. All ootavad päkapikud ja annavad hindeid. Eile sai ta kümme punkti ja ühe porgandi.',
    toddlerTryout: 'Kelk sõidab mäest alla: vuhh! Lumi pritsib: pläts! Lähme veel: üles-üles ja vuhh!',
    toddlerReindeer: 'Välk libises kõhuli mäest alla: vuhh! Nagu kelk! Lumi lendas. Veel üks kord!',
  },
  {
    id: 'dance',
    label: 'Tantsimine',
    group: 'sport',
    hint: 'nt ballett, rahvatants',
    match: /tants|ballett/i,
    mentions: /tantsija|ballett/i,
    tryout:
      'Proovisin tantsida. Üks päkapikk mängis viiulit ja mina keerutasin, kuni kõik pöörles – ka siis, kui olin juba seisma jäänud. Päkapikud plaksutasid ja ütlesid, et nii keerulist tantsu pole nad varem näinud.',
    reindeer:
      'Ta tahab saada tantsijaks. Kui keegi töökojas viiulit mängib, tõstab ta ühe esijala ja keerutab. Jõuluvana ütles, et põhjapõdrabaletti pole ta oma pika elu jooksul veel näinud.',
    toddlerTryout: 'Trall-lall-lall! Ma tantsin: keerutan ringi ja hüppan: hopp! Tantsime koos!',
    toddlerReindeer: 'Välk kuulis viiulit ja hakkas tantsima: keerutas ja hüppas. Tantsija Välk!',
  },
  {
    id: 'gymnastics',
    label: 'Turnimine ja ronimine',
    group: 'sport',
    hint: 'nt batuut, akrobaatika, mänguväljak',
    match: /turni|võimle|akrobaat|batuut|kukerpall|ronimi|ronida/i,
    mentions: /kukerpall|võimleja/i,
    tryout:
      'Proovisin teha kukerpalli nagu päris võimleja. Esimene läks viltu, teine veel rohkem viltu ja pärast kolmandat ei teadnud ma enam, kus on üleval ja kus all. Jõuluvana hoidis mul käest kinni, kuni maailm jälle paigal seisis.',
    reindeer:
      'Ta harjutab võimlemist. Igal hommikul sirutab ta jalgu, kõverdab selga ja proovib seista ainult kahel jalal. Kauem kui kaks sekundit see veel ei kesta, aga päkapikud loevad iga kord valjusti ja plaksutavad.',
    toddlerTryout: 'Hüppame: hopp-hopp! Sirutame käed üles – ja nüüd kükki! Veereme ringi nagu pall: vuuh!',
    toddlerReindeer: 'Välk tegi kukerpalli: vuhh! Kõik neli jalga olid korraks üleval. Siis naeris: hõh-hõh!',
  },
  // Loovus
  {
    id: 'drawing',
    label: 'Joonistamine ja maalimine',
    group: 'creative',
    hint: 'nt vesivärvid, kriidid',
    match: /joonist|maali|kunst/i,
    mentions: /kunstnik/i,
    tryout:
      'Proovisin joonistada Jõuluvana portree. Nina tuli liiga suur ja habe liiga lühike. Jõuluvana vaatas pilti tükk aega ja ütles: „Väga ilus põhjapõder.“ Nüüd ripub see lauda seinal.',
    reindeer:
      'Ta peab end nüüd kunstnikuks. Eile joonistas ta sõrgaga lumme suure ringi ja kaks täppi. Ta väidab, et see olen mina. Ma pole kindel, aga täpid on tõesti minu moodi.',
    toddlerTryout: 'Mul on punane pliiats. Joonistan ringi: ring-ring-ring. Ja täpi: täpp! Joonista sina ka!',
    toddlerReindeer: 'Välk joonistas sõrgaga lumme ringi. Ring! Ja kaks silma. See on päike!',
  },
  {
    id: 'crafts',
    label: 'Meisterdamine',
    group: 'creative',
    hint: 'nt voolimine, paberitööd',
    match: /meisterd|voolim|plastiliin|käsitöö/i,
    mentions: /meisterda/i,
    tryout:
      'Meisterdasin paberist lumehelbe. Voltisin, lõikasin ja voltisin veel. Kui lahti tegin, oli see hoopis paberist põhjapõder – kolme sarve ja kahe sabaga. Jõuluvana pani selle ikkagi aknale.',
    reindeer:
      'Ta toob mulle igal hommikul midagi meisterdamiseks: oksa, sulekese, väikese kivi. Arvan, et ta tahab endale midagi ilusat. Täna meisterdasin talle oksadest krooni.',
    toddlerTryout: 'Mul on paberist täht. Kleebin tähe aknale: klõps! Täht särab. Kuhu sina tähe paneksid?',
    toddlerReindeer: 'Välk tõi oksa ja sulekese. Me tegime neist krooni. Nüüd on Välk kuningas!',
  },
  {
    id: 'music',
    label: 'Muusika ja laulmine',
    group: 'creative',
    hint: 'nt klaver, kitarr, koorilaul',
    match: /muusik|laul|klaver|pill|kitarr|trumm/i,
    mentions: /muusik/i,
    tryout:
      'Proovisin töökojas klaverit mängida. Kõrged noodid kõlasid nagu kellukesed, madalad nagu Jõuluvana norskamine. Lõpuks mängisin mõlemat korraga ja kõik päkapikud tulid vaatama, mis lahti on.',
    reindeer:
      'Ta laulab. Iga õhtu, kui tähed välja tulevad, ajab ta pea kuklasse ja teeb: hõõõõh. Jõuluvana ütles, et see on põhjapõtrade jõululaul. Päkapikud panevad vaikselt mütsid kõrvadele.',
    toddlerTryout: 'Ma laulan: la-la-laa! Trumm teeb: bumm-bumm! Laulame koos: la-la-laa!',
    toddlerReindeer: 'Välk laulab: hõõõh! See on tema jõululaul. Laula sina ka Välgule!',
  },
  {
    id: 'baking',
    label: 'Küpsetamine ja kokkamine',
    group: 'creative',
    hint: 'nt piparkoogid, pitsa',
    match: /küpseta|(?<!pann)kook|muffin/i,
    mentions: /pagari|pagar\b|kondiitri/i,
    tryout:
      'Proovisin küpsetada kooki nagu päris pagar. Taina segamise ajal lendas jahu igale poole – lakke, aknale ja Jõuluvana habemesse. Kook tuli hea, aga Jõuluvana on nüüd veel valgem kui enne.',
    reindeer:
      'Ta seisab iga päev köögiukse taga ja nuusutab. Kui kook ahjus küpseb, pistab ta pea uksest sisse ja nuusutab õhku. Eile lubati tal esimesena kooki nuusutada ja nüüd peab ta end peapagariks.',
    toddlerTryout: 'Me teeme kooki: segame, segame! Ahjus kook kasvab. Mmm, kook lõhnab!',
    toddlerReindeer: 'Välk nuusutas köögis: nuuts-nuuts! Kook! Aga Välk sai hoopis porgandi. Krõmps!',
  },
  {
    id: 'theatre',
    label: 'Näitemäng ja kostüümid',
    group: 'creative',
    hint: 'nt teatriring, nukuteater',
    match: /näitemäng|näitle|teater|teatri|kostüüm|etendus|rollimäng/i,
    mentions: /näitemäng|näitleja|kostüüm/i,
    tryout:
      'Tegime päkapikkudega näitemängu. Mina olin lumehelves ja minu ainus lause oli: „Ma langen vaikselt.“ Laval läksin nii närvi, et kukkusin päriselt pikali. Kõik plaksutasid ja Jõuluvana ütles, et nii ehtsat lumehelvest pole ta varem näinud.',
    reindeer:
      'Ta on otsustanud saada näitlejaks. Ta paneb selga vana punase laudlina ja mängib Jõuluvana: kõnnib aeglaselt, kõht ees, ja ütleb sügava häälega „hõh-hõh“. Päris Jõuluvana küsis, kas ta tõesti nii kõnnib. Kõik päkapikud noogutasid.',
    toddlerTryout: 'Panen pähe karvase mütsi. Nüüd olen karu: mõmm-mõmm! Kelleks sina täna oled?',
    toddlerReindeer: 'Välk pani selga punase mantli. Nüüd on ta Jõuluvana! Ta ütleb: hõh-hõh-hõh!',
  },
  // Teadus ja nuputamine
  {
    id: 'riddles',
    label: 'Mõistatused ja nuputamine',
    group: 'science',
    hint: 'nt Rubiku kuubik, salakoodid, pusled',
    match: /mõistatus|nuputa|nuputamis/i,
    mentions: /mõistatusesõb|nuputaja/i,
    tryout:
      'Kirjutasin ise ühe mõistatuse: „Mis on valge ja külm ning kaob, kui seda soojas käes hoida?“ Lugesin selle töökojas ette ja kõik päkapikud hüüdsid kohe: „Lumi!“ Järgmine tuleb raskem.',
    reindeer:
      'Ta on hakanud mõistatusi esitama. Eile seisis ta ukse ees ega lasknud mind sisse, enne kui ütlesin, kellel on neli jalga ja suured sarved. Vastus oli muidugi tema ise.',
    toddlerTryout: 'Arva ära: see on valge ja külm ja langeb taevast. Mis see on? Lumi!',
    toddlerReindeer: 'Välk küsis: kellel on suured sarved ja pikad jalad? Ja naeris: mul endal!',
  },
  {
    id: 'science',
    label: 'Katsed ja teadus',
    group: 'science',
    hint: 'nt keemiakomplekt, mikroskoop',
    match: /katse|teadus|eksperiment|keemi/i,
    mentions: /teadlas|teaduskatse/i,
    tryout:
      'Tegin töökojas teaduskatse: kas lumi sulab kiiremini taskus või mütsi all? Taskus sulas kiiremini. Nüüd on mu tasku läbimärg ja Jõuluvana ütles, et teadlased kannavad katse ajal kitlit.',
    reindeer:
      'Temast on saanud teadlane. Ta paneb samblatükke lumme ja vaatab, mis juhtub. Seni pole juhtunud midagi, aga ta vaatab väga tõsise näoga ja teeb sõrgaga lumme märke.',
    toddlerTryout: 'Panin lumepalli kaussi. Vaatame: lumepall läks väiksemaks … ja sai veeks! Oi!',
    toddlerReindeer: 'Välk pani nina lumme. Külm! Siis pani nina sooja vette. Soe! Välk on teadlane.',
  },
  {
    id: 'space',
    label: 'Kosmos ja tähed',
    group: 'science',
    hint: 'nt planeedid, raketid',
    match: /kosmos|planeet|raket|astronau/i,
    mentions: /astronau|planeedi/i,
    tryout:
      'Ehitasin pappkastist raketi ja kirjutasin küljele „Põhjanael 1“. Lugesin kümnest nullini – ja ei midagi. Rakett jäi lumme seisma, aga mina tundsin end täitsa astronaudina.',
    reindeer:
      'Igal õhtul seisab ta lauda katusel ja vaatab tähti. Eile näitas ta sarvega ühte eredat täppi. Jõuluvana ütles, et see on planeet Veenus. Välk arvab siiani, et see on tema kadunud kelluke.',
    toddlerTryout: 'Taevas on tähed. Rakett lendab: vuuuh! Üles-üles, Kuu juurde. Lehvita tähtedele!',
    toddlerReindeer: 'Välk vaatas taevasse. Seal oli Kuu, suur ja ümmargune. Välk ütles Kuule: tere!',
  },
  {
    id: 'robots',
    label: 'Robotid ja tehnika',
    group: 'science',
    hint: 'nt programmeerimine, robootikaring',
    match: /robot/i,
    mentions: /robot/i,
    tryout:
      'Ehitasin robotabilise, kes pidi kingipakke pakkima. Ta pakkis ära kaks pakki, ühe saapa ja lõpuks iseenda. Nüüd seisab ta nurgas, ilus punane pael ümber.',
    reindeer:
      'Ta kõnnib nüüd kangete jalgadega ja teeb iga sammuga „piip“. Arvan, et ta mängib robotit. Kui küsisin, mida ta teeb, vastas ta: „Piip. Porgand. Piip.“',
    toddlerTryout: 'Robot kõnnib: kõks, kõks, kõks. Robot ütleb: piip-piip! Kõnnime nagu robot!',
    toddlerReindeer: 'Välk mängib robotit. Ta kõnnib kangelt: kõks, kõks. Ütleb: piip! Siis naerab.',
  },
  // Tegelased ja fantaasia
  {
    id: 'books',
    label: 'Raamatud ja lood',
    group: 'stories',
    hint: 'nt koomiksid, Lotte, Harry Potter',
    match: /raamat/i,
    mentions: /raamatusõb|raamatukoi/i,
    tryout:
      'Lugesin terve öö raamatut ühest väga vaprast päkapikust. Nii põnev oli, et küünal põles lõpuni ja viimased leheküljed lugesin taskulambiga. Hommikul tundsin, et olen ka ise natuke vapram.',
    reindeer:
      'Ta on avastanud töökoja raamatukogu. Ta keerab ninaga lehti ja vaatab pilte. Kõige rohkem meeldib talle raamat põhjapõtradest, sest seal on tema arvates tema sugulased.',
    toddlerTryout: 'Mul on raamat. Keerame lehte: siin on kuusk. Keerame veel: siin on jänku!',
    toddlerReindeer: 'Välk vaatab raamatut. Keerab ninaga lehte. Pildil on põhjapõder! Välk naerab.',
  },
  {
    id: 'characters',
    label: 'Multikad ja lemmiktegelased',
    group: 'stories',
    hint: 'nt Peppa, Elsa, Käpapatrull',
    match: /multik|joonisfilm|lemmiktegelas/i,
    mentions: /multik/i,
    tryout:
      'Vaatasin Jõuluvanaga multikat. Jõuluvana elas nii kaasa, et hüüdis ekraanile: „Vaata ette!“ Pärast mängisime päkapikkudega multikategelasi: igaüks pidi ilma sõnadeta näitama, kes ta on. Mind ei arvanud keegi ära. Ma olin Jõuluvana.',
    reindeer:
      'Ta on hakanud multikaid vaatama. Kui tegelane naerab, naerab ka Välk, ja kui keegi kukub, katab ta silmad sõrgaga kinni. Pärast mängib ta kõik päkapikkudele uuesti ette – oma lemmikkohad lausa kaks korda.',
    toddlerTryout: 'Vaatasin multikat. Seal oli naljakas tegelane, kes ütles: hõissa! Ütleme koos: hõissa!',
    toddlerReindeer: 'Välk vaatas multikat. Tegelane naeris: hi-hi! Välk naeris ka: hõh-hõh!',
  },
  {
    id: 'superheroes',
    label: 'Superkangelased',
    group: 'stories',
    hint: 'nt Ämblikmees, Batman',
    match: /superkangel|ämblikmees|batman|superman/i,
    mentions: /superkangel/i,
    tryout:
      'Proovisin olla superkangelane. Panin selga punase keebi ja hüppasin kingikuhja otsast alla – lendama. Lendamine kestis umbes pool sekundit. Aga maandumine oli väga kangelaslik.',
    reindeer:
      'Ta usub, et on superkangelane. Tal on punane sall nagu keep ja igal hommikul päästab ta kedagi: eile ühe kinnijäänud kindapaari, täna ühe lumme kukkunud mütsi.',
    toddlerTryout: 'Superkangelane lendab: vuhh! Käed üles ja lendame koos: vuuuh!',
    toddlerReindeer: 'Välgul on punane keep. Ta on superkangelane! Välk päästis kinda. Hurraa!',
  },
  {
    id: 'fairytales',
    label: 'Muinasjutud ja fantaasiamaailmad',
    group: 'stories',
    hint: 'nt printsessid, rüütlid, draakonid',
    match: /muinasjut|haldjas|nõid|võlur/i,
    mentions: /muinasjut/i,
    tryout:
      'Lugesin vana muinasjuttu, kus konnast sai prints. Läksin järve äärde ja otsisin terve õhtu konna. Talvel magavad konnad muidugi muda sees. Leidsin ainult jääpurika, mis nägi natuke konna moodi. Printsi temast ei saanud, aga ta sätendas väga ilusti.',
    reindeer:
      'Ta kuulas õhtul muinasjuttu ja on nüüd kindel, et ka tema on tegelikult nõiutud prints. Igal hommikul vaatab ta järvejääst oma peegelpilti ja kontrollib, kas nõidus on juba kadunud. Seni on ta ikka põhjapõder. Aga ta ei anna alla.',
    toddlerTryout: 'Elas kord väike päkapikk, kellel oli võlumüts. Pane müts pähe – ja hüppad kõrgele! Hopp!',
    toddlerReindeer: 'Välk kuulas muinasjuttu. Seal oli võlukepp. Välk tahtis ka võlukeppi. Ta sai oksa. Võluv!',
  },
  {
    id: 'pirates',
    label: 'Piraadid ja aardejaht',
    group: 'stories',
    hint: 'nt piraadilaev, aardekaart',
    match: /piraat/i,
    mentions: /piraa/i,
    tryout:
      'Mängisin töökojas piraati: silmaklapp ees, papist mõõk vöö vahel. Ronisin kingikuhja otsa ja hüüdsin: „Laev paistab!“ Laeva ei paistnud, aga Jõuluvana tuli vaatama, mis lärm see on.',
    reindeer:
      'Ta mängib nüüd piraati: kaevas lumme augu ja peitis sinna porgandi – oma aarde. Siis unustas, kus see oli. Nüüd kaevab ta terve õue läbi ja kõik päkapikud aitavad.',
    toddlerTryout: 'Piraat ütleb: ahoi! Piraadil on laev. Laev õõtsub: kiiga-kaaga. Ahoi!',
    toddlerReindeer: 'Välk peitis porgandi lumme. See on piraadi aare! Kus see on? Kaevame!',
  },

  // Kitsamad teemad: leitakse sellest, mida vanem laiema teema juurde või lemmiktoitude alla kirjutab
  {
    id: 'rubik',
    label: 'Rubiku kuubik',
    within: 'riddles',
    note: 'Rubiku kuubik',
    match: /rubik|kuubik/i,
    mentions: /rubik|(?<!jää)kuubik/i,
    tryout:
      'Leidsin töökojast Rubiku kuubiku. Keerasin külgi üht- ja teistpidi, kuni üks tahk oli lõpuks ühevärviline. Siis tuli Jõuluvana, keeras korra ja küsis: „Kas nüüd on parem?“ Ei olnud. Kõik värvid on jälle segamini.',
    reindeer:
      'Ta oli leidnud kusagilt Rubiku kuubiku ja lükkas seda ninaga ühest küljest teisele. Ühe tahu sai ta täiesti punaseks. Sellest ajast kõnnib ta ringi, nina püsti.',
    toddlerTryout: 'Mul on kirju kuubik. Keeran – kõik värvid on segamini! Keeran veel – üks pool on punane!',
    toddlerReindeer: 'Põhjapõder Välk leidis kirju kuubiku. Ta keeras seda ninaga: klõps-klõps! Kas sina oskad keerata?',
  },
  {
    id: 'codes',
    label: 'Salakoodid',
    within: 'riddles',
    note: 'salakoodid',
    match: /salakood|kood|šifr|salakiri/i,
    mentions: /salakoodi|koodimeist/i,
    tryout:
      'Kirjutasin Jõuluvanale salakoodis sõnumi: iga tähe asemel number. Jõuluvana nuputas terve õhtu ja küsis lõpuks, kas see on piparkoogi retsept. Ei olnud. See oli „head ööd“.',
    reindeer:
      'Ta koputab sõrgadega vastu laudaust: kolm lühikest ja üks pikk. Arvan, et see on salakood. Ma pole veel aru saanud, mida see tähendab, aga iga kord pärast seda kaob üks porgand.',
    toddlerTryout: 'Ma koputan: kopp-kopp-kopp. See on minu salakood. See tähendab: tere! Koputa vastu!',
    toddlerReindeer: 'Välk koputab sõrgaga: kopp, kopp! See on tema salakood. Ta tahab porgandit!',
  },
  {
    id: 'chess',
    label: 'Male',
    within: 'boardgames',
    note: 'male',
    match: /\bmale\b|\bmalet\b|malend|šahh|šahm/i,
    mentions: /\bmale\b|\bmalet\b|malenup|malend/i,
    tryout:
      'Õppisin malet mängima. Ratsu käib nagu L-täht, ettur ainult otse ja kuningas väga ettevaatlikult. Mängisin Jõuluvanaga ja kaotasin kolme käiguga. Ta ütles, et sada aastat harjutamist aitab.',
    reindeer:
      'Ta seisab malelaua kõrval ja lükkab ninaga ratsut. Ainult ratsut, sest see on ainus nupp, millel on nina. Kui ratsu kukub, vaatab ta mind, nagu oleks see minu süü.',
    toddlerTryout: 'Malelaual on nupp, mis näeb välja nagu hobune. Malehobune hüppab: hopp, hopp! Hüppa sina ka!',
    toddlerReindeer: 'Välk vaatas malelauda ja lükkas ninaga ühe nupu ümber. Kolks! Nüüd on sinu kord.',
  },
  {
    id: 'minecraft',
    label: 'Minecraft',
    within: 'videogames',
    note: 'Minecraft',
    match: /minecraft|maincraft/i,
    mentions: /minecraft/i,
    tryout:
      'Proovisin ehitada nagu Minecraftis, kus kõik on kandilistest plokkidest. Lõikasin lumest plokid ja ehitasin neist maja, torni ja trepi. Lõpuks tegin ka kandilise lumememme. Jõuluvana vaatas teda kaua ja ütles, et nii nurgelist lumememme pole ta varem näinud.',
    reindeer:
      'Ta on kuulnud Minecraftist ja kaevab nüüd lumme käike nagu päris kaevur. Igast käigust toob ta midagi välja: käbi, kinda või kadunud kellukese. Ta arvab, et need on aarded. Päkapikud arvavad, et need on nende asjad.',
    toddlerTryout: 'Ma ehitan kandilistest plokkidest maja. Plokk ploki peale: üks, kaks, kolm. Maja on valmis!',
    toddlerReindeer: 'Välk kaevas lumme käigu: kraps-kraps! Käigu lõpus oli käbi. See on aare!',
  },
  {
    id: 'cars',
    label: 'Autod',
    within: 'vehicles',
    note: 'autod',
    match: /(?<!\p{L})auto(?!r|maat|gramm)|traktor|veok/iu,
    mentions: /võidusõiduauto|sahaga auto/i,
    tryout:
      'Ehitasin Jõuluvana kelgule mootori, et see sõidaks nagu võidusõiduauto. Mootor käivitus, tegi „vrumm“ – ja kelk sõitis tagurpidi otse lauta. Välk ei olnud sellest üldse vaimustuses.',
    reindeer:
      'Ta nägi, kuidas suur sahaga auto teelt lund lükkas. Nüüd lükkab ta ise ninaga lund ja teeb: vrumm-vrumm. Pidurdamine tal veel hästi välja ei tule.',
    toddlerTryout: 'Auto sõidab: vrumm-vrumm! Auto teeb: piip-piip! Sõidame koos!',
    toddlerReindeer: 'Välk mängis autot. Ta jooksis ringi ja tegi: vrumm! Piip-piip, Välk tuleb!',
  },
  {
    id: 'trains',
    label: 'Rongid',
    within: 'vehicles',
    note: 'rongid',
    match: /rong|vedur/i,
    mentions: /\brong|vedur/i,
    tryout:
      'Ehitasin töökotta väikese rongi: vedur ees ja vagunites kingipakid. Rong tegi „tuut-tuut“ ja sõitis ümber kuuse. Kolmandal ringil jäi ta seisma, sest keegi oli rööbastele piparkoogi jätnud.',
    reindeer:
      'Ta on hakanud vedurit mängima. Ta jookseb ees ja kolm päkapikku sõidavad kelguga järel. Iga kord, kui ta peatub, teeb ta: tuut! Päkapikud tahavad juba pileteid ka.',
    toddlerTryout: 'Rong sõidab: tšuhh-tšuhh! Rong vilistab: tuut-tuut! Sõidame rongiga!',
    toddlerReindeer: 'Välk on vedur. Tšuhh-tšuhh! Päkapikud sõidavad taga. Tuut-tuut!',
  },
  {
    id: 'cats',
    label: 'Kassid',
    within: 'animals',
    note: 'kassid',
    match: /kass|kiisu/i,
    mentions: /kassisõb|kasside\b/i,
    tryout:
      'Töökoja kass Nurr magab alati kõige soojemas kohas. Eile proovisin ka ise kassi kombel ahju peal magada. Nurr vaatas mind ühe silmaga, nurrus ja lükkas mu käpaga maha.',
    reindeer:
      'Töökoja kass Nurr on tal külas. Nüüd magavad nad koos heinas: suur põhjapõder ja väike kass tema sarvede vahel. Välk ei julge liigutadagi, et kassi mitte äratada.',
    toddlerTryout: 'Kass ütleb: mjäu! Kass nurrub: nurr-nurr. Silitame kassi: pai-pai.',
    toddlerReindeer: 'Väike kass magab Välgu sarvede vahel. Nurr-nurr! Välk ei liiguta. Tsss!',
  },
  {
    id: 'dogs',
    label: 'Koerad',
    within: 'animals',
    note: 'koerad',
    match: /koer|kutsu|kutsik/i,
    mentions: /kutsik/i,
    tryout:
      'Naabertalu kutsikas tuli eile töökotta. Proovisin teda õpetada: „Istu!“ Tema heitis pikali. „Lama!“ Tema hüppas mulle sülle ja lakkus nina. Arvan, et tegelikult õpetas tema mind.',
    reindeer:
      'Ta on leidnud endale sõbra – naabertalu kutsika. Nad jooksevad koos ümber lauda ja kutsikas haugub, kui Välk liiga kiiresti jookseb. Pärast on mõlemad väsinud ja väga õnnelikud.',
    toddlerTryout: 'Kutsikas ütleb: auh-auh! Kutsikas liputab saba: vits-vits. Liputa sina ka!',
    toddlerReindeer: 'Välk ja kutsikas jooksevad ringi. Kutsikas: auh! Välk: hõh! Mõlemad on väsinud.',
  },
  {
    id: 'horses',
    label: 'Hobused',
    within: 'animals',
    note: 'hobused',
    match: /hobu|poni|ratsuta/i,
    mentions: /ratsuta|\bponi|hobusesõb/i,
    tryout:
      'Proovisin ratsutada. Hobust töökojas pole, seega istusin Välgu selga. Välk arvas, et see on uus mäng, ja pani galoppi. Hoidsin sarvedest kinni ja hüüdsin: „Ptruu!“ Ta ei teadnud, mida see tähendab.',
    reindeer:
      'Ta on käinud naabertalu ponisid vaatamas. Nüüd proovib ta ise traavida nagu hobune: kõpsti-kõpsti, pea püsti. Põhjapõdral tuleb see välja päris naljakalt.',
    toddlerTryout: 'Hobune teeb: ihahaa! Hobune traavib: kõpsti-kõpsti. Sõidame koos!',
    toddlerReindeer: 'Välk traavib nagu hobune: kõpsti, kõpsti! Ja hirnub: ihahaa! Kas ta on hobune?',
  },
  {
    id: 'football',
    label: 'Jalgpall',
    within: 'ballgames',
    note: 'jalgpall',
    match: /jalgpall|futbol/i,
    mentions: /jalgpall/i,
    tryout:
      'Tegin lumest värava ja proovisin jalgpalli. Esimene löök läks üle värava, teine üle kuuse ja kolmas otse Välgu sarvede vahele. Välk arvas, et see on tema pall, ja jooksis sellega minema.',
    reindeer:
      'Ta on hakanud jalgpalli mängima. Ta ajab ninaga palli mööda õue ja väravaks on kaks kuuske. Väravavahiks pandi lumememm. Lumememm pole veel ühtki palli kinni püüdnud.',
    toddlerTryout: 'Pall veereb: rull-rull! Ma löön palli: põmm! Pall lendab kaugele. Löö sina ka!',
    toddlerReindeer: 'Välk lükkas ninaga palli. Pall veeres lumme. Välk jooksis järele: hopp-hopp!',
  },
  {
    id: 'basketball',
    label: 'Korvpall',
    within: 'ballgames',
    note: 'korvpall',
    match: /korvpall/i,
    mentions: /korvpall/i,
    tryout:
      'Riputasin töökoja seinale vana küpsisekorvi ja proovisin korvpalli. Esimene vise läks lakke, teine Jõuluvana teetassi. Kolmas läks täpselt korvi – aga see oli pähkel, mitte pall. Päkapikud plaksutasid ikkagi.',
    reindeer:
      'Ta on hakanud korvpalli mängima. Tal on üks suur eelis: sarved ulatuvad peaaegu korvini. Pall jääb küll sarvede vahele kinni, aga Välk ütleb, et see läheb arvesse. Päkapikud vaidlevad siiani.',
    toddlerTryout: 'Ma viskan palli korvi: hopp! Läks sisse! Viskame veel: üks, kaks, kolm – hopp!',
    toddlerReindeer: 'Välk lükkas palli sarvedega. Pall lendas üles – ja kukkus korvi! Hurraa, Välk!',
  },
  {
    id: 'skating',
    label: 'Uisutamine',
    within: 'wintersports',
    note: 'uisutamine',
    match: /uisu|hoki/i,
    mentions: /\buisu|\buisk/i,
    tryout:
      'Proovisin järvel uisutada. Esimesed kolm sammu läksid hästi, neljanda juures läksid jalad eri suundadesse. Istusin jääl ja vaatasin, kuidas Välk mööda libises – ilma uiskudeta ja palju osavamalt.',
    reindeer:
      'Ta käib igal hommikul järvel uisutamas. Uiske tal pole, aga sõrad libisevad niisama. Eile tegi ta piruetti – vähemalt nii ta arvab. Mina nägin, et ta keerles hoopis selili.',
    toddlerTryout: 'Jää on libe. Ma libisen: vuhh! Ja kukun: plumps! Tõusen ja libisen uuesti.',
    toddlerReindeer: 'Välk libises jääl: vuhh! Ta keerles ringi nagu vurr. Uisutaja Välk!',
  },
  {
    id: 'skiing',
    label: 'Suusatamine',
    within: 'wintersports',
    note: 'suusatamine',
    match: /suusa|suusk/i,
    mentions: /suusata/i,
    tryout:
      'Proovisin suusatada. Mäest alla läks väga kiiresti, mäest üles väga aeglaselt. Kolmandal korral sõitsin otse hange ja välja paistsid ainult suusaotsad ja minu müts.',
    reindeer:
      'Ta tahab ka suusatada. Proovisime talle neli suuska alla panna – igale jalale ühe. Ta sõitis mäest alla nagu kelk ja peatus alles lauda ukse ees.',
    toddlerTryout: 'Suusad libisevad: suhh, suhh! Mäest alla: vuhh! Ja hange: pläts!',
    toddlerReindeer: 'Välk sõitis mäest alla: vuhh! Ilma suuskadeta. Ja otse hange: pläts!',
  },
  {
    id: 'comics',
    label: 'Koomiksid',
    within: 'books',
    note: 'koomiksid',
    match: /miki|mickey|koomiks|donald/i,
    mentions: /miki hii|koomiksisõb|koomiksilugeja/i,
    tryout:
      'Joonistasin oma esimese koomiksi. Esimesel pildil sööb Jõuluvana piparkooki. Teisel on piparkook kadunud. Kolmandal on Jõuluvanal habe puru täis. Päkapikud ütlesid, et see pole mingi mõistatus. Ei saa aru, miks.',
    reindeer:
      'Ta on leidnud töökoja raamaturiiulilt koomiksi ja vaatab seda iga päev. Lugeda ta ei oska, aga pildid meeldivad. Kõige naljakama pildi juures hakkab ta nii kõvasti naerma, et hein lendab.',
    toddlerTryout: 'Koomiksis on naljakas hiir. Pildil ta kukub, järgmisel pildil naerab: hi-hi! Naerame ka!',
    toddlerReindeer: 'Välk vaatas koomiksit. Pildil oli naljakas hiir. Hiir naeratas. Välk naeratas ka!',
  },
  {
    id: 'peppa',
    label: 'Põrsas Peppa',
    within: 'characters',
    note: 'Põrsas Peppa',
    match: /peppa/i,
    mentions: /peppa/i,
    tryout:
      'Proovisin naerda täpselt nagu Põrsas Peppa: röh-röh-röh. Päkapikud arvasid, et laudast on põrsas välja pääsenud, ja otsisid terve õhtu. Mina ei julgenud öelda, et see olin mina.',
    reindeer:
      'Ta hüppab Põrsas Peppa moodi heinakuhjas ja röhib: röh-röh! Hein lendab igale poole ja kõik päkapikud naeravad. Laudas pole kunagi nii lõbus olnud.',
    toddlerTryout: 'Peppa ütleb: röh-röh! Peppa hüppab porilompi: lirts! Hüppame ka!',
    toddlerReindeer: 'Välk hüppas heinas nagu Peppa: hüpp-hüpp! Ja ütles: röh-röh! Naljakas Välk!',
  },
  {
    id: 'pawpatrol',
    label: 'Käpapatrull',
    within: 'characters',
    note: 'Käpapatrull',
    match: /käpapatrull|paw patrol/i,
    mentions: /käpapatrull/i,
    tryout:
      'Mängisime töökojas Käpapatrulli. Mina mängisin päästjat, kes otsis kadunud asju. Leidsin kaks kinnast, ühe sussi ja Jõuluvana prillid – need olid tal kogu aeg peas.',
    reindeer:
      'Ta on loonud oma Käpapatrulli. Kui kuskil midagi juhtub, kihutab ta kohale. Eile päästis ta päkapiku, kes oli kingikuhja alla jäänud. Päkapikk otsis seal tegelikult lihtsalt pliiatsit.',
    toddlerTryout: 'Käpapatrull tuleb appi! Jookseme: tipa-tapa. Appi, appi – hurraa!',
    toddlerReindeer: 'Välk mängib Käpapatrulli. Ta jookseb appi: tipa-tapa! Kõik on päästetud!',
  },
  {
    id: 'frozen',
    label: 'Elsa ja Lumekuninganna',
    within: 'characters',
    note: 'Elsa',
    match: /elsa|frozen|lumekuninganna|olaf/i,
    mentions: /\belsa|lumekuninganna|\bolaf/i,
    tryout:
      'Proovisin teha lund nagu Elsa – kätega. Ajasin käed laiali ja ootasin. Lund ei tulnud, aga tuli tuuleiil ja puhus mütsi peast. Siis hakkas ikkagi sadama – arvan, et natuke aitasin.',
    reindeer:
      'Ta on kuulnud lugu Elsast, kes teeb jääst lossi. Nüüd lamab ta iga päev järve ääres ja vaatab jääd. Ta ootab, millal jää hakkab lossiks kasvama. Ta on väga kannatlik.',
    toddlerTryout: 'Elsa teeb lund: lumehelbed langevad ja sädelevad! Keerleme nagu helbed!',
    toddlerReindeer: 'Välk vaatas lumehelbeid nagu Elsa. Helbed keerlesid. Välk keerles ka!',
  },
  {
    id: 'princesses',
    label: 'Printsessid',
    within: 'fairytales',
    note: 'printsessid',
    match: /printsess|haldja/i,
    mentions: /printsess/i,
    tryout:
      'Proovisin olla printsess: panin pähe paberist krooni ja kõndisin väga sirgelt. Kroon kukkus kolm korda supi sisse. Jõuluvana ütles, et päris printsessidel on kroonid paremini kinni.',
    reindeer:
      'Ta käis eile ringi, laudlina seljas nagu printsessi mantel ja käbi sarvede vahel. Kõik pidid talle kummardama. Mina kummardasin ja tema kummardas vastu – nii sügavalt, et kukkus.',
    toddlerTryout: 'Printsessil on kroon. Kroon särab ja sädeleb. Paneme krooni pähe!',
    toddlerReindeer: 'Välk pani pähe krooni. Nüüd on Välk printsess! Ta teeb sügava kummarduse. Kummarda sina ka!',
  },
  {
    id: 'knights',
    label: 'Rüütlid ja lossid',
    within: 'fairytales',
    note: 'rüütlid',
    match: /rüütel|rüütli|draak/i,
    mentions: /rüütel|rüütli/i,
    tryout:
      'Ehitasin lumest lossi: neli torni, müür ja vallikraav. Olin seal rüütel, potikaas kilbiks. Lossi tuli ründama Välk. Ta ei rünnanud – ta heitis kraavi pikali ja jäi magama.',
    reindeer:
      'Ta mängib nüüd rüütli ratsut. Mina istun tema seljas, potikaas kilbiks ja puulusikas mõõgaks, ja me kaitseme töökoda draakoni eest. Draakonit pole veel tulnud, aga me oleme valmis.',
    toddlerTryout: 'Lossil on torn. Rüütel valvab torni. Rüütel küsib: kes tuleb? Mina tulen!',
    toddlerReindeer: 'Välk valvab lumelossi nagu rüütel. Keegi ei tohi sisse! Ainult sina.',
  },
  {
    id: 'porridge',
    label: 'Riisipuder',
    within: 'foods',
    note: 'riisipuder',
    match: /riisipu/i,
    mentions: /riisipu/i,
    tryout:
      'Tahtsin kõigile riisiputru keeta. Panin poti tulele, aga siis tuli Välk oma kadunud kellukest otsima. Otsisime nii kaua, et puder keeb üle poti ääre. Üks päkapikk küsis: „Kas sa keedad terve põhjapõdrakarja jaoks?“',
    reindeer:
      'Ta on avastanud riisipudru. Igal hommikul seisab ta köögiukse taga ja ootab, kas jääb üle. Kui jääb, lakub ta kausi nii puhtaks, et seda pole vaja pestagi.',
    toddlerTryout: 'Puder on soe. Puhume: fuu-fuu! Võtame lusikaga: amps! Mmm, riisipuder!',
    toddlerReindeer: 'Välk sai riisiputru. Amps-amps! Kauss on tühi. Välgul on puder ninal!',
  },
  {
    id: 'pancakes',
    label: 'Pannkoogid',
    within: 'foods',
    note: 'pannkoogid',
    match: /pannkoo|pannkook|pannkuk/i,
    mentions: /pannkoogihommik|pannkoogisõb|pannkoogitorn/i,
    tryout:
      'Ehitasin pannkookidest torni: kaksteist pannkooki üksteise otsas ja iga kihi vahel moos. Pannkoogitorn oli peaaegu sama pikk kui mina. Siis tuli köögist läbi Välk – ja nüüd on torn tunduvalt madalam.',
    reindeer:
      'Ta valvab pannkoogihommikutel köögis. Kui pannkook pannil ümber lendab, avab ta suu – lootuses, et see lendab otse sinna. Eile lendaski.',
    toddlerTryout: 'Pannkook on ümmargune. Pannkook hüppab pannil: hopp! Amps – maitsev!',
    toddlerReindeer: 'Pannkook lendas üles. Välk avas suu – amps! Pannkook on Välgu kõhus!',
  },
  {
    id: 'icecream',
    label: 'Jäätis',
    within: 'foods',
    note: 'jäätis',
    match: /jäätis/i,
    mentions: /jäätis[et]/i,
    tryout:
      'Tegin talvel jäätist: lumi, natuke moosi ja tilk piima. Panin kausi aknalauale külmuma. Hommikul oli kauss tühi ja Välgu ninal oli moosi. Ta väitis, et ei tea midagi.',
    reindeer:
      'Ta on avastanud, et jäätise kausi saab väga puhtaks lakkuda. Nüüd seisab ta iga kord köögis, kui keegi jäätist teeb. Eile pistis ta nina nii sügavale kaussi, et kõndis terve õhtu, vahukoor ninaotsas.',
    toddlerTryout: 'Jäätis on külm. Limps-limps! Jäätis on magus. Mmm, jäätis!',
    toddlerReindeer: 'Välk limpsis lund: limps! Ta arvas, et see on jäätis. Lumi on külm!',
  },
]

/** Topics shown on the form, in the order of their groups. */
export const LISTED_TOPICS: Topic[] = TOPICS.filter((topic) => topic.group)

export function getTopic(id: TopicId): Topic {
  const topic = TOPICS.find((candidate) => candidate.id === id)
  if (!topic) throw new Error(`Unknown topic ${id}`)
  return topic
}

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((topic) => topic.id === value)
}

/** Topics the parent picked on the profile (older profiles have none). */
export function pickedTopics(child: Pick<ChildProfile, 'topics'>): Topic[] {
  return (child.topics ?? []).filter(isTopicId).map(getTopic)
}

/** The parent's words under one picked topic, split at commas: "korvpall, jalgpall" → two. */
export function noteTexts(child: Pick<ChildProfile, 'topicNotes'>, id: TopicId): string[] {
  return (child.topicNotes?.[id] ?? '')
    .split(/[,;\n]/)
    .map((text) => text.trim())
    .filter(Boolean)
}

/** Everything the parent wrote under the picked topics. */
export function allNoteTexts(child: Pick<ChildProfile, 'topics' | 'topicNotes'>): string[] {
  return pickedTopics(child).flatMap((topic) => noteTexts(child, topic.id))
}

/**
 * The topics whose own stories suit the child best: a picked topic, or the narrower
 * topics the parent named under it ("Pallimängud: korvpall" → Korvpall). Food is left out.
 */
export function storyTopics(child: Pick<ChildProfile, 'topics' | 'topicNotes'>): Topic[] {
  const result: Topic[] = []
  for (const topic of pickedTopics(child)) {
    if (topic.within === 'foods') continue
    const notes = noteTexts(child, topic.id)
    const narrower = TOPICS.filter(
      (candidate) => candidate.within && candidate.within !== 'foods' && notes.some((text) => candidate.match.test(text)),
    )
    for (const found of narrower.length ? narrower : [topic]) if (!result.includes(found)) result.push(found)
  }
  return result
}

/**
 * Interests as text for the short-letter templates: for each picked topic the parent's own
 * words when there are any ("korvpall"), otherwise its label; then the free text.
 */
export function interestTexts(child: ChildProfile): string[] {
  const topics = pickedTopics(child).filter((topic) => topic.within !== 'foods')
  const picked = topics.flatMap((topic) => {
    const notes = noteTexts(child, topic.id)
    return notes.length ? notes : [topic.label]
  })
  return unique([...picked, ...child.interests, ...child.favorites])
}

/** Favourite foods as text: food topics picked on an older profile first, then free text. */
export function foodTexts(child: ChildProfile): string[] {
  const topics = pickedTopics(child).filter((topic) => topic.within === 'foods')
  return unique([...topics.map((topic) => topic.label.toLocaleLowerCase('et-EE')), ...child.foods])
}

type TopicFields = Pick<ChildProfile, 'topics' | 'topicNotes' | 'foods'>

/**
 * Older profiles picked narrow topics from a longer list ("Jalgpall", "Riisipuder"). Those
 * become words under the broader topic ("Pallimängud: jalgpall") or a favourite food, where
 * they bring the same stories as before. Unknown topics are dropped. Safe to run again.
 */
export function upgradeTopics<T extends TopicFields>(child: T): T {
  const topics: TopicId[] = []
  const notes: TopicNotes = {}
  const foods = Array.isArray(child.foods) ? [...child.foods] : []
  for (const [id, text] of Object.entries(child.topicNotes ?? {})) {
    if (isTopicId(id) && typeof text === 'string') notes[id] = text
  }
  for (const id of child.topics ?? []) {
    if (!isTopicId(id)) continue
    const topic = getTopic(id)
    const note = topic.note ?? topic.label
    if (!topic.within) {
      if (!topics.includes(id)) topics.push(id)
    } else if (topic.within === 'foods') {
      if (!foods.some((food) => topic.match.test(food))) foods.push(note)
    } else {
      const parent = topic.within
      if (!topics.includes(parent)) topics.push(parent)
      const written = notes[parent]?.trim() ?? ''
      if (!topic.match.test(written)) notes[parent] = written ? `${written}, ${note}` : note
    }
  }
  // Words are kept only under the topics that are picked.
  for (const id of Object.keys(notes) as TopicId[]) {
    const text = notes[id]?.trim()
    if (text && topics.includes(id)) notes[id] = text
    else delete notes[id]
  }
  return { ...child, topics, topicNotes: notes, foods }
}

function unique(texts: string[]): string[] {
  const seen = new Set<string>()
  return texts.filter((text) => {
    const key = text.trim().toLocaleLowerCase('et-EE')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
