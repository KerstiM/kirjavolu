import type { Line, OccasionLines, ToneLines } from './types'

export const FIRST_LETTER_INTRO: Line[] = [
  ({ sender, vocab }) => `Mina olen ${sender}. Minu kodu on ${vocab.senderHome}.`,
  ({ sender, vocab, v }) =>
    `Lubage end tutvustada: mina olen ${sender}. Elan kohas, mida kutsutakse nii: ${vocab.senderHome}. Sealt saadan ${v('sulle', 'teile')} selle kirja.`,
]

export const OPENINGS: ToneLines = {
  humorous: [
    ({ sender }) => `Tere jälle! Siin kirjutab ${sender} – jah, see sama, kes eile oma mütsi ära kaotas.`,
    ({ v }) => `Tervitus! Kirjutan ${v('sulle', 'teile')} kiiresti, sest mu tint kipub ära jooksma. Päriselt – tal on jalad!`,
    () => `Tere-tere! Proovisin seda kirja kirjutada peaga alaspidi, aga tähed hakkasid pööritama. Nüüd istun korralikult.`,
    ({ v }) => `Ahoi! Loodan, et ${v('sul', 'teil')} on hea tuju, sest minul on – hommikul leidsin taskust ühe ammu kadunud kommi.`,
    () => `Tere-tere! Täna hommikul ajasin segi suhkru ja soola, nii et tee maitses nagu meri. Aga tuju on ikka hea!`,
    ({ v }) => `Tervitus! Kas ${v('tead', 'teate')}, mis on maailmas kõige raskem? Kirjutada kirja, kui ninaots sügeleb.`,
    () => `Tere! Pidin selle kirja kolm korda uuesti alustama, sest naljakad mõtted kippusid paberilt maha jooksma.`,
    ({ v }) => `Hei-hei! Siin kirjutab ${v('sinu', 'teie')} kõige naerusuisem kirjasõber.`,
    ({ sender }) => `Tere! ${sender} kirjutab jälle – seekord kindad käes, sest pliiats on täna eriti libe.`,
    () => `Tervitus! Mu kass istus just selle paberi peale ja keeldus liikumast. Õnneks jäi talle sabast natuke ruumi üle.`,
  ],
  magical: [
    ({ v }) => `Tere! Selle kirja tõi ${v('sinuni', 'teieni')} tuuleiil, kes teab kõiki salateid.`,
    ({ v }) => `Tervitus! Kui ${v('sa seda kirja lahti voltisid', 'te seda kirja lahti voltisite')}, pudenes sealt ehk pisut sädelevat tolmu – see on võlu, mis kirjale kaasa tuli.`,
    ({ v }) => `Tere, ${v('mu kallis sõber', 'mu kallid sõbrad')}! Täna kirjutan kuuvalgel, sest just siis on sõnad kõige võluvamad.`,
    () => `Tere! Kirjutan seda kirja sulega, mis helendab pimedas. Iga täht jätab paberile väikese sära.`,
    () => `Tere! Selle kirja paberisse on kootud kuuvalgust – akna vastu hoides võib see vaikselt helendada.`,
    ({ v }) => `Tervitus! Üks pisike täht kukkus täna mu tindipotti ja nüüd on iga sõna, mille ${v('sulle', 'teile')} kirjutan, natuke säravam.`,
    () => `Tere! Kirjutan täna vana tamme all, kelle lehed sosistavad saladusi.`,
    ({ v }) => `Tere! Tuul tõi mulle täna ${v('sinu', 'teie')} naeru – see kõlas nagu pisikesed kellukesed.`,
    () => `Tervitus! Mu kirjutuslaud on täna täis sädelevat tolmu, nii et tähed võivad paberil natuke tantsida.`,
    ({ v }) => `Tere! Enne kui see kiri ${v('sinuni', 'teieni')} jõudis, lendas see üle kolme mäe ja ühe vikerkaare.`,
  ],
  adventurous: [
    ({ v }) => `Tere, ${v('julge seikleja', 'julged seiklejad')}! Mul on uudiseid, mis ei saa oodata.`,
    () => `Tervitus! Kirjutan seda kirja otse teekonnalt, seljakott seljas ja kaart käes.`,
    ({ v }) => `Tere! Tähelepanu – järgnev sõnum on mõeldud ainult ${v('sinu', 'teie')} silmadele.`,
    ({ v }) => `Tere! Kirjutan seda kirja telgis, kus tuul paneb seinad lehvima. Aga ${v('sinu', 'teie')} jaoks leian alati aega.`,
    () => `Tervitus! Täna ületasin kolm oja ja ühe karjamaa, kus haned vaatasid mind väga uudishimulikult.`,
    ({ v }) => `Tere, ${v('mu julge sõber', 'mu julged sõbrad')}! Kaart on laual, kompass taskus – aeg on rääkida uudistest.`,
    () => `Tere! Ronisin selle kirja kirjutamiseks kõrge puu otsa. Sealt paistis peaaegu kogu maailm.`,
    ({ v }) => `Tervitus! Mul on ${v('sulle', 'teile')} salajane sõnum, mille tõi kohale kiire pääsuke.`,
    () => `Tere! Seljakott on pakitud ja saapad jalas, aga enne teele asumist kirjutan selle kirja.`,
    () => `Tere! Eile öösel nägin kaugel tulesid, mis vilkusid nagu salakood. Pidin kohe kirjutama.`,
  ],
  heartwarming: [
    ({ v }) => `Tere! Mõtlesin täna ${v('sinule', 'teile')} ja otsustasin kohe kirja kirjutada.`,
    ({ v }) => `Tere, ${v('mu armas sõber', 'mu armsad sõbrad')}! Loodan, et ${v('sinu', 'teie')} päev on olnud soe ja rõõmus.`,
    () => `Tere! Iga kord, kui ma kirja kirjutan, läheb süda kuidagi soojaks. Nii ka täna.`,
    ({ v }) => `Tere! Täna hommikul ärgates oli mu esimene mõte ${v('sinust', 'teist')}.`,
    () => `Tere! Keetsin endale tassi teed, mähkisin end sooja teki sisse ja hakkasin kirjutama.`,
    ({ v }) => `Tere, ${v('kallis', 'kallid')}! Mul on alati hea meel, kui saan ${v('sulle', 'teile')} kirjutada.`,
    () => `Tere! Väljas on vaikne ja rahulik – just paras aeg ühe sooja kirja jaoks.`,
    ({ v }) => `Tere! Tahtsin lihtsalt öelda, et mõtlen ${v('sulle', 'teile')} sageli, ja alati naeratusega.`,
    ({ v }) => `Tere! Iga kord, kui midagi ilusat näen, mõtlen: seda peaksin ${v('sulle', 'teile')} jutustama. Nii et siin ma olen.`,
    () => `Tere! Panin selle kirja sisse ühe suure kallistuse. Loodan, et see jõudis kohale terve ja soojana.`,
  ],
}

