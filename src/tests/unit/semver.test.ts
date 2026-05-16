import { describe, it, expect } from 'vitest'
import { comparePages } from '@/lib/semver/diff'
import { bumpVersion, INITIAL_VERSION } from '@/lib/semver/version'
import type { Page } from '@/types'

const basePage: Page = {
  pageId: 'p1',
  slug: 'home',
  title: 'Home',
  sections: [
    { id: 's1', type: 'hero', props: { heading: 'Hello' } },
    { id: 's2', type: 'cta', props: { heading: 'Start', label: 'Go', url: '#' } },
  ],
}

function clone(page: Page): Page {
  return JSON.parse(JSON.stringify(page))
}

describe('comparePages', () => {
  it('returns "none" for identical pages', () => {
    const result = comparePages(basePage, clone(basePage))
    expect(result.changeType).toBe('none')
    expect(result.changes).toHaveLength(0)
  })

  it('returns "patch" for a text/prop change', () => {
    const next = clone(basePage)
    next.sections[0].props.heading = 'Hello World'
    const result = comparePages(basePage, next)
    expect(result.changeType).toBe('patch')
    expect(result.changes.some((c) => c.includes('hero'))).toBe(true)
  })

  it('returns "patch" for a title change', () => {
    const next = clone(basePage)
    next.title = 'New Title'
    const result = comparePages(basePage, next)
    expect(result.changeType).toBe('patch')
  })

  it('returns "minor" when a section is added', () => {
    const next = clone(basePage)
    next.sections.push({ id: 's3', type: 'testimonial', props: { quote: 'Wow', author: 'Bob' } })
    const result = comparePages(basePage, next)
    expect(result.changeType).toBe('minor')
    expect(result.changes.some((c) => c.includes('Added'))).toBe(true)
  })

  it('returns "major" when a section is removed', () => {
    const next = clone(basePage)
    next.sections = next.sections.slice(0, 1)
    const result = comparePages(basePage, next)
    expect(result.changeType).toBe('major')
    expect(result.changes.some((c) => c.includes('Removed'))).toBe(true)
  })

  it('returns "major" when a section type changes', () => {
    const next = clone(basePage)
    next.sections[0].type = 'cta' as never
    const result = comparePages(basePage, next)
    expect(result.changeType).toBe('major')
  })

  it('major beats minor — simultaneous add and remove', () => {
    const next = clone(basePage)
    next.sections = next.sections.slice(0, 1) // remove one
    next.sections.push({ id: 's3', type: 'testimonial', props: { quote: 'Hi', author: 'Bob' } })
    const result = comparePages(basePage, next)
    expect(result.changeType).toBe('major')
  })
})

describe('bumpVersion', () => {
  it('starts at the initial version', () => {
    expect(INITIAL_VERSION).toBe('1.0.0')
  })

  it('bumps patch correctly', () => {
    expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4')
  })

  it('bumps minor and resets patch', () => {
    expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0')
  })

  it('bumps major and resets minor + patch', () => {
    expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0')
  })

  it('handles version 0.x correctly', () => {
    expect(bumpVersion('0.1.0', 'minor')).toBe('0.2.0')
    expect(bumpVersion('0.9.9', 'major')).toBe('1.0.0')
  })
})
