import type { ContentTypeId } from '../../../domain/models'

/**
 * Which kinds of creation the wizard offers. For now the magical letter and the certificate;
 * the others are still being polished. A kind not on this list is shown gray with a label and
 * cannot be picked: put it back here when it is ready.
 */
export const READY_TYPES: readonly ContentTypeId[] = ['letter', 'certificate']

export const isReady = (type: ContentTypeId) => READY_TYPES.includes(type)

/** The label on a gray card. */
export const NOT_READY_LABEL = 'Töös'

/**
 * What the Jõulupass adds, marked on the cards; everything else is free and unmarked.
 * "only": just with the pass; "extra": free from templates, personal with the pass.
 */
export const PASS_MARK: Partial<Record<ContentTypeId, 'only' | 'extra'>> = { letter: 'extra', story: 'only' }

/**
 * Coming later: shown as gray cards on the home page, not in the wizard. `pass: 'only'` marks
 * one that comes with the Jõulupass.
 */
export const COMING_SOON = [
  {
    id: 'santa-greeting',
    title: 'Jõuluvana tervitus',
    tagline: 'Isiklik tervitus jõuluvanalt, Jõulupassiga',
    description: 'Jõuluvana pöördub lapse poole nimepidi ja teab, mida ta sel aastal õppis ja tegi.',
    icon: 'Gift',
    label: 'Varsti',
    pass: 'only',
  },
  {
    id: 'parent-gift',
    title: 'Kingitus emale või isale',
    tagline: 'Emadepäevaks, isadepäevaks või vanavanematele',
    description: 'Lapse enda sõnadest sünnib südamlik kingileht, kupongiraamat või väike personaalne raamat.',
    icon: 'HeartHandshake',
    label: 'Varsti',
    pass: undefined,
  },
] as const