/** Closings that fit any letter, including a single one. */
export const CLOSINGS: ToneLines = {
  humorous: [
    ({ v }) => `Nüüd pean minema, sest keegi pistis mu sussid jälle külmkappi. ${v('Ole', 'Olge')} tubli ja ${v('naera', 'naerge')} palju!`,
    ({ v }) => `${v('Hoia', 'Hoidke')} kõrvad lahti ja nina püsti!`,
    ({ v }) => `Lehvitan ${v('sulle', 'teile')} nii kõvasti, et müts lendab peast!`,
    () => `Ja pea meeles: hea tuju on nakkav – jaga seda julgelt!`,
    () => `Lõpetuseks üks tarkus: kui üks naerab, kasvab tuju, ja kui naeravad kõik, kasvab see kaks korda suuremaks!`,
  ],
  magical: [
    ({ v }) => `${v('Hoia', 'Hoidke')} oma südames väikest võluväge – see kasvab iga hea teoga.`,
    ({ v }) => `Kui ${v('sa', 'te')} täna õhtul tähti ${v('vaatad', 'vaatate')}, siis ${v('tea', 'teadke')}: üks neist vilgutab just ${v('sulle', 'teile')}.`,
    () => `Võlu on alati lähemal, kui arvata oskame.`,
    ({ v }) => `Saadan ${v('sulle', 'teile')} peotäie tähetolmu – see aitab head und näha.`,
    () => `Imed juhtuvad neile, kes oskavad neid märgata.`,
    () => `Las iga täht taevas meenutab, et maailm on täis imesid.`,
  ],
  adventurous: [
    ({ v }) => `${v('Ole', 'Olge')} julge, uudishimulik ja ${v('hoia', 'hoidke')} silmad lahti!`,
    () => `Parimad seiklused algavad sageli ühest väikesest sammust.`,
    ({ v }) => `Ma usun, et ${v('sinust saab kunagi suur avastaja', 'teist saavad kunagi suured avastajad')}.`,
    () => `Maailm on suur ja täis saladusi – ja kõige põnevamad neist ootavad alles avastamist.`,
  ],
  heartwarming: [
    ({ v }) => `${v('Sa oled', 'Te olete')} väga eriline. Ära kunagi unusta seda.`,
    ({ v }) => `Saadan ${v('sulle', 'teile')} suure ja sooja kallistuse.`,
    ({ v }) => `Mõtlen ${v('sinule', 'teile')} ja naeratan.`,
    ({ v }) => `${v('Hoia ennast ja oma lähedasi.', 'Hoidke ennast ja üksteist.')}`,
    ({ v }) => `${v('Pea', 'Pidage')} meeles: ${v('sind', 'teid')} armastatakse rohkem, kui sõnadega öelda oskab.`,
    ({ v }) => `Head ööd ja magusaid unenägusid, ${v('mu kallis', 'mu kallid')}!`,
  ],
}

/** Closings that promise another letter: only used inside a series, never in the last letter. */
export const SERIES_CLOSINGS: ToneLines = {
  humorous: [
    () => `Kirjutan varsti jälle – kui leian oma pliiatsi üles. See peitis end eile leivakorvi.`,
    ({ v }) => `Homme räägin ${v('sulle', 'teile')}, mis juhtus minu kõige pahurama sokiga.`,
  ],
  magical: [
    () => `Homme õhtul toob tuul järgmise kirja.`,
    ({ v }) => `${v('Vaata', 'Vaadake')} homme jälle – võib-olla ootab seal midagi ${v('sinu', 'teie')} jaoks.`,
  ],
  adventurous: [
    ({ v }) => `Seiklus jätkub! ${v('Ole', 'Olge')} valmis järgmiseks sõnumiks.`,
    ({ v }) => `Kuni järgmise korrani, ${v('seikleja', 'seiklejad')}!`,
  ],
  heartwarming: [
    () => `Ootan juba homset, et saaksin jälle kirjutada.`,
    ({ v }) => `Kohtume järgmises kirjas, ${v('mu kallis', 'mu kallid')}.`,
  ],
}

/** First-letter paragraph that states why the sender writes on this occasion. */
export const OCCASION_PURPOSE: OccasionLines = {
  christmas: [
    ({ v }) => `Jõuluvana saatis mind ${v('sinu', 'teie')} juurde, et vaadata, kuidas läheb, ja tuua jõuluootusesse natuke võlu.`,
    ({ v }) => `Detsembris on päkapikkudel kõige tähtsam töö: käia laste juures ja vaadata, kuidas head teod kasvavad. ${v('Sinu', 'Teie')} juures kasvavad need väga hästi!`,
  ],
  easter: [
    ({ v }) => `Kevad on käes ja lihavõtted tulekul! Peitsin ${v('sinu', 'teie')} jaoks mõned munad – aga kuhu, seda ${v('pead', 'peate')} ise välja nuputama.`,
    () => `Lihavõttepühadel jagavad jänesed lastele värvilisi mune. Selle aasta esimene muna tuli eriti ilus – sinine, valgete täppidega.`,
  ],
  birthday: [
    ({ v }) => `Kuulsin, et ${v('sul', 'teil')} on sünnipäev! Palju-palju õnne! Kõik minu torni õhupallid tantsivad täna ${v('sinu', 'teie')} auks.`,
    ({ v }) => `Täna on päev, mil maailm tähistab just ${v('sind', 'teid')}. Palju õnne sünnipäevaks!`,
  ],
  halloween: [
    () => `Halloweenil lubatakse kõigil olla natuke kõhe – aga ainult sõbralikult. Mina harjutan juba oma kõige naljakamat „Buu!“.`,
    ({ v }) => `Halloweeni õhtul süttivad akendel kõrvitsalaternad. Üks neist põleb just ${v('sinu', 'teie')} jaoks.`,
  ],
  'mardi-kadri': [
    () => `Mardi- ja kadripäeval käivad sandid uksest uksesse, laulavad ja soovivad perele õnne. See on üks vanimaid Eesti kombeid.`,
    ({ v }) => `Novembris on sandiaeg! Kas ${v('oled', 'olete')} juba mõelnud, millise sandina ${v('sa', 'te')} sel aastal ${v('lähed', 'lähete')}?`,
  ],
  vastlapaev: [
    () => `Vastlapäev on käes! See on päev, mil lastakse liugu, süüakse hernesuppi ja vahukoorega vastlakukleid.`,
    ({ v }) => `Vastlapäeval on kõige tähtsam pikk liug. Ma usun, et ${v('sinu', 'teie')} liug tuleb tänavu eriti pikk!`,
  ],
  valentines: [
    ({ v }) => `Täna on sõbrapäev – päev, mil öeldakse sõpradele, kui tähtsad nad on. Ja ${v('sina oled', 'teie olete')} mulle väga tähtis.`,
    ({ v }) => `Sõbrapäeval saadetakse kaarte ja häid soove. See kiri on minu kaart ${v('sulle', 'teile')}.`,
  ],
  'school-start': [
    ({ v }) => `Uus kooliaasta algab! Tean, et ${v('sind', 'teid')} ootab palju uut: uued tunnid, uued teadmised ja võib-olla ka uued sõbrad.`,
    ({ v }) => `Esimene september on tarkusepäev. Sel päeval alustavad kõik koolilapsed – ka ${v('sina', 'teie')} – uut seiklust.`,
  ],
  summer: [
    () => `Suvevaheaeg on alanud! Ees ootavad pikad päevad, soojad õhtud ja palju aega mängimiseks.`,
    ({ v }) => `Kool on läbi ja suvi käes! Tulin ${v('sulle', 'teile')} meelde tuletama, et suvi on seikluste aeg.`,
  ],
  'lost-tooth': [
    ({ v }) => `Täna öösel tulin järele ${v('sinu', 'teie')} piimahambale. Aitäh, et ${v('hoidsid', 'hoidsite')} seda nii hoolikalt! Jätsin vastu väikese tänutäheks mõeldud üllatuse.`,
    ({ v }) => `Palju õnne! ${v('Sinu', 'Teie')} piimahammas on välja tulnud – see tähendab, et ${v('kasvad', 'kasvate')} suureks. Võtsin hamba hoolega kaasa oma hammaste lossi.`,
  ],
}

