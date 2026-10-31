import type { GeneratedContent } from '../domain/models'

/** Plain-text export: child-facing items first, parent material clearly separated. */
export function contentToPlainText(content: GeneratedContent, includeParent = true): string {
  const lines: string[] = [content.title, content.subtitle, '']
  for (const item of content.items) {
    lines.push('────────────────────────')
    if (item.label) lines.push(item.childId && item.forChild ? `${item.forChild} · ${item.label}` : item.label)
    if (item.heading) lines.push(item.heading.toLocaleUpperCase('et-EE'))
    lines.push('', item.body)
    if (item.signature) lines.push('', item.signature)
    lines.push('')
  }
  if (includeParent) {
    lines.push('════════════════════════', 'LAPSEVANEMALE (ära anna lapsele)', '')
    for (const instruction of content.instructions) {
      lines.push(instruction.title)
      instruction.steps.forEach((step, index) => lines.push(`  ${index + 1}. ${step}`))
      lines.push('')
    }
    const solved = content.items.filter((item) => item.answer || item.parentNote)
    if (solved.length > 0) {
      lines.push('Vastused ja märkused')
      for (const item of solved) {
        const parts = [item.answer ? `vastus: ${item.answer}` : '', item.parentNote ?? ''].filter(Boolean)
        lines.push(`  ${item.label}: ${parts.join(' · ')}`)
      }
    }
  }
  return lines.join('\n').trimEnd() + '\n'
}

export function fileNameFor(title: string): string {
  const slug = title
    .toLocaleLowerCase('et-EE')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'kirjavolu'}.txt`
}

export function downloadText(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
