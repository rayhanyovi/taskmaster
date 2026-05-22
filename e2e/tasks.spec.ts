import { test, expect } from '@playwright/test'
import { login, createTask } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await login(page)
})

test('shows the seeded task list after login', async ({ page }) => {
  // At least one seeded task should be visible
  await expect(page.getByText('Review onboarding copy')).toBeVisible({ timeout: 5000 })
})

test('can create a new task', async ({ page }) => {
  await createTask(page, 'My brand new task', 'Some description here')
  await expect(page.getByText('My brand new task')).toBeVisible({ timeout: 5000 })
})

test('shows validation error when creating a task without a title', async ({ page }) => {
  await page.getByRole('button', { name: /create task/i }).first().click()
  await page.waitForSelector('input#task-title', { timeout: 5000 })
  // Leave title empty and submit
  await page.getByRole('button', { name: /^create task$/i }).click()
  await expect(page.getByText(/title is required/i)).toBeVisible()
})

test('can open task details and edit the title', async ({ page }) => {
  // Click on a seeded task card to open details
  await page.getByText('Review onboarding copy').click()
  await page.waitForSelector('input#task-title', { timeout: 5000 })

  await page.fill('input#task-title', 'Updated title')
  await page.getByRole('button', { name: /update task/i }).click()

  await expect(page.getByText('Updated title')).toBeVisible({ timeout: 5000 })
})

test('can delete a task via the form modal delete button', async ({ page }) => {
  // Open details of the first seeded task
  await page.getByText('Review onboarding copy').click()
  await page.waitForSelector('input#task-title', { timeout: 5000 })

  // Click the delete button inside the form
  await page.getByRole('button', { name: /^delete$/i }).click()

  // Confirm the delete dialog
  await page.getByRole('button', { name: /^delete$/i }).last().click()

  await expect(page.getByText('Review onboarding copy')).not.toBeVisible({ timeout: 5000 })
})

test('can delete a task from the dropdown menu', async ({ page }) => {
  // Wait for tasks then click more actions on a task
  await page.waitForSelector('[aria-label^="More actions"]', { timeout: 5000 })
  await page.locator('[aria-label^="More actions"]').first().click()

  await page.getByRole('menuitem', { name: /delete/i }).click()

  // Confirm the dialog
  await page.getByRole('button', { name: /^delete$/i }).last().click()
  await page.waitForTimeout(800)

  // The seeded tasks should have one fewer entry now
  const taskCards = page.locator('[aria-label^="More actions"]')
  await expect(taskCards).toHaveCount(3, { timeout: 5000 })
})

test('can toggle a task from in_progress to completed via the status button', async ({ page }) => {
  // Find the "Prepare reviewer walkthrough" seeded task which is in_progress
  const task = page.getByText('Prepare reviewer walkthrough')
  await expect(task).toBeVisible()

  // Click the green status button (complete)
  const card = task.locator('xpath=ancestor::*[contains(@class,"CardContent")]/..')
  const statusBtn = card.getByRole('button', { name: /mark.*complete/i })
  await statusBtn.click()

  // The task should now show a green checked circle (completed state)
  await expect(card.getByRole('button', { name: /mark.*in progress/i })).toBeVisible({ timeout: 3000 })
})

test('can switch between list and kanban views', async ({ page }) => {
  // Find the view toggle buttons (they show in TaskToolbar)
  const listBtn = page.getByRole('button', { name: /list/i })
  const kanbanBtn = page.getByRole('button', { name: /kanban/i })

  await listBtn.click()
  // In list view the kanban columns should not be visible
  await expect(page.getByRole('heading', { name: 'To do' })).not.toBeVisible()

  await kanbanBtn.click()
  // In kanban view the columns should appear
  await expect(page.getByRole('heading', { name: 'To do' })).toBeVisible({ timeout: 3000 })
})