/** Inserted into the last letter of a December series. */
export const CHRISTMAS_EVE: Line = ({ v }) =>
  `Täna on jõululaupäev! Töökoda on vaikseks jäänud ja kingid on kelgul. Varsti on Jõuluvana teel – ka ${v('sinu', 'teie')} poole.`

export const TODDLER_OPENINGS: Line[] = [
  () => `Tere, väike sõber!`,
  () => `Tere-tere! Mina olen jälle siin.`,
  () => `Kopp-kopp! Kirjakandja tõi sulle kirja.`,
  () => `Tere hommikust, päikesekiir!`,
  () => `Tere! Kas tead, kes kirjutab? Mina!`,
  () => `Tervist! Saadan sulle suure kalli.`,
]

export const TODDLER_CLOSINGS: Line[] = [
  () => `Kalli-kalli!`,
  () => `Musi põsele!`,
  () => `Ole rõõmus ja naera palju!`,
  () => `Saadan sulle päikest!`,
  () => `Head ööd, väike sõber!`,
]

/** Standalone letter cores for specific occasions. */
export const OCCASION_CORES: OccasionLines = {
  christmas: [
    () => `Täna hommikul läks töökojas kõik segi: üks päkapikk pani piparkoogitainasse suhkru asemel soola! Jõuluvana maitses, kortsutas kulmu ja naeris siis nii, et habe värises.`,
    () => `Eile õhtul lugesin Jõuluvanale ette kirju, mis lapsed on saatnud. Ta kuulas silmad kinni ja naeratas iga kirja juures.`,
    () => `Põhjapõder Välk harjutas täna maandumist ja sõitis otse lumehange. Välja paistsid ainult sarved ja saba!`,
    ({ v }) => `Meie töökojas on suur raamat, kuhu kirjutatakse kõik head teod. Täna nägin seal ${v('sinu nime', 'teie nimesid')} ja süda hakkas rõõmust kiiremini põksuma.`,
    ({ v }) => `Käisin täna salaja ${v('sinu', 'teie')} akna taga piilumas. Pidin kiiresti peitu pugema, sest keegi tuli liiga ruttu akna juurde!`,
    () => `Jõuluvana kingikotti ei mahu enam midagi. Päkapikud arutavad, kas teha kott suuremaks või hoopis kingid väiksemaks.`,
    () => `Täna oli töökojas pakkimispäev. Mina vastutasin paelte eest ja sidusin nii palju lehvisid, et sõrmed läksid sõlme.`,
    () => `Lund on meil nii palju, et täna hommikul pidin kaevama tunneli, et oma ukse eest välja pääseda.`,
    () => `Õppisin täna uue jõululaulu. Laulsin nii valjult, et jääpurikad katuseserval hakkasid kaasa tilisema.`,
    () => `Jõuluvana prillid olid kadunud. Otsisime neid terve päeva, kuni lõpuks leidsime – tema enda pealaelt!`,
    ({ v }) => `Täna küpsetasime piparkooke ja mina tegin ühe kujukese, mis näeb välja peaaegu nagu ${v('sina', 'teie')}. Peaaegu – sest nina läks natuke viltu.`,
    () => `Põhjapõdrad said täna uued kellukesed. Nüüd kõlab iga nende samm nagu väike laul.`,
    ({ v }) => `Kuulsin, et ${v('sa oled', 'te olete')} viimasel ajal eriti abivalmis olnud. Seda märgatakse siin põhjas alati.`,
    () => `Täna peeti meil lumesõda. Jõuluvana peitis end kuuse taha, aga tema punane müts paistis kaugele.`,
    () => `Proovisin sõrmedel kokku lugeda, mitu päeva on jõuludeni jäänud, aga päkapiku sõrmi jäi puudu!`,
    () => `Meie töökoja suur kell hakkas täna äkki kukkuma nagu kägu. Keegi ei tea, kuidas see juhtus, aga naerda saime kõvasti.`,
    ({ v }) => `Täna kirjutasin nimekirja kõige toredamatest asjadest, mida olen sel aastal näinud. ${v('Sinu', 'Teie')} naeratus on seal päris eespool.`,
    () => `Jõuluvana kudus täna sokke. Ta ütleb, et iga silmus on üks hea soov – seega said need sokid väga soojad.`,
    () => `Ühel päkapikul oli täna sünnipäev. Kinkisime talle kuusekujulise kommi ja laulsime nii, et lumi pudenes okstelt.`,
    () => `Mul õnnestus täna lennata põhjapõdra seljas. Ülevalt paistsid kõik majad nagu piparkoogimajad ja tuled nagu tähed.`,
    () => `Täna avastasin, et kõik lumehelbed on erinevad – täpselt nagu lapsed. Ükski pole teisega sama ja just see teebki nad eriliseks.`,
    ({ v }) => `Töökojas lõhnab praegu kaneeli, apelsini ja värske kuuse järele. Kui ${v('sa', 'te')} täna sügavalt sisse ${v('hingad', 'hingate')}, ehk ${v('tunned', 'tunnete')} seda lõhna ka ise.`,
    ({ v }) => `Jõuluvana vaatas täna oma suurt kaarti, kus on kõik maailma kodud. ${v('Sinu', 'Teie')} kodu juures põles eriti soe tuluke.`,
    () => `Täna proovisin suusatada. Kukkusin seitse korda, aga kaheksandal korral jõudsin mäest alla püsti!`,
    () => `Üks päkapikk ehitas täna nii suure lumememme, et pidime redeli tooma, et talle porgand ninaks panna.`,
    ({ v }) => `Jõuluvana küsis täna minult, mida ${v('sa', 'te')} jõuludeks kõige rohkem ${v('ootad', 'ootate')}. Ütlesin, et küsin ise järele!`,
  ],
  easter: [
    () => `Täna värvisime jänkudega mune. Üks muna sai nii triibuline, et nägi välja nagu pisike sebra!`,
    () => `Kevad on käes! Hommikul äratas mind tihane, kes laulis otse mu urus akna all.`,
    ({ v }) => `Ma peitsin eile harjutamiseks kümme muna ja leidsin ise üles ainult üheksa. Kui ${v('sa', 'te')} kuskil kummalist muna ${v('näed', 'näete')}, siis see võib olla minu oma.`,
    () => `Mu vanaema õpetas mind mune sibulakoortega värvima. Need said kuldpruunid ja läikivad nagu päikeseloojang.`,
    () => `Tibud harjutavad juba piiksumist. Neil on terve koor ja dirigendiks on üks väga tõsine kana.`,
  ],
  birthday: [
    ({ v }) => `Mulle sosistati, et ${v('sinu', 'teie')} jaoks on tulemas väga eriline päev. Sellepärast valmistasin kõige säravamad konfetid.`,
    () => `Täna proovisin küpsetada maailma kõige kõrgemat torti. See oli nii kõrge, et pidin küünlad pilvede vahele torkama!`,
    ({ v }) => `Iga sünnipäevaga kasvab inimeses juurde pisut julgust, tarkust ja naeru. ${v('Sinus', 'Teis')} on neid juba väga palju.`,
    () => `Mul on kogu, kuhu panen igast sünnipäevast ühe soovi. Need soovid helendavad öösiti nagu tulikärbsed.`,
    () => `Õhupallid minu tornis hakkasid täna laulma. Nad teavad, et kuskil on peagi pidu!`,
  ],
  halloween: [
    () => `Harjutasin täna oma kõige hirmsamat „Buu!“, aga ehmatasin ainult iseennast. Hiired naersid mu üle terve õhtu.`,
    () => `Meie lossi pööningul elab ämblik, kes koob võrke tähtede kujuliselt. Täna kudus ta ühe nii suure, et sinna mahtus terve kuu.`,
    () => `Nõid Pilla õpetas mulle täna, kuidas kõrvitsast laterna teha. Minu laterna nägu tuli küll pigem naljakas kui hirmus.`,
    () => `Täna lendasin nahkhiirtega võidu. Nemad olid kiiremad, aga mina oskasin paremini vilistada.`,
  ],
  'mardi-kadri': [
    () => `Vanasti käisid mardisandid tumedates riietes ja kadrisandid heledates. Nad laulsid, soovisid perele õnne ning said vastu pähkleid, õunu ja kooki.`,
    () => `Mardipäeval soovisid sandid, et loomad oleksid terved ja vili kasvaks hästi. Kadripäeval sooviti eriti head karjaõnne ja lõngakerade kasvu.`,
    ({ v }) => `Sandiks minnes on tähtis kolm asja: rõõmus laul, viisakas tervitus ja hea soov. Ma usun, et ${v('sul', 'teil')} on kõik kolm olemas.`,
    () => `Eile õhtul koputasid minu uksele kolm santi. Nad laulsid nii lõbusalt, et mu vana kass hakkas kaasa nurruma.`,
  ],
  vastlapaev: [
    () => `Vanasti usuti, et mida pikem liug vastlapäeval, seda pikem lina kasvab. Seepärast proovis igaüks liugu võimalikult pikaks lasta.`,
    () => `Täna meisterdasin vastlavurri: niidi ja seakondi asemel kasutasin nööpi. See vurises nagu väike lennuk!`,
    () => `Hernesupp on vastlapäeval eriti hea, kui oled terve päeva mäest alla lasknud ja põsed on õhetavad.`,
    () => `Mul on kelk, millel on nimi – Tuisk. Täna läks Tuisk nii kiiresti, et jõudsime peaaegu järgmisse külla!`,
  ],
  valentines: [
    () => `Sõbrapäeval jagatakse kaarte ja häid sõnu. Mina kirjutasin täna nii palju kaarte, et postkasti luuk ei läinud enam kinni.`,
    ({ v }) => `Hea sõber on nagu soe sall: ${v('sa', 'te')} ei pruugi teda kogu aeg märgata, aga temaga on alati parem.`,
    () => `Täna andsin ühele kurvale tigule naeratuse. Ta naeratas vastu ja roomas pärast seda märgatavalt kiiremini.`,
    ({ v }) => `${v('Tead', 'Teate')}, mis on sõpruse saladus? Kuulata, aidata ja koos naerda – eriti siis, kui midagi läheb viltu.`,
  ],
  'school-start': [
    ({ v }) => `Uus kooliaasta on nagu tühi vihik – iga päev ${v('saad', 'saate')} sinna midagi uut ja huvitavat kirjutada.`,
    () => `Esimesel koolipäeval on täiesti normaalne, kui kõht natuke kõdiseb. See tähendab, et ees ootab midagi põnevat.`,
    () => `Tarkusepäeval soovitakse kõigile tarkust ja uudishimu. Minu arvates on uudishimu üks kõige võimsamaid võlujõude.`,
    ({ v }) => `Mäletan oma esimest koolipäeva: kaotasin pinali, aga leidsin sõbra. Ehk ${v('leiad sinagi', 'leiate teiegi')} täna midagi väärtuslikku.`,
    () => `Koolis ei pea kõike kohe oskama. Kõige tähtsam on julgus küsida ja tahe proovida.`,
  ],
  summer: [
    () => `Suvi on käes! Täna sõitsin pilvelaevaga üle mere ja nägin delfiini, kes vilistas mulle tervituseks.`,
    () => `Metsas valmivad mustikad. Korjasin neid nii palju, et keel läks täiesti siniseks.`,
    () => `Täna ehitasin liivalossi, millel oli kümme torni. Siis tuli laine ja tegi sellest liivakoogi.`,
    () => `Suveöö on nii hele, et isegi öökull ei tea, millal magama minna.`,
    () => `Õhtul istusin lõkke ääres ja kuulasin, kuidas sädemed rääkisid lugusid tähtedest.`,
  ],
  'lost-tooth': [
    ({ v }) => `Täna öösel leidsin ${v('sinu', 'teie')} padja alt ühe väga erilise hamba. See oli nii puhas ja läikiv, et kõik haldjad imetlesid seda.`,
    ({ v }) => `Iga hammas, mille ma kokku korjan, saab endale koha minu hammaste lossis. ${v('Sinu', 'Teie')} hammas pandi kõige uhkemale riiulile.`,
    ({ v }) => `Hamba asemele kasvab uus ja tugev hammas. Seniks ${v('ole', 'olge')} uhke oma naljaka hambaaugu üle – see on suureks kasvamise märk!`,
    ({ v }) => `Haldjad räägivad, et hästi hoitud hammas särab nagu täht. ${v('Sinu', 'Teie')} hammas säras nii, et ma leidsin selle pimedas kohe üles.`,
    ({ v }) => `Lendasin täna öösel üle linna ja kõik tänavalambid vilgutasid mulle tervituseks. Siis märkasin ${v('sinu', 'teie')} akent.`,
  ],
  everyday: [
    () => `Täna avastasin, et kõige tavalisemas päevas peitub alati midagi imelist – tuleb lihtsalt hästi vaadata.`,
    () => `Hommikul nägin aknast pilve, mis oli täpselt nagu jänes. Hetk hiljem muutus see laevaks ja siis pannkoogiks.`,
    ({ v }) => `Mul on taskus väike märkmik, kuhu kirjutan häid uudiseid. Täna kirjutasin sinna ${v('sinust', 'teist')}.`,
  ],
}

