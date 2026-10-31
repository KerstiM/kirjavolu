import type { AgeBand, ChildProfile, OccasionId, ParentInstruction, PuzzleKind, RequestFor } from '../models'
import { RIDDLES, type Riddle } from '../../data/templates/riddles'
import { adjustBand, ageBand } from './audience'
import { createContext, notesInstruction, paragraphs, type DraftItem, type ItemPicker, type TypeResult } from './context'
import { alphabetKey, encodeNumbers, ESTONIAN_ALPHABET, normalize, scramble, shiftText } from './puzzleTools'

type ConcreteKind = Exclude<PuzzleKind, 'mixed'>

export interface Challenge {
  heading: string
  body: string
  answer: string
}

/** Countable objects with their partitive form for "3 piparkooki". */
const COUNTABLES: Record<OccasionId, { part: string }[]> = {
  christmas: [{ part: 'piparkooki' }, { part: 'kommi' }, { part: 'kingitust' }],
  easter: [{ part: 'muna' }, { part: 'porgandit' }, { part: 'tibu' }],
  birthday: [{ part: 'õhupalli' }, { part: 'küünalt' }, { part: 'kingitust' }],
  halloween: [{ part: 'kõrvitsat' }, { part: 'kommi' }, { part: 'nahkhiirt' }],
  'mardi-kadri': [{ part: 'pähklit' }, { part: 'õuna' }, { part: 'lõngakera' }],
  vastlapaev: [{ part: 'vastlakuklit' }, { part: 'kelku' }, { part: 'lumepalli' }],
  valentines: [{ part: 'kaarti' }, { part: 'südant' }, { part: 'lille' }],
  'school-start': [{ part: 'pliiatsit' }, { part: 'vihikut' }, { part: 'raamatut' }],
  summer: [{ part: 'mustikat' }, { part: 'karpi' }, { part: 'kivi' }],
  'lost-tooth': [{ part: 'münti' }, { part: 'tähte' }, { part: 'hammast' }],
  everyday: [{ part: 'palli' }, { part: 'õuna' }, { part: 'klotsi' }],
}

const TODDLER_PLAY = [
  'Näita, kus on sinu nina! Aga kus on kõrvad?',
  'Leia toast midagi punast ja too see täiskasvanule.',
  'Tee nii, nagu teeb kass: mjäu! Ja nüüd nagu koer: auh!',
  'Plaksuta kolm korda käsi ja trambi kaks korda jalgu.',
  'Peida silmad peopesade taha – ja kukuu! Kus sa oled?',
  'Leia kodust midagi pehmet ja kallista seda.',
]

function riddle(p: ItemPicker, band: AgeBand, occasion: OccasionId): Challenge {
  const fits = (r: Riddle) => r.level === 'any' || r.level === band
  const themed = RIDDLES.filter((r) => fits(r) && r.occasions?.includes(occasion))
  const general = RIDDLES.filter((r) => fits(r) && !r.occasions)
  const chosen = p.pickTiered([themed, general, RIDDLES.filter(fits)], 'riddle')
  return {
    heading: chosen.folk ? 'Rahvapärane mõistatus' : 'Mõistatus',
    body: `${chosen.question}\n\nMis see on?`,
    answer: chosen.answer,
  }
}

function pickWord(p: ItemPicker, words: string[], band: AgeBand): string {
  const usable = words.filter((word) => [...normalize(word)].every((ch) => ESTONIAN_ALPHABET.includes(ch as never)))
  const sized = band === 'older' ? usable : usable.filter((word) => word.length <= 6)
  return p.pick(sized.length > 0 ? sized : usable.length > 0 ? usable : words, 'word')
}

function cipher(p: ItemPicker, band: AgeBand, words: string[], greeting: string): Challenge {
  if (band === 'older') {
    const shift = 1 + p.rng.int(3)
    const usePhrase = p.rng.next() < 0.4
    const plain = usePhrase ? greeting : pickWord(p, words, band)
    return {
      heading: 'Salakiri',
      body: paragraphs(
        `Iga täht on tähestikus nihkunud ${shift} koha võrra edasi. Nihuta tähed tagasi ja loe sõnum!`,
        shiftText(plain, shift),
        `Tähestik: ${ESTONIAN_ALPHABET.join(' ')}`,
      ),
      answer: normalize(plain),
    }
  }
  const word = pickWord(p, words, band)
  return {
    heading: 'Numbrikood',
    body: paragraphs('Iga number tähistab ühte tähte. Mis sõna siin peitub?', encodeNumbers(word), `Võti: ${alphabetKey()}`),
    answer: normalize(word),
  }
}

