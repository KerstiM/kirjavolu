import type { CertificateStyle, OccasionId, ParentInstruction, RequestFor, Tone } from '../models'
import { formatDate, todayIso } from '../text/estonian'
import { findInterestHooks } from '../../data/templates/interests'
import { createContext, notesInstruction, paragraphs, type DraftItem, type TypeResult } from './context'

export const DEFAULT_ACHIEVEMENTS: Record<OccasionId, string> = {
  christmas: 'terve aasta heade tegude eest',
  easter: 'osava munajahi eest',
  birthday: 'suurepärase sünnipäevalapse tiitli puhul',
  halloween: 'kõige sõbralikuma kummitamise eest',
  'mardi-kadri': 'rõõmsa sanditamise ja ilusate õnnesoovide eest',
  vastlapaev: 'kõige pikema liu eest',
  valentines: 'hea sõbra olemise eest',
  'school-start': 'uue kooliaasta julge alustamise eest',
  summer: 'vahvate suviste seikluste eest',
  'lost-tooth': 'julge hambaomaniku tiitli puhul',
  everyday: 'tubli ja abivalmis olemise eest',
}

const DIPLOMA_HEADINGS: Record<CertificateStyle, string> = {
  classic: 'Diplom',
  magical: 'Võlutunnistus',
  playful: 'Supertubli diplom!',
}

const DIPLOMA_INTROS: Record<CertificateStyle, string> = {
  classic: 'Selle diplomi saab',
  magical: 'Selle võlutunnistuse omanik on',
  playful: 'Hurraa! Selle diplomi saab',
}

const WISHES: Record<Tone, string[]> = {
  heartwarming: [
    'Olgu sinu ümber alati inimesed, kes sind armastavad ja hoiavad.',
    'Soovin sulle päikest igasse päeva ja naeru igasse hommikusse.',
    'Ära kunagi unusta, kui eriline sa oled.',
  ],
  magical: [
    'Olgu sinu päevad täis väikeseid imesid ja suuri unistusi.',
    'Soovin, et sinu soovid lendaksid kõrgele nagu tähed.',
    'Hoia oma südames võlu – see muudab iga päeva eriliseks.',
  ],
  humorous: [
    'Soovin sulle nii palju naeru, et kõht hakkab valutama – heas mõttes!',
    'Olgu sul alati üks komm taskus ja üks nali varuks.',
    'Soovin, et sokid oleksid alati paaris ja tuju alati hea!',
  ],
  adventurous: [
    'Olgu sul palju põnevaid seiklusi ja veel rohkem põhjuseid naeratada.',
    'Soovin, et julgeksid unistada suurelt ja avastada uusi radu.',
    'Olgu iga uus päev nagu kaart, millel ootab mõni aare.',
  ],
}

export function generateCertificates(request: RequestFor<'certificate'>, variants: readonly number[]): TypeResult {
  const { options, general } = request
  const issuer = options.issuer.trim() || 'Sinu pere'
  const ctx = createContext(request, variants, issuer)
  const { audience, occasion } = ctx
  const achievement = options.achievement.trim() || DEFAULT_ACHIEVEMENTS[occasion.id]
  const today = formatDate(todayIso())

  const items: DraftItem[] = audience.children.map((child, index) => {
    const p = ctx.item(index)
    const special = child.achievements[0] ? `Eriline tunnustus: „${child.achievements[0]}“` : undefined
    if (options.format === 'diploma') {
      return {
        kind: 'certificate',
        label: occasion.name,
        heading: DIPLOMA_HEADINGS[options.style],
        body: paragraphs(DIPLOMA_INTROS[options.style], child.name, achievement, special, options.message.trim()),
        signature: `${issuer}\n${today}`,
        forChild: child.name,
      }
    }
    const hook = findInterestHooks([...child.interests, ...child.favorites])[0]
    const wishes = p.pickMany(WISHES[general.tone], 'wish', general.length === 'short' ? 1 : 2)
    return {
      kind: 'certificate',
      label: occasion.name,
      heading: `${occasion.vocabulary.greeting}!`,
      body: paragraphs(
        `Kallis ${child.name}!`,
        ...wishes,
        hook ? `Olgu sul alati aega selle jaoks, mida armastad – olgu selleks ${hook.topic}.` : undefined,
        options.message.trim(),
      ),
      signature: issuer,
      forChild: child.name,
    }
  })

  const instructions: ParentInstruction[] = [
    {
      title: 'Kuidas kasutada',
      steps: [
        'Prindi paksemale paberile – nii näeb diplom või kaart välja pidulikum.',
        'Allkirjasta ja anna üle pidulikult: näiteks õhtusöögi ajal või hommikul voodi kõrval.',
      ],
    },
  ]
  const notes = notesInstruction(general.notes)
  if (notes) instructions.push(notes)

  return {
    title: options.format === 'diploma' ? 'Diplom' : 'Õnnitluskaart',
    subtitle: `${occasion.name} · ${audience.names}`,
    items,
    instructions,
  }
}