/** Cores that work for any occasion. */
export const GENERIC_CORES: Line[] = [
  ({ v }) => `Täna hommikul ärkasin selle peale, et keegi koputas mu aknale. Selgus, et see oli tuul, kes tõi uudiseid ${v('sinust', 'teist')}.`,
  ({ v }) => `Mul on üks saladus: kogun kõiki toredaid hetki pisikesse klaaspurki. ${v('Sinu', 'Teie')} hetkedest on see purk juba peaaegu täis.`,
  () => `Täna proovisin uut võlutrikki. Tahtsin muuta kivi kommiks, aga sain hoopis... veel suurema kivi. Harjutan edasi!`,
  ({ v }) => `Kuulsin linnukeselt, et ${v('sa oled', 'te olete')} viimasel ajal väga julge olnud. Julgus ei tähenda, et ei karda – see tähendab, et ${v('proovid', 'proovite')} ikka.`,
  ({ v }) => `Täna joonistasin kaardi kõigist oma lemmikpaikadest. Üks täpp sellel kaardil on ${v('sinu', 'teie')} kodu.`,
  ({ v }) => `Mul oli täna väga askeldusterohke päev. Aga kui mõtlesin ${v('sinule', 'teile')}, muutus kõik kohe kergemaks.`,
  () => `Mõnikord istun pilve serval ja vaatan, kuidas maailm toimetab. Täna nägin, kuidas keegi aitas teist – see oli päeva parim vaatepilt.`,
  () => `Täna õpetas vana öökull mulle uue sõna: „tänulikkus“. See tähendab, et märkad häid asju enda ümber.`,
  ({ v }) => `Kuulsin, et ${v('sa oled', 'te olete')} viimasel ajal palju uut õppinud. Õppimine on nagu trepist üles ronimine – iga aste viib natuke kõrgemale.`,
  () => `Täna sadas mu juures vihma, aga siis tuli välja vikerkaar. Selle all seistes tundus, nagu oleks maailm värvidega üle kallatud.`,
  ({ v }) => `Mul on ${v('sulle', 'teile')} üks väike küsimus: mis oli ${v('sinu', 'teie')} tänase päeva kõige parem hetk? Mõtle sellele enne magamaminekut.`,
  () => `Täna leidsin taskust nööbi, mille olin ammu kaotanud. Mõnikord tulevad head asjad tagasi just siis, kui neid kõige vähem oodatakse.`,
]

