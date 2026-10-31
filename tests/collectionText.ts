import type { TypeResult } from '@/domain/generators/context'

/** Readable plain-text rendering of a generated collection, for golden files and review. */
export function formatCollection(result: TypeResult): string {
  const lines: string[] = [`# ${result.title}`, '', `_${result.subtitle}_`, '']
  const groups = new Map<string, typeof result.items>()
  for (const item of result.items) {
    const key = item.forChild ?? 'Kirjad'
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  for (const [name, items] of groups) {
    lines.push(`## ${name}`, '')
    for (const item of items) {
      lines.push(`### ${item.label}`, '', `**${item.heading}**`, '')
      lines.push(item.body, '')
      if (item.signature) lines.push(`_${item.signature.replace('\n', ' · ')}_`, '')
      if (item.answer) lines.push(`> Vastus: ${item.answer}`, '')
      if (item.parentNote) lines.push(`> ${item.parentNote}`, '')
    }
  }
  lines.push('## Lapsevanemale', '')
  for (const instruction of result.instructions) {
    lines.push(`### ${instruction.title}`, '', ...instruction.steps.map((step) => `- ${step}`), '')
  }
  return lines.join('\n')
}