function anagram(p: ItemPicker, band: AgeBand, words: string[]): Challenge {
  const word = pickWord(p, words, band)
  const hint = band === 'young' ? `Vihje: sõna algab tähega „${normalize(word).charAt(0)}“.` : undefined
  return {
    heading: 'Segasõna',
    body: paragraphs('Tähed on sassi läinud! Mis sõna siit peitub?', scramble(word, p.rng), hint),
    answer: normalize(word),
  }
}

function math(p: ItemPicker, band: AgeBand, occasion: OccasionId, owner: string, rubik: boolean): Challenge {
  if (rubik && band === 'older') {
    return {
      heading: 'Kuubikuülesanne',
      body: 'Rubiku kuubikul on 6 tahku ja igal tahul 9 ruutu. Mitu ruutu on kuubikul kokku? Ja kui 2 tahku on juba ühevärvilised, mitu ruutu on veel lahendamata tahkudel?',
      answer: '54 ruutu; lahendamata tahkudel 36 ruutu',
    }
  }
  const { part } = p.pick(COUNTABLES[occasion], 'countable')
  if (band === 'older') {
    if (p.rng.next() < 0.5) {
      const perBag = 3 + p.rng.int(5)
      const bags = 3 + p.rng.int(5)
      // At least 2: Estonian uses the nominative after 1 ("1 komm"), the partitive after 2+.
      const extra = 2 + p.rng.int(5)
      return {
        heading: 'Nuputamisülesanne',
        body: `${owner} pakib kotte. Igasse kotti läheb ${perBag} ${part}. Kotte on ${bags}. Lisaks on laual veel ${extra} ${part}. Mitu ${part} on kokku?`,
        answer: String(perBag * bags + extra),
      }
    }
    const friends = 2 + p.rng.int(4)
    const each = 2 + p.rng.int(6)
    return {
      heading: 'Nuputamisülesanne',
      body: `${friends} sõpra jagavad ${friends * each} ${part} võrdselt. Mitu ${part} saab igaüks?`,
      answer: String(each),
    }
  }
  const a = 2 + p.rng.int(6)
  // b ≥ 2 keeps the partitive correct ("2 õuna"); a + b stays within 10.
  const b = 2 + p.rng.int(Math.min(3, 9 - a))
  if (p.rng.next() < 0.5) {
    return {
      heading: 'Arvutame',
      body: `${owner} sai ${a} ${part}. Siis sai ta veel ${b} ${part}. Mitu ${part} on tal nüüd?`,
      answer: String(a + b),
    }
  }
  const total = a + b
  return {
    heading: 'Arvutame',
    body: `Korvis oli ${total} ${part}. ${b} ${part} anti sõbrale. Mitu ${part} jäi korvi?`,
    answer: String(a),
  }
}

function sequence(p: ItemPicker, band: AgeBand, words: string[]): Challenge {
  if (band === 'older') {
    const type = p.rng.int(3)
    if (type === 0) {
      const start = 1 + p.rng.int(9)
      const step = 3 + p.rng.int(6)
      const seq = Array.from({ length: 5 }, (_, i) => start + i * step)
      return { heading: 'Arvujada', body: `Mis arv tuleb järgmisena?\n\n${seq.join(', ')}, ?`, answer: String(start + 5 * step) }
    }
    if (type === 1) {
      const start = 1 + p.rng.int(3)
      const seq = Array.from({ length: 5 }, (_, i) => start * 2 ** i)
      return { heading: 'Arvujada', body: `Mis arv tuleb järgmisena?\n\n${seq.join(', ')}, ?`, answer: String(start * 32) }
    }
    const up = 2 + p.rng.int(4)
    const down = 1
    const seq: number[] = [10 + p.rng.int(5)]
    for (let i = 1; i < 6; i++) seq.push((seq[i - 1] as number) + (i % 2 === 1 ? up : -down))
    // Steps alternate +up, -down; six steps were shown, so the seventh is -down.
    const next = (seq[5] as number) - down
    return { heading: 'Arvujada', body: `Mis arv tuleb järgmisena?\n\n${seq.join(', ')}, ?`, answer: String(next) }
  }
  const [first, second] = p.pickMany(words, 'sequence-word', 2)
  const a = first ?? 'täht'
  const b = second ?? 'kuu'
  const pattern = p.rng.next() < 0.5 ? [a, b, a, b, a] : [a, b, b, a, b, b, a]
  // Both patterns (ABABA and ABBABBA) continue with B.
  return {
    heading: 'Mis tuleb järgmisena?',
    body: `Vaata mustrit ja ütle, mis tuleb järgmisena.\n\n${pattern.join(' – ')} – ?`,
    answer: b,
  }
}

