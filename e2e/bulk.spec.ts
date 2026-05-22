import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  // Switch to list view for easier bulk selection testing
  await login(page)
  await page.getByRole('button', { name: /list/i }).click()
  await page.waitForTimeout(200)
})

async function longPressFirstTask(page: ReturnType<typeof test.info>['project'] extends infer P ? P : never) {
  // This overload is wrong; use the actual Page type instead
  return null
}

test('long-press on a task card enters selection mode', async ({ page }) => {
  // Simulate long-press by holding pointer down for >450ms on a task card
  const taskCard = page.locator('[aria-label^="More actions"]').first().locator('xpath=ancestor::div[contains(@class,"CardContent")]')

  const box = await taskCard.boundingBox()
  if (!box) throw new Error('Could not get task card bounding box')

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.waitForTimeout(550)
  await page.mouse.up()

  // Checkboxes should now be visible (selection mode)
  await expect(page.locator('input[type="checkbox"]').first()).toBeVisible({ timeout: 3000 })
})

test('select all visible selects all tasks', async ({ page }) => {
  // Enter selection mode via long-press
  const taskCard = page.locator('[aria-label^="More actions"]').first().locator('xpath=ancestor::div[contains(@class,"CardContent")]')
  const box = await taskCard.boundingBox()
  if (!box) throw new Error('Could not get task card bounding box')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(550)
  await page.mouse.up()

  await page.waitForSelector('input[type="checkbox"]', { timeout: 3000 })

  // Click "Select all visible" button in the BulkActionBar
  await page.getByRole('button', { name: /select all/i }).click()
  await page.waitForTimeout(200)

  const checkboxes = page.locator('input[type="checkbox"]')
  const count = await checkboxes.count()
  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).toBeChecked()
  }
})

test('bulk complete marks selected tasks as completed', async ({ page }) => {
  // Enter selection mode
  const taskCard = page.locator('[aria-label^="More actions"]').first().locator('xpath=ancestor::div[contains(@class,"CardContent")]')
  const box = await taskCard.boundingBox()
  if (!box) throw new Error('bounding box unavailable')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(550)
  await page.mouse.up()

  await page.waitForSelector('input[type="checkbox"]', { timeout: 3000 })

  // Select all visible
  await page.getByRole('button', { name: /select all/i }).click()
  await page.waitForTimeout(200)

  // Click bulk complete
  await page.getByRole('button', { name: /mark.*complete/i }).click()
  await page.waitForTimeout(1200)

  // Switch to Completed filter — should now have all tasks
  await page.getByRole('button', { name: /^Completed/i }).click()
  await page.waitForTimeout(300)
  await expect(page.locator('[aria-label^="More actions"]')).toHaveCount(4, { timeout: 5000 })
})

test('bulk delete removes selected tasks after confirmation', async ({ page }) => {
  // Enter selection mode
  const taskCard = page.locator('[aria-label^="More actions"]').first().locator('xpath=ancestor::div[contains(@class,"CardContent")]')
  const box = await taskCard.boundingBox()
  if (!box) throw new Error('bounding box unavailable')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(550)
  await page.mouse.up()

  await page.waitForSelector('input[type="checkbox"]', { timeout: 3000 })

  // Select first two tasks manually via checkboxes
  const checkboxes = page.locator('input[type="checkbox"]')
  await checkboxes.nth(0).check()
  await checkboxes.nth(1).check()

  // Click bulk delete
  await page.getByRole('button', { name: /delete selected/i }).click()

  // Confirm
  await page.getByRole('button', { name: /delete selected/i }).last().click()
  await page.waitForTimeout(1200)

  await expect(page.locator('[aria-label^="More actions"]')).toHaveCount(2, { timeout: 5000 })
})

test('clear selection exits selection mode', async ({ page }) => {
  // Enter selection mode
  const taskCard = page.locator('[aria-label^="More actions"]').first().locator('xpath=ancestor::div[contains(@class,"CardContent")]')
  const box = await taskCard.boundingBox()
  if (!box) throw new Error('bounding box unavailable')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(550)
  await page.mouse.up()

  await page.waitForSelector('input[type="checkbox"]', { timeout: 3000 })

  await page.getByRole('button', { name: /clear/i }).click()
  await page.waitForTimeout(200)

  // Checkboxes should be gone
  await expect(page.locator('input[type="checkbox"]').first()).not.toBeVisible()
})
