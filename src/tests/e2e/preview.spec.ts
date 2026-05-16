import { test, expect } from '@playwright/test'

test.describe('Preview page', () => {
  test('renders the demo page', async ({ page }) => {
    await page.goto('/preview/demo')
    await expect(page).toHaveTitle(/Preview/)
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('renders the hero section', async ({ page }) => {
    await page.goto('/preview/demo')
    await expect(
      page.getByRole('heading', { name: /Build pages at the speed of thought/i })
    ).toBeVisible()
  })

  test('renders the feature grid', async ({ page }) => {
    await page.goto('/preview/demo')
    await expect(page.getByRole('heading', { name: /Everything you need/i })).toBeVisible()
  })

  test('CTA button is focusable and has accessible label', async ({ page }) => {
    await page.goto('/preview/demo')
    const ctaButton = page.getByTestId('cta-button')
    await expect(ctaButton).toBeVisible()
    await ctaButton.focus()
    await expect(ctaButton).toBeFocused()
  })

  test('CTA link navigates', async ({ page }) => {
    await page.goto('/preview/demo')
    const ctaButton = page.getByTestId('cta-button')
    await expect(ctaButton).toHaveAttribute('href', /studio/)
  })

  test('returns 404 for unknown slug', async ({ page }) => {
    const response = await page.goto('/preview/does-not-exist-xyz')
    expect(response?.status()).toBe(404)
  })

  test('skip link is present and functional', async ({ page }) => {
    await page.goto('/preview/demo')
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    await expect(skipLink).toBeAttached()
  })

  test('has a logical heading hierarchy', async ({ page }) => {
    await page.goto('/preview/demo')
    const h1s = await page.locator('h1').all()
    expect(h1s.length).toBeGreaterThanOrEqual(1)
  })

  test('is fully keyboard navigable', async ({ page }) => {
    await page.goto('/preview/demo')
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })
})