export const TODDLER_CORES: Line[] = [
  () => `Täna nägin taevas suurt valget pilve. Pilv oli pehme nagu padi.`,
  () => `Mul on punane müts. Müts on nii suur, et vajub vahel üle silmade. Kus ma olen? Siin ma olen!`,
  () => `Täna kohtasin väikest jänkut. Jänku tegi hopp-hopp-hopp ja kadus põõsasse.`,
  () => `Ma kuulsin linnukest laulmas: tsiu-tsiu! Kas sina oskad ka nii laulda?`,
  () => `Täna sõin ühe suure punase õuna. Krõmps-krõmps! See oli nii magus.`,
  () => `Ma ehitasin klotsidest torni. Torn oli kõrge, kõrge – ja siis kukkus põmm!`,
  () => `Täna paistis päike ja mina tegin oma varjuga tantsu. Vari tantsis kaasa!`,
  () => `Ma kallistasin täna oma lemmikkaru. Karu on pehme ja soe. Kallista ka sina oma mänguasja!`,
  () => `Täna leidsin maast ilusa kivi. See on ümmargune ja sile nagu muna.`,
  () => `Kass tuli mulle külla ja ütles: mjäu! Mina ütlesin vastu: tere, kiisu!`,
  () => `Täna nägin vikerkaart. Seal on punane, kollane ja sinine. Kui ilus!`,
  () => `Mul on väike trumm. Trumm teeb: bumm-bumm-bumm!`,
  () => `Täna kõndisin lompides: lärts-lärts! Saapad said märjaks.`,
  () => `Väike kala ujub vees: sulp-sulp. Kas sina oskad ka teha kalasuud?`,
  () => `Õhtul paistab taevas kuu. Kuu on ümmargune ja kollane. Head ööd, kuu!`,
  () => `Ma ehitasin liivast koogi. Koogi peal on kivike. Mmm, liivakook!`,
]

