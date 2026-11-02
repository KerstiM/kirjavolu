import type { MascotMood } from '../../components/brand/mascot'
import type { ChildProfile } from '../../domain/models'
import { interestTexts } from '../../data/topics'
import { joinList } from '../../domain/text/estonian'
import type { WizardState, WizardStepId } from './useWizard'

export interface MascotLine {
  mood: MascotMood
  text: string
  /** Shown bold after the text, e.g. the child's favourite topic. */
  emphasis?: string
}

/** What the mascot says above the wizard, from the choices made so far. */
export function mascotLine(
  step: WizardStepId,
  state: Pick<WizardState, 'contentType' | 'occasionId' | 'childIds'>,
  children: ChildProfile[],
  busy = false,
): MascotLine {
  if (busy) return { mood: 'think', text: 'Kirjutan… pliiats lausa suitseb!' }

  if (step === 'what') {
    if (!state.contentType && !state.occasionId) return { mood: 'wave', text: 'Tere! Mina viin sinu kirjad kohale. Mida me täna meisterdame?' }
    if (!state.occasionId) return { mood: 'happy', text: 'Hea valik! Ja mis puhul see on?' }
    return { mood: 'happy', text: 'Tore! Vali veel, mida meisterdame.' }
  }

  if (children.length === 0) return { mood: 'wave', text: 'Kellele me kirjutame? Lisa laps – nimest ja vanusest piisab.' }
  const picked = children.filter((child) => state.childIds.includes(child.id))
  if (picked.length === 0) return { mood: 'think', text: 'Kellele me seekord kirjutame?' }
  if (picked.length > 1) {
    const names = joinList(picked.map((child) => child.name))
    const cheer = picked.length === 2 ? 'Topeltrõõm!' : 'Terve kamp!'
    return { mood: 'surprised', text: `${names}? ${cheer} Teen neile ühise seikluse.` }
  }
  const child = picked[0]!
  const favourite = interestTexts(child)[0]
  return favourite
    ? { mood: 'happy', text: `${child.name}? Tean küll, mis talle meeldib:`, emphasis: `${favourite}!` }
    : { mood: 'happy', text: `${child.name}! Teen talle midagi täitsa erilist.` }
}
