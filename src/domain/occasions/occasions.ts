import type { Occasion, OccasionId } from '../models'

export const OCCASIONS: Occasion[] = [
  {
    id: 'christmas',
    name: 'Jõulud',
    when: 'Detsember',
    description: 'Päkapikukirjad, advendikalender ja jõulumõistatused.',
    icon: 'TreePine',
    suggested: ['letter', 'calendar', 'puzzle', 'treasure-hunt', 'story', 'certificate'],
    ideas: [
      { label: '24 päkapikukirja', type: 'letter' },
      { label: 'Advendikalender', type: 'calendar' },
      { label: 'Jõulude salamissioon', type: 'puzzle' },
    ],
    vocabulary: {
      words: ['piparkook', 'kuusk', 'päkapikk', 'kingitus', 'lumehelves', 'kelk', 'küünal', 'jõulutäht', 'põhjapõder', 'sokk'],
      moods: [
        'Väljas sajab vaikselt lund ja aknal helgivad küünlad.',
        'Kogu majas lõhnab piparkookide ja mandariinide järele.',
        'Jõuluvana töökojas tiksub suur kell, mis loeb päevi jõuludeni.',
        'Põhjapõdrad harjutavad juba öiseid lende üle katuste.',
      ],
      greeting: 'Häid jõule',
      sender: 'Päkapikk Tuduja',
      senderHome: 'Jõuluvana töökoda kaugel põhjas',
      prize: 'väike jõuluüllatus',
    },
  },
  {
    id: 'easter',
    name: 'Lihavõtted',
    when: 'Kevad',
    description: 'Munajaht, jänkukirjad ja kevadised vihjekaardid.',
    icon: 'Egg',
    suggested: ['treasure-hunt', 'letter', 'puzzle', 'story', 'calendar', 'certificate'],
    ideas: [
      { label: 'Lihavõttejänese munajaht', type: 'treasure-hunt' },
      { label: 'Jänku kiri', type: 'letter' },
      { label: 'Kevadine lugu', type: 'story' },
    ],
    vocabulary: {
      words: ['muna', 'jänes', 'tibu', 'pajuoks', 'kevad', 'korv', 'lill', 'rohi', 'porgand', 'pesa'],
      moods: [
        'Pajuoksad on täis pehmeid urbi ja päike soojendab juba aknalauda.',
        'Aias sirutavad esimesed lilled pead mullast välja.',
        'Kuskil põõsa all sätib keegi pikk-kõrv värvilisi mune korvi.',
      ],
      greeting: 'Häid lihavõttepühi',
      sender: 'Lihavõttejänes Hüpsik',
      senderHome: 'jänkude kevadmetsa urg',
      prize: 'šokolaadimunade pesa',
    },
  },
  {
    id: 'birthday',
    name: 'Sünnipäev',
    when: 'Iga-aastane',
    description: 'Sünnipäevaseiklus, aardejaht, peomängud ja õnnitluskaart.',
    icon: 'Cake',
    suggested: ['treasure-hunt', 'story', 'puzzle', 'certificate', 'letter', 'calendar'],
    ideas: [
      { label: 'Detektiiviseiklus', type: 'story' },
      { label: 'Peo aardejaht', type: 'treasure-hunt' },
      { label: 'Õnnitluskaart', type: 'certificate' },
    ],
    vocabulary: {
      words: ['tort', 'küünal', 'õhupall', 'kingitus', 'pidu', 'serpentiin', 'müts', 'kook', 'soov', 'üllatus'],
      moods: [
        'Laual ootab tort ja õhupallid tantsivad lae all.',
        'Täna on päev, mil kõik soovid kõlavad natuke valjemini.',
        'Kuskil krabistab pakipaber ja keegi sosistab saladusi.',
      ],
      greeting: 'Palju õnne sünnipäevaks',
      sender: 'Sünnipäevavõlur Konfetti',
      senderHome: 'Üllatuste torn, kus küünlad kunagi ei kustu',
      prize: 'sünnipäevaüllatus',
    },
  },
  {
    id: 'halloween',
    name: 'Halloween',
    when: '31. oktoober',
    description: 'Sõbralikult kõhedad mõistatused ja kõrvitsajaht.',
    icon: 'Ghost',
    suggested: ['puzzle', 'treasure-hunt', 'story', 'letter', 'calendar', 'certificate'],
    ideas: [
      { label: 'Kummituse mõistatused', type: 'puzzle' },
      { label: 'Kõrvitsa aardejaht', type: 'treasure-hunt' },
      { label: 'Õudselt naljakas lugu', type: 'story' },
    ],
    vocabulary: {
      words: ['kõrvits', 'kummitus', 'nõid', 'luud', 'nahkhiir', 'komm', 'mask', 'kuu', 'loss', 'ämblik'],
      moods: [
        'Kõrvitsalaternad irvitavad akendel sõbralikult.',
        'Täiskuu valgustab teed ja kuskil kriuksub vana värav.',
        'Väike kummitus harjutab peegli ees oma kõige hirmsamat „Buu!“.',
      ],
      greeting: 'Õudselt toredat halloweeni',
      sender: 'Sõbralik kummitus Pilvik',
      senderHome: 'kriuksuva vana lossi pööning',
      prize: 'kommikott',
    },
  },
  {
    id: 'mardi-kadri',
    name: 'Mardi- ja kadripäev',
    when: '10. ja 25. november',
    description: 'Rahvapärased mõistatused, sanditamine ja vanad kombed.',
    icon: 'Drama',
    suggested: ['puzzle', 'calendar', 'story', 'treasure-hunt', 'letter', 'certificate'],
    ideas: [
      { label: 'Rahvapärased mõistatused', type: 'puzzle' },
      { label: 'Sandipäeva tegevused', type: 'calendar' },
      { label: 'Muinasjutt sanditamisest', type: 'story' },
    ],
    vocabulary: {
      words: ['mardisant', 'kadrisant', 'lõng', 'vill', 'laul', 'kask', 'mask', 'õnnesoov', 'pähkel', 'uba'],
      moods: [
        'Novembriõhtud on pimedad, aga sandid toovad uksele laulu ja naeru.',
        'Mardisandid kannavad tumedaid riideid, kadrid aga heledaid.',
        'Vanasti soovisid sandid perele head karja, viljaõnne ja lõnga kõrge kasvu.',
      ],
      greeting: 'Head mardi- ja kadripäeva',
      sender: 'Vana Mart',
      senderHome: 'talu, kus lõngakerad kasvavad iga aastaga suuremaks',
      prize: 'pähklite ja õunte kott',
    },
  },
  {
    id: 'vastlapaev',
    name: 'Vastlapäev',
    when: 'Veebruar või märts',
    description: 'Liulaskmine, vastlakuklid ja vastlavurri meisterdamine.',
    icon: 'MountainSnow',
    suggested: ['calendar', 'treasure-hunt', 'puzzle', 'story', 'certificate', 'letter'],
    ideas: [
      { label: 'Vastlapäeva tegevused', type: 'calendar' },
      { label: 'Pikima liu diplom', type: 'certificate' },
      { label: 'Lumine aardejaht', type: 'treasure-hunt' },
    ],
    vocabulary: {
      words: ['kelk', 'liumägi', 'vastlakukkel', 'vurr', 'lumi', 'hernesupp', 'mägi', 'vahukoor', 'lina', 'kelgurada'],
      moods: [
        'Vanasõna ütleb, et mida pikem liug, seda pikem lina kasvab.',
        'Liumäel kostab kilkeid ja kelgud sõidavad üksteise võidu.',
        'Köögis ootab soe hernesupp ja vahukoorega vastlakukkel.',
      ],
      greeting: 'Head vastlapäeva',
      sender: 'Lumememm Liuguja',
      senderHome: 'kõige pikema liumäe tipp',
      prize: 'vastlakukkel',
    },
  },
  {
    id: 'valentines',
    name: 'Sõbrapäev',
    when: '14. veebruar',
    description: 'Sõbrakaardid, heategude kalender ja sõpruse lood.',
    icon: 'HeartHandshake',
    suggested: ['certificate', 'calendar', 'letter', 'story', 'puzzle', 'treasure-hunt'],
    ideas: [
      { label: 'Sõbrakaart', type: 'certificate' },
      { label: 'Heategude kalender', type: 'calendar' },
      { label: 'Lugu sõprusest', type: 'story' },
    ],
    vocabulary: {
      words: ['sõber', 'süda', 'kaart', 'kallistus', 'naeratus', 'heategu', 'kingitus', 'sõprus', 'lill', 'kiri'],
      moods: [
        'Sõbrapäeval on kõige parem kingitus soe sõna.',
        'Kuskil kirjutab keegi praegu kaarti, mis teeb kellegi päeva rõõmsaks.',
        'Üks naeratus võib rännata terve linna läbi.',
      ],
      greeting: 'Head sõbrapäeva',
      sender: 'Sõbrapäeva postiljon Tuvike',
      senderHome: 'pilvede peal asuv südamete postkontor',
      prize: 'sõbrapäeva üllatus',
    },
  },
  {
    id: 'school-start',
    name: 'Kooliaasta algus',
    when: '1. september',
    description: 'Julgustav kiri, esimese koolipäeva diplom ja tarkusepäeva mõistatused.',
    icon: 'Backpack',
    suggested: ['letter', 'certificate', 'puzzle', 'story', 'calendar', 'treasure-hunt'],
    ideas: [
      { label: 'Julgustav kiri', type: 'letter' },
      { label: 'Tarkusepäeva diplom', type: 'certificate' },
      { label: 'Tarkusepäeva mõistatused', type: 'puzzle' },
    ],
    vocabulary: {
      words: ['koolikott', 'pinal', 'pliiats', 'raamat', 'õpetaja', 'klass', 'kell', 'vihik', 'aabits', 'lill'],
      moods: [
        'Koolimaja uksed on pestud läikima ja kell ootab esimest helinat.',
        'Uus vihik lõhnab paberi ja uute alguste järele.',
        'Tarkusepäeval on kõik natuke elevil, isegi õpetajad.',
      ],
      greeting: 'Head uut kooliaastat',
      sender: 'Tarkusehaldjas Pliiats',
      senderHome: 'raamatukogu kõige kõrgem riiul',
      prize: 'uus märkmik ja pliiats',
    },
  },
  {
    id: 'summer',
    name: 'Suvevaheaeg',
    when: 'Juuni–august',
    description: 'Õueväljakutsed, loodusbingo ja pere seikluskalender.',
    icon: 'Sun',
    suggested: ['calendar', 'treasure-hunt', 'puzzle', 'story', 'certificate', 'letter'],
    ideas: [
      { label: '30 päeva seikluskalender', type: 'calendar' },
      { label: 'Õue aardejaht', type: 'treasure-hunt' },
      { label: 'Suvised nuputamised', type: 'puzzle' },
    ],
    vocabulary: {
      words: ['päike', 'meri', 'mustikas', 'liblikas', 'telk', 'lõke', 'jäätis', 'rand', 'mets', 'kivi'],
      moods: [
        'Päike paistab hilisõhtuni ja rohi lõhnab soojalt.',
        'Metsas valmivad mustikad ja kuskil siristab rohutirts.',
        'Rannal ootavad lained, et keegi ehitaks liivast lossi.',
      ],
      greeting: 'Päikselist suve',
      sender: 'Suvetuul Siuts',
      senderHome: 'mere kohal hõljuv pilvelaev',
      prize: 'suvine üllatus',
    },
  },
  {
    id: 'lost-tooth',
    name: 'Piimahammas',
    when: 'Kui hammas tuleb välja',
    description: 'Hambahaldja kiri ja tunnistus julgele hambaomanikule.',
    icon: 'Smile',
    suggested: ['letter', 'certificate', 'story', 'puzzle', 'treasure-hunt', 'calendar'],
    ideas: [
      { label: 'Hambahaldja kiri', type: 'letter' },
      { label: 'Julge hambaomaniku diplom', type: 'certificate' },
    ],
    vocabulary: {
      words: ['hammas', 'padi', 'münt', 'haldjas', 'hambahari', 'naeratus', 'tiib', 'tolm', 'kast', 'öö'],
      moods: [
        'Öösel, kui kõik magavad, lendab keegi tasa-tasa üle linna.',
        'Hambahaldja tiivad sätendavad kuuvalgel nagu kaste.',
        'Padja all ootav hammas on haldjale väga tähtis aare.',
      ],
      greeting: 'Palju õnne uue hambaaugu puhul',
      sender: 'Hambahaldjas Helk',
      senderHome: 'pilvede taga asuv hammaste loss',
      prize: 'läikiv münt',
    },
  },
  {
    id: 'everyday',
    name: 'Tavaline päev',
    when: 'Igal ajal',
    description: 'Toamängud, unejutud, kiired mõistatused ja õdede-vendade seiklused.',
    icon: 'Sparkles',
    suggested: ['story', 'treasure-hunt', 'puzzle', 'calendar', 'letter', 'certificate'],
    ideas: [
      { label: 'Unejutt', type: 'story' },
      { label: 'Toa aardejaht', type: 'treasure-hunt' },
      { label: 'Kiired mõistatused', type: 'puzzle' },
    ],
    vocabulary: {
      words: ['raamat', 'padi', 'tekk', 'mänguasi', 'kass', 'vihmavari', 'tass', 'aken', 'täht', 'kuu'],
      moods: [
        'Tavaline päev on täis väikeseid imesid, kui neid vaid märgata.',
        'Aknast paistab tuttav õu, aga täna tundub see kuidagi salapärane.',
        'Kodus on vaikne ja hubane, just paras aeg seikluseks.',
      ],
      greeting: 'Toredat päeva',
      sender: 'Salapärane Sõber',
      senderHome: 'raamaturiiuli taga peituv pisike maailm',
      prize: 'väike üllatus',
    },
  },
]

export function getOccasion(id: OccasionId): Occasion {
  const found = OCCASIONS.find((occasion) => occasion.id === id)
  if (!found) throw new Error(`Unknown occasion: ${id}`)
  return found
}

export function isOccasionId(value: unknown): value is OccasionId {
  return OCCASIONS.some((occasion) => occasion.id === value)
}
