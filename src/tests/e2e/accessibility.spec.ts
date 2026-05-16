import { test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Collects all axe results so we can write a combined report at the end
const allResults: Record<string, unknown>[] = []

async function runAxeAndAssert(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()

  allResults.push({ page: label, results })

  const criticalViolations = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  )

  if (criticalViolations.length > 0) {
    const summary = criticalViolations
      .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
      .join('\n')
    throw new Error(`Accessibility violations on ${label}:\n${summary}`)
  }
}

test.afterAll(async () => {
  // Write the combined a11y report artefact
  await mkdir('test-results', { recursive: true })
  await writeFile(
    path.join('test-results', 'a11y-report.json'),
    JSON.stringify(allResults, null, 2),
    'utf-8'
  )
})

test.describe('Accessibility — preview page', () => {
  test('has no critical axe violations', async ({ page }) => {
    await page.goto('/preview/demo')
    await page.waitForLoadState('networkidle')
    await runAxeAndAssert(page, 'preview/demo')
  })
})

test.describe('Accessibility — home page', () => {
  test('has no critical axe violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await runAxeAndAssert(page, 'home')
  })
})

test.describe('Accessibility — auth page', () => {
  test('has no critical axe violations', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    await runAxeAndAssert(page, 'auth')
  })
})

test.describe('Accessibility — studio page (as publisher)', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as publisher so studio is accessible
    await page.request.post('/api/auth/login', {
      data: { role: 'publisher' },
    })
  })

  test('has no critical axe violations', async ({ page }) => {
    await page.goto('/studio/demo')
    await page.waitForLoadState('networkidle')
    await runAxeAndAssert(page, 'studio/demo')
  })
})