/** Simple occasion lines for toddler letters, read aloud by an adult. */
export const TODDLER_OCCASION: OccasionLines = {
  christmas: [
    () => `Täna sadas palju lund. Lumi on valge ja külm. Brrr!`,
    () => `Põhjapõder ütles mulle täna tere. Ta raputas pead ja kellukesed tegid kõlin-kõlin.`,
    () => `Ma küpsetasin piparkooke. Need lõhnavad nii hästi! Nuusuta ka – nuuh-nuuh!`,
    () => `Jõuluvana naeris täna: ho-ho-hoo! Kas sina oskad ka nii naerda?`,
    () => `Kuusel säravad tuled: üks, kaks, kolm! Loe koos emme või issiga, mitu tulukest teie kuusel on.`,
  ],
  easter: [
    () => `Mina olen jänku. Mul on pikad kõrvad ja pehme saba. Hopp-hopp!`,
    () => `Täna värvisin muna. Muna on kollane nagu päike.`,
    () => `Väike tibu ütles: piiks-piiks! Kas sina oskad ka piiksuda?`,
    () => `Ma peitsin ühe muna. Kus on muna? Otsime koos!`,
  ],
  birthday: [
    () => `Täna on sinu päev! Õhupallid lendavad üles-üles!`,
    () => `Tordil põlevad küünlad. Puhume koos: puhh!`,
    () => `Palju õnne! Plaksutame koos: plaks-plaks-plaks!`,
  ],
  halloween: [
    () => `Mina olen väike sõbralik kummitus. Ma ütlen: buu! Aga ma ei ole üldse hirmus.`,
    () => `Kõrvits on suur ja oranž. Sellel on naljakas nägu.`,
  ],
  'mardi-kadri': [
    () => `Sandid tulevad laulma: tra-lal-laa! Kas sina laulad ka?`,
    () => `Mul on pehme lõngakera. See veereb: veeres-veeres!`,
  ],
  vastlapaev: [
    () => `Kelk sõidab mäest alla: vuhh! Kas sina sõidad ka kelguga?`,
    () => `Vastlakukkel on magus. Mõnus-mõnus!`,
  ],
  valentines: [
    () => `Täna on sõprade päev. Sina oled minu sõber!`,
    () => `Joonistasin sulle südame. Süda on punane.`,
  ],
  'school-start': [
    () => `Koolikott on suur ja täis raamatuid. Pliiats teeb kritsa-kratsa.`,
    () => `Koolikell helises: kõlin-kõlin! Kool algab.`,
  ],
  summer: [
    () => `Päike paistab ja on soe. Lähme õue!`,
    () => `Meri teeb: kohh-kohh. Kas sina tahad liivas mängida?`,
    () => `Liblikas lendab: lipa-lipa. Kuhu ta lendab?`,
  ],
  'lost-tooth': [() => `Mina olen hambahaldjas. Mul on pisikesed säravad tiivad.`],
}

/** Ordered story arc for connected letters. The last beat is always the finale. */
/** Beat that asks the child to leave a sign, and the beat that answers it – always on consecutive letters. */
export const ARC_ASK_BEAT = 4
export const ARC_REPLY_BEAT = 5

export const ARC_BEATS: Line[] = [
  ({ v }) => `Pean ${v('sulle', 'teile')} midagi tähtsat rääkima. Minu kõige kallim asi – pisike helendav võlutäht – on kadunud. Ilma selleta ei saa ma oma tähtsat tööd lõpetada.`,
  () => `Otsisin võlutähte igalt poolt: voodi alt, kapist ja isegi teekannust. Leidsin hoopis ühe hõbedase sule. Kelle oma see küll olla võib?`,
  ({ v }) => `Täna rääkisin vana öökulliga. Ta ütles, et nägi öösel midagi helendavat lendamas ${v('sinu', 'teie')} kodu poole!`,
  ({ v }) => `Olen nüüd kindel, et võlutäht on kuskil ${v('sinu', 'teie')} lähedal. Ise ma tulla ei saa – vajan abilist, kellel on teravad silmad ja hea süda.`,
  ({ v }) => `Kas ${v('sa oleksid', 'te oleksite')} nõus mind aitama? Kui jah, siis ${v('joonista', 'joonistage')} paberile täht ja ${v('jäta', 'jätke')} see aknalauale. Nii ma tean.`,
  ({ v }) => `Ma nägin ${v('sinu', 'teie')} märki! Aitäh! Nüüd oleme meeskond. Esimene vihje: võlutäht armastab soojust ja valgust.`,
  () => `Täna juhtus midagi kummalist. Hõbedane sulg hakkas äkki värisema ja osutas kogu aeg ühes suunas. Ehk näitab see teed?`,
  ({ v }) => `Uus vihje: võlutäht helendab kõige eredamalt siis, kui keegi teeb head. Ehk ${v('saad', 'saate')} täna kellelegi rõõmu valmistada?`,
  ({ v }) => `Mulle tundub, et võlutäht kuulis ${v('sinu', 'teie')} heast teost. Öösel nägin taevas lühikest sähvatust – see tuli otse ${v('sinu', 'teie')} kodu kohalt!`,
  () => `Peaaegu käes! Sulg ja sähvatused näitavad nüüd sama kohta. Võlutäht ootab ainult, et keegi teda kutsuks.`,
  ({ v }) => `Kutsusin võlutähte ja ta vastas! Selgus, et ta oli ära eksinud ja otsis sooja kohta, kus teda hoitaks. ${v('Sinu', 'Teie')} lahkus näitas talle teed.`,
  ({ v, vocab }) => `Võlutäht on jälle minuga ja helendab eredamalt kui kunagi varem. Ilma ${v('sinuta', 'teieta')} poleks ma teda leidnud. Aitäh, ${v('mu kallis abiline', 'mu kallid abilised')}! ${vocab.greeting}!`,
]

export const ARC_CONTINUE: Line[] = [
  () => `Võlutähe otsingud käivad edasi. Vahepeal juhtus siin aga midagi muud.`,
  () => `Võlutähe otsingud võtavad aega, aga ma ei anna alla. Seniks räägin, mis täna juhtus.`,
  () => `Hõbedane sulg on mu laual ja ootab. Seniks üks lugu tänasest päevast.`,
]

