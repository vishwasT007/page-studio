import type { Page, ChangeType, DiffResult } from '@/types'

// Compares two page snapshots and returns the semantic change type.
// Rules (in descending severity):
//   MAJOR — section removed, section type changed
//   MINOR — section added
//   PATCH — prop values changed, title changed
//   NONE  — identical
export function comparePages(previous: Page, next: Page): DiffResult {
  const changes: string[] = []
  let changeType: ChangeType = 'none'

  const prevMap = new Map(previous.sections.map((s) => [s.id, s]))
  const nextMap = new Map(next.sections.map((s) => [s.id, s]))

  // Removed sections → MAJOR
  for (const [id, section] of prevMap) {
    if (!nextMap.has(id)) {
      changes.push(`Removed ${section.type} section (${id})`)
      changeType = 'major'
    }
  }

  // Type changes on existing sections → MAJOR
  for (const [id, next_] of nextMap) {
    const prev = prevMap.get(id)
    if (prev && prev.type !== next_.type) {
      changes.push(`Changed section type ${prev.type} → ${next_.type} (${id})`)
      changeType = 'major'
    }
  }

  // Added sections → MINOR (if not already MAJOR)
  for (const [id, section] of nextMap) {
    if (!prevMap.has(id)) {
      changes.push(`Added ${section.type} section (${id})`)
      if (changeType !== 'major') changeType = 'minor'
    }
  }

  // Prop changes on unchanged sections → PATCH (if not already higher)
  for (const [id, next_] of nextMap) {
    const prev = prevMap.get(id)
    if (prev && prev.type === next_.type) {
      if (JSON.stringify(prev.props) !== JSON.stringify(next_.props)) {
        changes.push(`Updated props in ${next_.type} section (${id})`)
        if (changeType === 'none') changeType = 'patch'
      }
    }
  }

  // Title change → PATCH
  if (previous.title !== next.title) {
    changes.push(`Updated page title: "${previous.title}" → "${next.title}"`)
    if (changeType === 'none') changeType = 'patch'
  }

  return { changeType, changes }
}
