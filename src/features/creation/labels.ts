import type {
  CalendarSetting,
  CertificateFormat,
  CertificateStyle,
  Difficulty,
  EducationalTheme,
  Length,
  PuzzleKind,
  Setting,
  StoryGenre,
  Tone,
} from '../../domain/models'
import { THEME_LABELS, GENRE_LABELS } from '../../data/templates/stories'

type Options<T> = { value: T; label: string }[]

export const TONE_OPTIONS: Options<Tone> = [
  { value: 'magical', label: 'Maagiline' },
  { value: 'humorous', label: 'Humoorikas' },
  { value: 'adventurous', label: 'Seikluslik' },
  { value: 'heartwarming', label: 'Südamlik' },
]

export const LENGTH_OPTIONS: Options<Length> = [
  { value: 'short', label: 'Lühike' },
  { value: 'medium', label: 'Keskmine' },
  { value: 'long', label: 'Pikk' },
]

export const DIFFICULTY_OPTIONS: Options<Difficulty> = [
  { value: 'easier', label: 'Lihtsam' },
  { value: 'auto', label: 'Eakohane' },
  { value: 'harder', label: 'Keerulisem' },
]

export const SETTING_OPTIONS: Options<Setting> = [
  { value: 'indoor', label: 'Toas' },
  { value: 'outdoor', label: 'Õues' },
]

export const CALENDAR_SETTING_OPTIONS: Options<CalendarSetting> = [
  { value: 'both', label: 'Toas ja õues' },
  { value: 'indoor', label: 'Ainult toas' },
  { value: 'outdoor', label: 'Ainult õues' },
]

export const GENRE_OPTIONS: Options<StoryGenre> = (Object.keys(GENRE_LABELS) as StoryGenre[]).map((value) => ({
  value,
  label: GENRE_LABELS[value],
}))

export const THEME_OPTIONS: Options<EducationalTheme> = (Object.keys(THEME_LABELS) as EducationalTheme[]).map(
  (value) => ({ value, label: THEME_LABELS[value] }),
)

export const PUZZLE_KIND_OPTIONS: Options<PuzzleKind> = [
  { value: 'mixed', label: 'Segamini' },
  { value: 'cipher', label: 'Salakirjad' },
  { value: 'riddle', label: 'Mõistatused' },
  { value: 'anagram', label: 'Segasõnad' },
  { value: 'math', label: 'Arvutamine' },
  { value: 'sequence', label: 'Mustrid ja jadad' },
]

export const CERTIFICATE_FORMAT_OPTIONS: Options<CertificateFormat> = [
  { value: 'diploma', label: 'Diplom' },
  { value: 'greeting', label: 'Õnnitluskaart' },
]

export const CERTIFICATE_STYLE_OPTIONS: Options<CertificateStyle> = [
  { value: 'magical', label: 'Maagiline' },
  { value: 'classic', label: 'Klassikaline' },
  { value: 'playful', label: 'Mänguline' },
]
