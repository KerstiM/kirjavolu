import type { OccasionId } from '../../domain/models'

export interface Riddle {
  question: string
  answer: string
  level: 'young' | 'older' | 'any'
  occasions?: OccasionId[]
  /** Marks riddles in the style of Estonian folk riddles. */
  folk?: boolean
}

export const RIDDLES: Riddle[] = [
  { question: 'Mida rohkem sellest ära võtad, seda suuremaks see läheb.', answer: 'auk', level: 'older' },
  { question: 'Mis läheb kogu aeg üles, aga ei tule kunagi alla?', answer: 'vanus', level: 'older' },
  { question: 'Tal on silm, aga ta ei näe.', answer: 'nõel', level: 'older', folk: true },
  { question: 'Talvel ja suvel ühte karva.', answer: 'kuusk', level: 'any', folk: true, occasions: ['christmas', 'mardi-kadri'] },
  { question: 'Täis auke, aga hoiab ikka vett.', answer: 'käsn', level: 'older' },
  { question: 'Ilma jalgadeta jookseb, ilma suuta kohiseb.', answer: 'jõgi', level: 'older', folk: true },
  { question: 'Mida rohkem seda on, seda vähem näed.', answer: 'pimedus', level: 'older' },
  { question: 'Käib, aga jalgu ei ole; tiksub, aga südant ei ole.', answer: 'kell', level: 'any', folk: true },
  { question: 'Hommikul käib neljal jalal, lõunal kahel ja õhtul kolmel.', answer: 'inimene', level: 'older' },
  { question: 'See on sinu oma, aga teised kasutavad seda palju rohkem kui sina.', answer: 'nimi', level: 'older' },
  { question: 'Mida rohkem see kuivatab, seda märjemaks ise läheb.', answer: 'rätik', level: 'older' },
  { question: 'Valge põld, mustad seemned – külvaja külvab käega.', answer: 'kiri', level: 'older', folk: true },
  { question: 'Mida rohkem seda jagad, seda rohkem seda alles jääb.', answer: 'rõõm', level: 'older', occasions: ['valentines'] },
  { question: 'Pikad kõrvad, lühike saba, hüppab kiiresti metsa poole.', answer: 'jänes', level: 'young', occasions: ['easter'] },
  { question: 'Olen kollane ja soe, paistan päeval taevas.', answer: 'päike', level: 'young', occasions: ['summer'] },
  { question: 'Mul on neli jalga ja selg, aga ma ei kõnni kunagi.', answer: 'tool', level: 'young' },
  { question: 'Ütlen „mõmm“ ja magan terve talve.', answer: 'karu', level: 'young' },
  { question: 'Olen ümmargune ja põrkan. Mind visatakse ja lüüakse jalaga.', answer: 'pall', level: 'young' },
  { question: 'Kasvan peenras, olen oranž ja krõmpsuv. Jänes armastab mind.', answer: 'porgand', level: 'young', occasions: ['easter'] },
  { question: 'Kes tuleb jõuluööl, punane kuub seljas ja valge habe ees?', answer: 'Jõuluvana', level: 'young', occasions: ['christmas'] },
  { question: 'Kes jätab detsembris aknalaual olevasse sussi kommi?', answer: 'päkapikk', level: 'young', occasions: ['christmas'] },
  { question: 'Olen roheline ja okkaline, jõuludel ehitakse mind tuledega.', answer: 'kuusk', level: 'young', occasions: ['christmas'] },
  { question: 'Olen pruun ja lõhnan kaneeli järele. Mind lõigatakse vormiga ja küpsetatakse ahjus.', answer: 'piparkook', level: 'older', occasions: ['christmas'] },
  { question: 'Kukun taevast, olen valge ja iga mina on teistest erinev.', answer: 'lumehelves', level: 'older', occasions: ['christmas', 'vastlapaev'] },
  { question: 'Valge või pruun kest, sees kollane süda.', answer: 'muna', level: 'young', occasions: ['easter'] },
  { question: 'Olen pehme ja kollane, koorun munast ja ütlen „piiks“.', answer: 'tibu', level: 'young', occasions: ['easter'] },
  { question: 'Kevadel on mu oksad täis pehmeid halle kassikesi.', answer: 'paju', level: 'older', occasions: ['easter'] },
  { question: 'Mind süüdatakse tordil ja puhutakse soovi saatel.', answer: 'küünal', level: 'young', occasions: ['birthday'] },
  { question: 'Mind täidetakse õhuga ja seotakse paelaga.', answer: 'õhupall', level: 'young', occasions: ['birthday'] },
  { question: 'Mul on paber ümber ja pael peal, sees on üllatus.', answer: 'kingitus', level: 'young', occasions: ['birthday', 'christmas'] },
  { question: 'Olen oranž ja ümmargune, sügisel lõigatakse mulle nägu.', answer: 'kõrvits', level: 'young', occasions: ['halloween'] },
  { question: 'Lendan öösel, päeval magan peaga alaspidi.', answer: 'nahkhiir', level: 'older', occasions: ['halloween'] },
  { question: 'Mul on kaheksa jalga ja ma koon võrku.', answer: 'ämblik', level: 'young', occasions: ['halloween'] },
  { question: 'Väljast kõva kest, seest magus tuum.', answer: 'pähkel', level: 'any', folk: true, occasions: ['mardi-kadri'] },
  { question: 'Pikk niit keritakse keraks, sellest kootakse kindad ja sokid.', answer: 'lõng', level: 'any', folk: true, occasions: ['mardi-kadri'] },
  { question: 'Käib novembris uksest uksesse, laulab, soovib õnne ja saab vastu pähkleid.', answer: 'sant', level: 'any', occasions: ['mardi-kadri'] },
  { question: 'Kasukas on tagurpidi seljas, nägu tahmane – novembriõhtul koputab uksele.', answer: 'mardisant', level: 'older', folk: true, occasions: ['mardi-kadri'] },
  { question: 'Valges riides, peas valge rätik – laulab novembri lõpus uksel.', answer: 'kadrisant', level: 'older', folk: true, occasions: ['mardi-kadri'] },
  { question: 'Mida pikem liug mäest alla, seda pikemaks see kasvab.', answer: 'lina', level: 'older', folk: true, occasions: ['vastlapaev'] },
  { question: 'Saiake vahukoorega, mida süüakse vastlapäeval.', answer: 'vastlakukkel', level: 'young', occasions: ['vastlapaev'] },
  { question: 'Mul on palju lehti, aga ma ei ole puu.', answer: 'raamat', level: 'any', occasions: ['school-start'] },
  { question: 'Kirjutan nii kaua, kuni jään nii lühikeseks, et mind ei saa enam käes hoida.', answer: 'pliiats', level: 'older', occasions: ['school-start'] },
  { question: 'Sinine ja sügav, lained jooksevad randa.', answer: 'meri', level: 'young', occasions: ['summer'] },
  { question: 'Väike ja sinine, kasvan metsas ja värvin keele siniseks.', answer: 'mustikas', level: 'young', occasions: ['summer'] },
  { question: 'Värvilised tiivad, lendan lillelt lillele.', answer: 'liblikas', level: 'young', occasions: ['summer'] },
  { question: 'Väike ja valge, tulen välja ja minu asemele kasvab uus.', answer: 'piimahammas', level: 'any', occasions: ['lost-tooth'] },
]