const YOUNG_ORDER: ConcreteKind[] = ['riddle', 'math', 'anagram', 'sequence', 'cipher']
const OLDER_ORDER: ConcreteKind[] = ['cipher', 'riddle', 'math', 'sequence', 'anagram']

export function generatePuzzles(request: RequestFor<'puzzle'>, variants: readonly number[]): TypeResult {
  const { options, general } = request
  const ctx = createContext(request, variants, '')
  const { audience, occasion } = ctx
  const vocab = occasion.vocabulary
  const count = Math.min(Math.max(options.challengeCount, 1), 12)
  const order = ctx.structure.shuffle(audience.band === 'older' ? OLDER_ORDER : YOUNG_ORDER)
  const solvers: ChildProfile[] = audience.children

  const items: DraftItem[] = []
  for (let i = 0; i < count; i++) {
    const p = ctx.item(i)
    const child = solvers[i % solvers.length] as ChildProfile
    const band = adjustBand(ageBand(child), general.difficulty)
    const kind: ConcreteKind = options.kind === 'mixed' ? (order[i % order.length] as ConcreteKind) : options.kind
    const rubik = audience.hooks.some(({ child: c, hook }) => c.id === child.id && hook.id === 'rubik')
    let challenge: Challenge
    if (band === 'toddler') {
      challenge = {
        heading: 'Mänguülesanne',
        body: `Täiskasvanu loeb ette:\n\n${p.pick(TODDLER_PLAY, 'toddler')}`,
        answer: 'Iga katse on õige – kiida ja plaksuta!',
      }
    } else if (kind === 'riddle') challenge = riddle(p, band, occasion.id)
    else if (kind === 'cipher') challenge = cipher(p, band, vocab.words, vocab.greeting)
    else if (kind === 'anagram') challenge = anagram(p, band, vocab.words)
    else if (kind === 'math') challenge = math(p, band, occasion.id, vocab.sender, rubik && i < solvers.length)
    else challenge = sequence(p, band, vocab.words)

    const intro =
      i === 0
        ? `${vocab.sender} saatis ${audience.v('sulle', 'teile')} salamissiooni. Lahenda${audience.v('', 'ge')} kõik ülesanded!`
        : undefined
    items.push({
      kind: 'puzzle',
      label: `Ülesanne ${i + 1}${audience.plural ? ` · ${child.name}` : ''}`,
      heading: challenge.heading,
      body: paragraphs(intro, challenge.body),
      forChild: audience.plural ? child.name : undefined,
      answer: challenge.answer,
    })
  }

  const secret = options.secretCode.trim()
  if (secret) {
    const index = items.length
    const p = ctx.item(index)
    const band = audience.readers.some((c) => ageBand(c) === 'older') ? 'older' : 'young'
    const shift = 1 + p.rng.int(3)
    items.push({
      kind: 'puzzle',
      label: 'Salakood',
      heading: 'Viimane salakood',
      body:
        band === 'older'
          ? paragraphs(
              'Kõik ülesanded on lahendatud! Viimane salakood näitab, kus peitub üllatus.',
              `Iga täht on nihkunud ${shift} koha võrra edasi:`,
              shiftText(secret, shift),
              `Tähestik: ${ESTONIAN_ALPHABET.join(' ')}`,
            )
          : paragraphs(
              'Kõik ülesanded on lahendatud! Viimane salakood näitab, kus peitub üllatus.',
              encodeNumbers(secret),
              `Võti: ${alphabetKey()}`,
            ),
      answer: normalize(secret),
    })
  }

  const instructions: ParentInstruction[] = [
    {
      title: 'Kuidas mängida',
      steps: [
        'Prindi ülesanded ja anna need lapsele ükshaaval või korraga.',
        'Vastused on eraldi lehel – hoia see enda käes.',
        ...(audience.plural ? ['Iga ülesande peal on kirjas, kelle kord on seda lahendada. Teised võivad aidata vihjetega.'] : []),
        ...(secret ? ['Viimane salakood avab peidukoha – peida üllatus enne mängu algust sinna.'] : []),
      ],
    },
  ]
  const notes = notesInstruction(general.notes)
  if (notes) instructions.push(notes)

  return {
    title: secret ? 'Salamissioon' : 'Mõistatused ja nuputamine',
    subtitle: `${occasion.name} · ${audience.names}`,
    items,
    instructions,
  }
}
