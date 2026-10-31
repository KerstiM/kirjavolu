import type { Scenario } from '../../../domain/story/types'

/**
 * Letters from the old, thoughtful elf to an independent reader (about 8–12).
 * Dry, quiet humour; mechanisms and small mysteries; the child is spoken to as
 * an equal. Each scenario is one event, told from beginning to end.
 */

const NOTE_WORD = 'KAKAO'
const NOTE_LINES = [
  'Kui tähed kustuvad,',
  'Astu trepist üles.',
  'Katusel on',
  'Aega ja',
  'Ootab üks tass.',
]
const EXAM_ANSWER = 2 * 4 + 3 * 2

export const OLDER_SCENARIOS: Scenario[] = [
  {
    id: 'puzzle-box',
    title: 'Jõuluvana mõistatuskast',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['rubik'],
    tags: ['puzzle', 'mechanism', 'santa'],
    tones: ['adventurous', 'magical'],
    variants: {
      older: (c) => [
        'Jõuluvana pööningult leiti eile vana puust kast, mille üks mänguasjameister talle sada aastat tagasi kinkis. Kuus külge, igaühel üheksa keeratavat ruutu. Võtit pole.',
        c.uses('rubik')
          ? 'Keerasin seda kaks õhtut ja mõtlesin sulle. Sina kuubikusõbrana oleksid ilmselt kohe näinud, mida mina alles kolmandal õhtul taipasin: nurgad enne servi.'
          : 'Keerasin seda kaks õhtut. Kolmandal õhtul taipasin: nurgad tuleb paika saada enne servi. Edasi läks kiiresti.',
        'Kastis oli lapsekäekirjaga sedel: „Kes selle lahti saab, saab minu tagavaraprillid.“ Prillid olid ka seal. Jõuluvana ütleb, et näeb nendega sada aastat tagasi.',
      ],
    },
    activities: {
      older: {
        text: (c) =>
          c.uses('rubik')
            ? 'Kui sul on kuubik käepärast, proovi seda nippi ka.'
            : 'Kui sul on kodus mõni keeratav nuputamismäng, proovi seda nippi ka.',
      },
    },
  },
  {
    id: 'sorting-machine',
    title: 'Kirjamasin nuusutab',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['mechanism', 'mail', 'reindeer'],
    tones: ['humorous'],
    variants: {
      older: () => [
        'Minu kõige vanem leiutis on kirjasorteerimise masin. Nelikümmend aastat on ta jaganud laste kirjad õigetesse kastidesse, riikide kaupa.',
        'Eile hakkas ta kirju sorteerima lõhna järgi. Piparkoogilõhnalised kirjad lendasid ühte kasti, mandariinilõhnalised teise ja üks kiri, mis lõhnas koera järele, otse aknast välja.',
        'Hammasrataste vahelt leidsin pool piparkooki – keegi oli seal ilmselt lõunat söönud. Masin töötab jälle. Aknast välja lennanud kirja otsib praegu põhjapõder Välk. Tal on hea nina.',
      ],
    },
  },
  {
    id: 'snow-tunnel',
    title: 'Tunnel ukse ees',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['snow', 'home'],
    tones: ['humorous', 'heartwarming'],
    variants: {
      older: () => [
        'Meil on õues pikk triibuline lumemõõdupuu. Eile öösel sadas lund ja hommikul näitas puu täpselt kolm sentimeetrit.',
        'Ainult et tuul oli kogu ülejäänud lume kokku puhunud ühte hange. Ja hang oli minu ukse ees. Kõrgem kui uks.',
        'Kaevasin endale tunneli. See on kaheksa sammu pikk, keerab kaks korda ja ühes kohas on isegi väike aken, millest paistab taevas. Ausalt öeldes ei tahagi ma seda enam ära kaevata.',
      ],
    },
  },
  {
    id: 'clock-mouse',
    title: 'Tiksu käib tagurpidi',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['mechanism', 'animals'],
    tones: ['humorous', 'adventurous'],
    variants: {
      older: () => [
        'Töökoja suur kell, keda kõik kutsuvad Tiksuks, hakkas eile käima tagurpidi. Hommikul kell kaheksa näitas ta kuus, lõunal neli ja õhtuks olime kõik täiesti segaduses.',
        'Avasin kella tagaukse. Hammasrattad, vedru, pendel – ja ühe hammasratta peal jooksis pisike hiir, nagu oleks see tema isiklik võimlemisratas. Valet pidi.',
        'Ehitasin hiirele niidirullist päris oma ratta. Tiksu käib jälle õigesti ja hiir on nüüd ametlikult kellameistri abiline. Palka saab ta juustus.',
      ],
    },
  },
  {
    id: 'coded-note',
    title: 'Sedel tööpingil',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['codes'],
    tags: ['puzzle', 'night'],
    tones: ['adventurous'],
    variants: {
      older: (c) => [
        'Täna hommikul leidsin oma tööpingilt kokkumurtud sedeli. Allkirja polnud, ainult viis rida:',
        NOTE_LINES.join(' / '),
        c.uses('codes')
          ? 'Esmapilgul tundub see lihtsalt kehva luuletusena. Salakoodimeister aga teab, et nii kehv luuletus ei saa olla juhuslik. Mina taipasin alles kolmanda tassi tee juures, kust otsida.'
          : 'Esmapilgul tundub see lihtsalt kehva luuletusena. Aga nii kehv luuletus ei saa olla juhuslik. Mina taipasin alles kolmanda tassi tee juures, kust otsida.',
      ],
    },
    activities: {
      older: {
        essential: true,
        text: () => 'Kas sina leiad peidetud sõna? Vaata ridade algusi. Homme ütlen, mis seal oli.',
        answer: `${NOTE_WORD} (ridade esimesed tähed)`,
        reveal: (c) =>
          `Eilse sedeli ridade esitähed andsid sõna ${NOTE_WORD}. Kakao oli kuum, katus külm ja kutsujaks oli ${c.cast.young}.`,
        check: () => NOTE_LINES.map((line) => line.charAt(0)).join('') === NOTE_WORD,
      },
    },
  },
  {
    id: 'wrapping-ball',
    title: 'Kuidas pakkida palli',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['gifts', 'santa'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        'Pakkimisosakonnas oli eile suur vaidlus: kuidas pakkida palli? Ümmargune asi ja nurgeline paber ei ole sõbrad – paber kortsub ja pael libiseb.',
        `${c.cast.young} pakkis palli kümne paberilehega ja see nägi välja nagu kapsas. Mina joonistasin skeemi kaheteistkümnest viisnurgast, mis peaks palli täpselt katma. Arvutasin terve õhtu.`,
        'Lõpuks pani Jõuluvana palli suure punase soki sisse ja sidus otsa kinni. Väga ilus tuli. Minu skeem on nüüd seinal. Keegi pole veel küsinud, mis see on.',
      ],
    },
  },
  {
    id: 'mended-horse',
    title: 'Parandatud hobune',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['workshop', 'memory'],
    tones: ['heartwarming'],
    variants: {
      older: () => [
        'Töökojas on üks riiul mänguasjadega, mis on kunagi kingitud ja nüüd parandamiseks tagasi saadetud. Mina hoolitsen selle riiuli eest.',
        'Eile võtsin sealt puust hobuse. Ta kingiti kunagi ühele poisile, kes on nüüd vanaisa ja tahab hobuse edasi kinkida oma lapselapsele. Hobusel puudus üks kõrv ja saba oli kulunud nööriks.',
        'Voolisin kasepuust uue kõrva ja punusin linasest niidist saba. Kui valmis sain, seisis ta laual ja vaatas mind väga väärikalt. Tal on ees veel pikk tee.',
      ],
    },
  },
  {
    id: 'wall-newspaper',
    title: 'Seinalehe koomiks',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['comics'],
    tags: ['comics', 'reindeer', 'birds'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        'Töökojal on oma seinaleht „Põhjanaela Postimees“ ja sel nädalal oli koomiksi joonistamise kord minul.',
        'Joonistasin kolm pilti. Esimesel vaatab põhjapõder Välk peeglisse. Teisel näeb ta, et tal on sarvede vahel lind. Kolmandal on lind sinna pesa ehitanud ja Välk ei julge enam pead liigutada.',
        c.uses('comics')
          ? 'Joonistades mõtlesin Miki Hiire koomiksitele, mida sina loed: seal on ka alati hetk, kus kõik läheb viltu – ja just siis läheb huvitavaks. Minu lugu on muide tõsi. Välk liigub juba neljandat päeva väga ettevaatlikult.'
          : 'Lugu on muide tõsi. Välk liigub juba neljandat päeva väga ettevaatlikult.',
      ],
    },
  },
  {
    id: 'bell-raisin',
    title: 'Kaheteistkümnes kell',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['mechanism', 'sleigh', 'kitchen'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        'Jõuluvana kelgul on kaksteist kuldset kella. Igal aastal enne jõule häälestan need ära, et kelk kõlaks nagu üks laul, mitte nagu kaksteist erinevat.',
        'Eile häälestasin. Üksteist kella kõlasid puhtalt. Kaheteistkümnes tegi „klõnks“ – mitte „kõlin“, vaid just „klõnks“, nagu kukuks lusikas kaussi.',
        `Vaatasin kella sisse luubiga. Seal oli külmunud rosin. Kuidas rosin kella sisse sai, ma ei tea, aga ${c.cast.young} vilistas pärast seda väga süütult.`,
      ],
    },
  },
  {
    id: 'toy-exam',
    title: 'Mänguasjaeksam',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['riddles'],
    tags: ['puzzle', 'workshop'],
    tones: ['humorous'],
    variants: {
      older: (c) => [
        'Igal detsembril teevad noored päkapikud mänguasjaeksami ja mina olen eksamikomisjoni esimees. See tähendab, et istun kõige kõvemal toolil ja kortsutan kulmu.',
        'Ühes küsimuses tuli öelda, kas puust hobune tohib hammustada. Üks noor päkapikk vastas: „Ainult porgandit.“ Panin talle viie, sest vastus oli nii hea.',
        c.uses('riddles') ? 'Ühe küsimuse jätsin sulle, nuputaja:' : 'Ühe küsimuse jätsin sulle:',
      ],
    },
    activities: {
      older: {
        essential: true,
        text: () => 'Laua all on kaks põhjapõtra ja kolm päkapikku. Mitu jalga on laua all kokku?',
        answer: `${EXAM_ANSWER} jalga (põhjapõtradel 8, päkapikkudel 6)`,
        reveal: () =>
          `Eilse eksamiküsimuse vastus: ${EXAM_ANSWER} jalga. Üks noor päkapikk vastas 18, sest ta luges ka laua jalad kokku.`,
        check: () => EXAM_ANSWER === 14,
      },
    },
  },
  {
    id: 'beard-ribbon',
    title: 'Habe paelamasinas',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['santa', 'mechanism', 'memory'],
    tones: ['humorous', 'heartwarming'],
    variants: {
      older: () => [
        'Eile õhtul jäi Jõuluvana habe paelamasina vahele. Mitte palju, ainult natuke, aga masin jõudis selle siiski kolme ilusa lehviga kinni siduda.',
        'Lehvide lahtiharutamine võttis kaks tundi. Selle aja jooksul ei saanud Jõuluvana pead pöörata, nii et ta rääkis mulle, kuidas tema esimesel jõuluööl põhjapõdrad valesse suunda lendasid ja kõik kingid jõudsid ühte väikesesse külla Saaremaal.',
        'Ma ei tea, kas see on tõsi. Aga see küla on siiamaani väga rõõmus.',
      ],
    },
  },
  {
    id: 'frozen-words',
    title: 'Külmunud sõnad',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['weather', 'magic'],
    tones: ['magical', 'humorous'],
    variants: {
      older: () => [
        'Meil on praegu nii külm, et sõnad külmuvad õhus kinni. Kui ma eile hommikul talli ees „tere“ ütlesin, kukkus see väikese jääpurikana lumme. Ta on veel seal.',
        'Vanad päkapikud räägivad, et kevadel, kui sõnad sulavad, kostab üle õue korraga kogu talve jutt. Sellepärast valivad kõik praegu oma sõnu väga hoolikalt.',
        'Mina olen vait ja kirjutan. Paber ei külmu. Aga kui sa kevadel kuuled kuskilt kaugelt „tere“, siis tead, kellelt see on.',
      ],
    },
  },
  {
    id: 'ice-sculptures',
    title: 'Jääkujude võistlus',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ['rubik'],
    tags: ['snow', 'building', 'reindeer'],
    tones: ['magical', 'humorous'],
    variants: {
      older: (c) => [
        `Eile oli töökoja jääkujude võistlus. ${c.cast.young} tegi jääst pudrupoti koos lusikaga ja põhjapõder Välk sõi oma lumekuju enne hindamist ise ära.`,
        c.uses('rubik')
          ? 'Mina tegin jääst kuubiku, mille kõik ruudud on eri värvi – külmutasin vett mustika-, pohla- ja astelpajumahlaga. Keerata seda küll ei saa, aga päike paistab sellest läbi nagu kirikuaknast.'
          : 'Mina tegin jääst laterna, mille seintesse külmutasin pohlad ja kuuseoksad. Õhtul panin sisse küünla ja kogu õu muutus punakaks ja soojaks.',
        'Võitjat ei valitudki. Žürii – Jõuluvana – ütles, et kõik on võitjad, ja läks siis kiiresti tuppa, sest tal hakkas külm.',
      ],
    },
  },
  {
    id: 'first-christmas',
    title: 'Minu esimene jõuluöö',
    occasions: ['christmas'],
    role: 'standalone',
    tags: ['memory', 'sleigh', 'santa'],
    tones: ['heartwarming', 'magical'],
    earliest: 4,
    variants: {
      older: () => [
        'Kas ma olen sulle rääkinud oma esimesest jõuluööst? Olin siis nii pisike, et mahtusin Jõuluvana kindasse. Mind võeti kelgule kaasa ja anti üks ülesanne: hoida kõvasti kinni laternast, et see ei kukuks.',
        'Hoidsin kogu öö. Üle metsade, üle mere, üle tuhande katuse. Käed olid kanged ja nina külm, aga latern ei kukkunud.',
        'Kodus küsis Jõuluvana, mis oli kõige ilusam. Ütlesin: latern. Muud ma polnudki näinud, sest olin terve öö ainult laternat vaadanud. Ta naeris nii, et kelk kõikus.',
      ],
    },
  },
]
