import { test, expect } from '@playwright/test'
import { login, createTask } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await login(page)
})

test('All filter shows every task', async ({ page }) => {
  await page.getByRole('button', { name: /^All/i }).click()
  // All seeded tasks (4) should be visible
  await expect(page.locator('[aria-label^="More actions"]')).toHaveCount(4, { timeout: 5000 })
})

test('Completed filter shows only completed tasks', async ({ page }) => {
  await page.getByRole('button', { name: /^Completed/i }).click()
  await page.waitForTimeout(300)

  // Only the "Finalize interview submission checklist" is seeded as completed
  await expect(page.getByText('Finalize interview submission checklist')).toBeVisible()
  await expect(page.getByText('Review onboarding copy')).not.toBeVisible()
})

test('Pending filter shows only non-completed tasks', async ({ page }) => {
  await page.getByRole('button', { name: /^Pending/i }).click()
  await page.waitForTimeout(300)

  // All 3 non-completed seeded tasks should show
  await expect(page.getByText('Review onboarding copy')).toBeVisible()
  // Completed task should be hidden
  await expect(page.getByText('Finalize interview submission checklist')).not.toBeVisible()
})

test('search filters tasks by title', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i)
  await searchInput.fill('onboarding')
  await page.waitForTimeout(500) // debounce

  await expect(page.getByText('Review onboarding copy')).toBeVisible()
  await expect(page.getByText('Prepare reviewer walkthrough')).not.toBeVisible()
})

test('search filters tasks by description', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i)
  await searchInput.fill('polished example')
  await page.waitForTimeout(500)

  // "Prepare reviewer walkthrough" has "polished example flow" in description
  await expect(page.getByText('Prepare reviewer walkthrough')).toBeVisible()
  await expect(page.getByText('Review onboarding copy')).not.toBeVisible()
})

test('no matching tasks shows the empty state', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i)
  await searchInput.fill('xyzzy-no-match-1234')
  await page.waitForTimeout(500)

  await expect(page.getByText('No matching tasks')).toBeVisible()
})

test('combined search and filter works correctly', async ({ page }) => {
  // Filter to Pending and search for 'mock'
  await page.getByRole('button', { name: /^Pending/i }).click()
  const searchInput = page.getByPlaceholder(/search/i)
  await searchInput.fill('mock')
  await page.waitForTimeout(500)

  await expect(page.getByText('Document mock API assumptions')).toBeVisible()
  await expect(page.getByText('Finalize interview submission checklist')).not.toBeVisible()
})

test('filter tab shows correct counts', async ({ page }) => {
  // 4 seeded tasks: 3 pending (todo/in_progress), 1 completed
  await expect(page.getByRole('button', { name: /All \(4\)/ })).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('button', { name: /Pending \(3\)/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Completed \(1\)/ })).toBeVisible()
})

test('creating a task increments the filter counts', async ({ page }) => {
  await createTask(page, 'Extra pending task')

  await expect(page.getByRole('button', { name: /All \(5\)/ })).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('button', { name: /Pending \(4\)/ })).toBeVisible()
})