export const MISSIONS: OccasionLines = {
  christmas: [
    ({ v }) => `Päkapikuülesanne: ${v('meisterda', 'meisterdage')} paberist lumehelves ja ${v('kinnita', 'kinnitage')} see aknale.`,
    ({ v }) => `Päkapikuülesanne: ${v('aita', 'aidake')} täna kedagi nii, et ta seda ei märka. Päkapikud teevad nii kogu aeg!`,
    ({ v }) => `Päkapikuülesanne: ${v('laula', 'laulge')} enne magamaminekut üks jõululaul – ma kuulan!`,
    ({ v }) => `Päkapikuülesanne: ${v('joonista', 'joonistage')} pilt, kus Jõuluvana teeb midagi täiesti ootamatut.`,
    ({ v }) => `Päkapikuülesanne: ${v('loe', 'lugege')} kokku, mitu tuld põleb täna õhtul teie kodus.`,
    ({ v }) => `Päkapikuülesanne: ${v('kirjuta', 'kirjutage')} või ${v('joonista', 'joonistage')} mulle, mis teeb ${v('sind', 'teid')} kõige rohkem rõõmsaks.`,
    ({ v }) => `Päkapikuülesanne: ${v('vali', 'valige')} üks mänguasi, millega enam ei mängita, ja ${v('mõtle', 'mõelge')}, kellele see rõõmu võiks teha.`,
    ({ v }) => `Päkapikuülesanne: ${v('meisterda', 'meisterdage')} paberist kuusk ja ${v('kaunista', 'kaunistage')} see värviliste mullidega.`,
    ({ v }) => `Päkapikuülesanne: ${v('aita', 'aidake')} täna köögis – päkapikud on teatavasti kõige paremad pudrukeetjad!`,
    ({ v }) => `Päkapikuülesanne: ${v('mõtle', 'mõelge')} välja nimi uuele põhjapõdrale ja ${v('kirjuta', 'kirjutage')} see mulle.`,
    ({ v }) => `Päkapikuülesanne: ${v('kustuta', 'kustutage')} õhtul hetkeks kõik tuled ja ${v('vaata', 'vaadake')} ainult küünla- või kuuseehete valgust.`,
    ({ v }) => `Päkapikuülesanne: ${v('ütle', 'öelge')} igale pereliikmele, mille poolest ta on eriline.`,
    ({ v }) => `Päkapikuülesanne: ${v('õpi', 'õppige')} selgeks ühe jõululaulu esimene salm.`,
    ({ v }) => `Päkapikuülesanne: ${v('pane', 'pange')} õhtul aknalauale midagi, mis ${v('sulle', 'teile')} täna rõõmu tegi – ma tahan seda näha.`,
  ],
  easter: [
    ({ v }) => `Jänkuülesanne: ${v('hüppa', 'hüpake')} nagu jänes kümme korda ümber laua!`,
    ({ v }) => `Jänkuülesanne: ${v('pane', 'pange')} vette mõni pajuoks ja ${v('vaata', 'vaadake')}, millal sellel lehed puhkevad.`,
    ({ v }) => `Jänkuülesanne: ${v('joonista', 'joonistage')} kõige uhkema mustriga muna, mida ${v('suudad', 'suudate')} välja mõelda.`,
    ({ v }) => `Jänkuülesanne: ${v('otsi', 'otsige')} õuest esimesi kevadlilli.`,
    ({ v }) => `Jänkuülesanne: ${v('meisterda', 'meisterdage')} paberist jänesekõrvad ja ${v('pane', 'pange')} need pähe.`,
    ({ v }) => `Jänkuülesanne: ${v('loe', 'lugege')} kokku, mitu muna on külmkapis.`,
  ],
  birthday: [
    ({ v }) => `Sünnipäevaülesanne: ${v('mõtle', 'mõelge')} välja üks soov ja ${v('hoia', 'hoidke')} seda saladuses kuni küünalde puhumiseni.`,
    ({ v }) => `Sünnipäevaülesanne: ${v('tantsi', 'tantsige')} oma lemmiklaulu järgi nii, nagu keegi ei vaataks!`,
    ({ v }) => `Sünnipäevaülesanne: ${v('ütle', 'öelge')} kolm asja, mida ${v('sa', 'te')} möödunud aasta jooksul ${v('õppisid', 'õppisite')}.`,
    ({ v }) => `Sünnipäevaülesanne: ${v('kallista', 'kallistage')} kõiki, kes ${v('sind', 'teid')} täna õnnitlevad.`,
    ({ v }) => `Sünnipäevaülesanne: ${v('vali', 'valige')} õhtuks lemmikmäng, mida kogu pere koos mängib.`,
  ],
  halloween: [
    ({ v }) => `Kummitusülesanne: ${v('õpeta', 'õpetage')} kellelegi perest oma kõige naljakam „Buu!“.`,
    ({ v }) => `Kummitusülesanne: ${v('joonista', 'joonistage')} sõbralik kummitus ja ${v('anna', 'andke')} talle nimi.`,
    ({ v }) => `Kummitusülesanne: ${v('ehita', 'ehitage')} tekist kummitusekoobas ja ${v('räägi', 'rääkige')} seal üks naljakas jutt.`,
    ({ v }) => `Kummitusülesanne: ${v('joonista', 'joonistage')} kõige naljakam kõrvitsanägu, mida ${v('suudad', 'suudate')} välja mõelda.`,
  ],
  'mardi-kadri': [
    ({ v }) => `Sandiülesanne: ${v('mõtle', 'mõelge')} välja üks hea soov, mida võiks sandina perele öelda.`,
    ({ v }) => `Sandiülesanne: ${v('küsi', 'küsige')} vanavanematelt, kuidas nemad lapsena sandiks käisid.`,
    ({ v }) => `Sandiülesanne: ${v('õpi', 'õppige')} selgeks üks mardi- või kadrilaul.`,
    ({ v }) => `Sandiülesanne: ${v('meisterda', 'meisterdage')} endale sandimask.`,
  ],
  vastlapaev: [
    ({ v }) => `Vastlapäeva ülesanne: ${v('lase', 'laske')} nii pikk liug, kui ${v('suudad', 'suudate')}, ja ${v('mõõda', 'mõõtke')} see sammudega ära!`,
    ({ v }) => `Vastlapäeva ülesanne: ${v('aita', 'aidake')} valmistada vastlakukleid.`,
    ({ v }) => `Vastlapäeva ülesanne: ${v('meisterda', 'meisterdage')} nööbist ja niidist vastlavurr.`,
  ],
  valentines: [
    ({ v }) => `Sõbrapäeva ülesanne: ${v('tee', 'tehke')} kellelegi kaart ja ${v('kirjuta', 'kirjutage')} sinna üks soe lause.`,
    ({ v }) => `Sõbrapäeva ülesanne: ${v('helista', 'helistage')} vanaemale või vanaisale ja ${v('ütle', 'öelge')}, et ${v('mõtled', 'mõtlete')} tema peale.`,
    ({ v }) => `Sõbrapäeva ülesanne: ${v('jaga', 'jagage')} täna kellegagi oma lemmikmänguasja.`,
  ],
  'school-start': [
    ({ v }) => `Koolialguse ülesanne: ${v('pane', 'pange')} pinalisse üks väike salajane naeratus – näiteks joonistatud päike.`,
    ({ v }) => `Koolialguse ülesanne: ${v('räägi', 'rääkige')} õhtul, mis oli koolipäevas kõige huvitavam.`,
    ({ v }) => `Koolialguse ülesanne: ${v('pane', 'pange')} õhtul koolikott valmis ja ${v('kontrolli', 'kontrollige')}, et pinal oleks täis.`,
  ],
  summer: [
    ({ v }) => `Suveülesanne: ${v('leia', 'leidke')} õuest kolm erinevat lille ja ${v('uuri', 'uurige')} välja nende nimed.`,
    ({ v }) => `Suveülesanne: ${v('vaata', 'vaadake')} pilvi ja ${v('otsi', 'otsige')} nende seast mõni loom.`,
    ({ v }) => `Suveülesanne: ${v('mine', 'minge')} paljajalu muru peale ja ${v('tunne', 'tundke')}, kui pehme see on.`,
    ({ v }) => `Suveülesanne: ${v('korja', 'korjake')} väike lillekimp ja ${v('kingi', 'kinkige')} see kellelegi.`,
    ({ v }) => `Suveülesanne: ${v('ehita', 'ehitage')} kividest või okstest pisike torn.`,
  ],
  'lost-tooth': [
    ({ v }) => `Hambahaldja ülesanne: ${v('pese', 'peske')} täna hambaid täpselt kaks minutit – ma loen kaasa!`,
    ({ v }) => `Hambahaldja ülesanne: ${v('vaata', 'vaadake')} peeglisse ja ${v('naerata', 'naeratage')} oma kõige laiema naeratusega.`,
    ({ v }) => `Hambahaldja ülesanne: ${v('joonista', 'joonistage')} pilt, kuidas uus hammas võiks välja näha.`,
  ],
}

