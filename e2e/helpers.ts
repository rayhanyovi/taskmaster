import type { Page } from '@playwright/test'

export async function login(page: Page, email = 'demo@taskmaster.local', password = 'password123') {
  await page.goto('/')

  // Fill credentials (form is pre-filled with demo account, but set explicitly for clarity)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.getByRole('button', { name: /^login$/i }).click()

  // Wait for the workspace header to appear (confirms login succeeded)
  await page.waitForSelector('h1:text("TASKMASTER")', { timeout: 10000 })

  // Wait for task loading to complete (skeleton disappears, content appears)
  await page.waitForTimeout(1200)
}

export async function waitForTaskList(page: Page) {
  // Wait for either tasks or empty state — both mean loading is done
  await page.waitForSelector(
    '[class*="space-y-3"], [class*="grid gap-3"], h2:text("No tasks yet"), h2:text("No matching tasks")',
    { timeout: 10000 },
  )
}

export async function createTask(page: Page, title: string, description = '') {
  await page.getByRole('button', { name: /create task/i }).first().click()
  await page.waitForSelector('input#task-title', { timeout: 5000 })
  await page.fill('input#task-title', title)
  if (description) {
    await page.fill('textarea#task-description', description)
  }
  await page.getByRole('button', { name: /^create task$/i }).click()
  // Wait for modal to close and toast to appear
  await page.waitForTimeout(800)
}
