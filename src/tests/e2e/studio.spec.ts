import { test, expect } from '@playwright/test'

test.describe('Studio — RBAC', () => {
  test('viewer is redirected away from studio', async ({ page }) => {
    // Sign in as viewer
    await page.request.post('/api/auth/login', { data: { role: 'viewer' } })
    await page.goto('/studio/demo')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('editor can access studio', async ({ page }) => {
    await page.request.post('/api/auth/login', { data: { role: 'editor' } })
    await page.goto('/studio/demo')
    await expect(page.getByRole('region', { name: /sidebar/i })).toBeVisible()
  })
})

test.describe('Studio — editor flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/auth/login', { data: { role: 'publisher' } })
    await page.goto('/studio/demo')
  })

  test('shows the sidebar with sections', async ({ page }) => {
    await expect(page.getByRole('list', { name: /page sections/i })).toBeVisible()
  })

  test('can add a new section', async ({ page }) => {
    const initialCount = await page.locator('[aria-label="Page sections"] li').count()
    await page.getByRole('button', { name: /add hero section/i }).click()
    const newCount = await page.locator('[aria-label="Page sections"] li').count()
    expect(newCount).toBe(initialCount + 1)
  })

  test('can select a section and see the editor panel', async ({ page }) => {
    await page.getByRole('button', { name: /edit hero section/i }).first().click()
    await expect(
      page.getByRole('region', { name: /section properties editor/i })
    ).toBeVisible()
  })

  test('editing hero heading updates the preview', async ({ page }) => {
    await page.getByRole('button', { name: /edit hero section/i }).first().click()
    const headingInput = page.getByLabel('Heading').first()
    await headingInput.clear()
    await headingInput.fill('My Updated Heading')

    // The preview canvas should reflect the change
    await expect(page.getByRole('main')).toContainText('My Updated Heading')
  })

  test('publish button is visible for publisher', async ({ page }) => {
    await expect(page.getByRole('button', { name: /publish page/i })).toBeVisible()
  })

  test('publish button is absent for editor', async ({ page, request }) => {
    await request.post('/api/auth/login', { data: { role: 'editor' } })
    await page.goto('/studio/demo')
    await expect(page.getByRole('button', { name: /publish/i })).toHaveCount(0)
  })

  test('toolbar is keyboard accessible', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: /studio toolbar/i })
    await expect(toolbar).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
  })
})
