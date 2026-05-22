import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Clear localStorage so each test starts from scratch
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('shows the login form when not authenticated', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('TaskMaster')).toBeVisible()
  await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible()
})

test('pre-fills the demo credentials', async ({ page }) => {
  await page.goto('/')
  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')
  await expect(emailInput).toHaveValue('demo@taskmaster.local')
  await expect(passwordInput).toHaveValue('password123')
})

test('logs in with valid credentials and shows workspace', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^login$/i }).click()
  await expect(page.locator('h1:text("TASKMASTER")')).toBeVisible({ timeout: 10000 })
})

test('shows an error for invalid credentials', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="email"]', 'wrong@test.com')
  await page.fill('input[type="password"]', 'badpassword')
  await page.getByRole('button', { name: /^login$/i }).click()
  await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 })
})

test('shows validation errors for empty form submit', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="email"]', '')
  await page.fill('input[type="password"]', '')
  await page.getByRole('button', { name: /^login$/i }).click()
  await expect(page.getByText(/valid email/i)).toBeVisible()
})

test('one-click demo credential fill works', async ({ page }) => {
  await page.goto('/')
  // Click the second demo account "Design Reviewer"
  await page.getByRole('button', { name: /design reviewer/i }).click()
  await expect(page.locator('input[type="email"]')).toHaveValue('designer@taskmaster.local')
})

test('logout returns to the login form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^login$/i }).click()
  await page.waitForSelector('h1:text("TASKMASTER")', { timeout: 10000 })
  await page.waitForTimeout(1200)

  await page.getByRole('button', { name: /logout/i }).click()
  await expect(page.getByText('TaskMaster')).toBeVisible({ timeout: 5000 })
})

test('session is restored after page reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^login$/i }).click()
  await page.waitForSelector('h1:text("TASKMASTER")', { timeout: 10000 })
  await page.waitForTimeout(1200)

  await page.reload()
  await expect(page.locator('h1:text("TASKMASTER")')).toBeVisible({ timeout: 10000 })
})