export const GENERIC_MISSIONS: Line[] = [
  ({ v }) => `Tänane ülesanne: ${v('ütle', 'öelge')} kolmele inimesele midagi head.`,
  ({ v }) => `Tänane ülesanne: ${v('ehita', 'ehitage')} patjadest ja tekkidest koobas ja ${v('loe', 'lugege')} seal üks lugu.`,
  ({ v }) => `Tänane ülesanne: ${v('leia', 'leidke')} kodust viis ümmargust asja.`,
  ({ v }) => `Tänane ülesanne: ${v('joonista', 'joonistage')} pilt kõige paremast hetkest sel nädalal.`,
  ({ v }) => `Tänane ülesanne: ${v('tee', 'tehke')} oma toas väike koristus – kõige kiiremini enne, kui liivakell saab tühjaks!`,
  ({ v }) => `Tänane ülesanne: ${v('õpi', 'õppige')} selgeks üks uus sõna ja ${v('kasuta', 'kasutage')} seda õhtusöögi ajal.`,
  ({ v }) => `Tänane ülesanne: ${v('kallista', 'kallistage')} täna kedagi natuke kauem kui tavaliselt.`,
  ({ v }) => `Tänane ülesanne: ${v('mõtle', 'mõelge')} välja nali ja ${v('räägi', 'rääkige')} see õhtul perele.`,
  ({ v }) => `Tänane ülesanne: ${v('meisterda', 'meisterdage')} paberist lennuk ja ${v('vaata', 'vaadake')}, kui kaugele see lendab.`,
  ({ v }) => `Tänane ülesanne: ${v('vaata', 'vaadake')} õhtul aknast välja ja ${v('loe', 'lugege')} kokku, mitu tähte paistab.`,
  ({ v }) => `Tänane ülesanne: ${v('leia', 'leidke')} aknast vaadates kolm asja, mida keegi pole varem märganud.`,
  ({ v }) => `Tänane ülesanne: ${v('kata', 'katke')} õhtusöögilaud eriti ilusti – see on perele üllatus.`,
  ({ v }) => `Tänane ülesanne: ${v('mõtle', 'mõelge')} välja uus mäng ja ${v('õpeta', 'õpetage')} see perele.`,
  ({ v }) => `Tänane ülesanne: ${v('loe', 'lugege')} enne magamaminekut üks lugu mõnele mänguasjale.`,
  ({ v }) => `Tänane ülesanne: ${v('joonista', 'joonistage')} oma unistuste maja.`,
  ({ v }) => `Tänane ülesanne: ${v('ütle', 'öelge')} terve päeva jooksul „aitäh“ igaühele, kes ${v('sind', 'teid')} aitab.`,
  ({ v }) => `Tänane ülesanne: ${v('õpi', 'õppige')} selgeks üks uus tantsusamm ja ${v('näita', 'näidake')} seda õhtul teistele.`,
  ({ v }) => `Tänane ülesanne: ${v('korista', 'koristage')} üks sahtel ja ${v('vaata', 'vaadake')}, kas sealt leiab mõne ammu kadunud aarde.`,
]

export const TODDLER_MISSIONS: string[] = [
  'Täiskasvanu abiga: plaksutage koos kolm korda käsi – plaks, plaks, plaks!',
  'Täiskasvanu abiga: otsige kodust midagi punast ja pehmet.',
  'Täiskasvanu abiga: tehke koos loomahääli – kuidas teeb kass, kuidas teeb koer?',
  'Täiskasvanu abiga: peitke mänguasi teki alla ja leidke see koos üles.',
  'Täiskasvanu abiga: tantsige koos ühe lemmiklaulu järgi.',
  'Täiskasvanu abiga: lugege koos kokku, mitu varvast on jalgadel.',
  'Täiskasvanu abiga: puhuge koos peopessa tuult – puhh!',
  'Täiskasvanu abiga: vaadake aknast välja ja otsige üks lind.',
  'Täiskasvanu abiga: öelge kõigile mänguasjadele head ööd.',
  'Täiskasvanu abiga: katsuge midagi külma ja midagi sooja.',
  'Täiskasvanu abiga: kõndige koos nagu karud – mõmm-mõmm!',
  'Täiskasvanu abiga: laulge koos üks lemmiklaul.',
]

/** Infinitive phrases for sibling tasks: "Ruben, sinu ülesanne on …". */
export const SIBLING_TASKS: Record<'young' | 'older' | 'toddler', string[]> = {
  older: [
    'lugeda see kiri teistele valjusti ette',
    'kirjutada mulle vastuseks kolm lauset oma tänasest päevast',
    'mõelda välja üks mõistatus, mida teised peavad lahendama',
    'olla täna nuputamise juht ja aidata teisi, kui neil on raske',
    'joonistada teistele kaart kõige lühema teega köögist sinu tuppa',
  ],
  young: [
    'joonistada mulle pilt oma lemmikmänguasjast',
    'leida kodust kolm punast asja',
    'näidata teistele oma kõige naljakamat nägu',
    'õpetada teistele üks lõbus tants',
    'loendada, mitu akent teie kodus on',
  ],
  toddler: [
    'kallistada täna kõiki pereliikmeid',
    'näidata, kui pikaks sa juba kasvanud oled',
    'öelda kõige valjem „tere hommikust!“',
    'plaksutada kõige kõvemini, kui teised oma ülesande lõpetavad',
  ],
}

