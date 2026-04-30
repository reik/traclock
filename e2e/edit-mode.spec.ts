import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: /new list/i }).click()
  await page.getByPlaceholder(/list name/i).fill('Test List')
  await page.getByRole('button', { name: /create/i }).click()
  await page.getByText('Test List').click()

  await page.getByRole('button', { name: /^edit$/i }).click()
})

test('adds a new item to the list', async ({ page }) => {
  await page.getByPlaceholder(/description/i).fill('Do pushups')
  await page.locator('input[type="number"]').first().fill('1')
  await page.locator('input[type="number"]').nth(1).fill('30')
  await page.getByRole('button', { name: /^add$/i }).click()

  await expect(page.getByText('Do pushups')).toBeVisible()
  await expect(page.getByText('01:30')).toBeVisible()
})

test('shows validation error when adding item with empty description', async ({ page }) => {
  await page.getByRole('button', { name: /^add$/i }).click()

  await expect(page.getByText(/description is required/i)).toBeVisible()
})

test('deletes an item', async ({ page }) => {
  await page.getByPlaceholder(/description/i).fill('Task to delete')
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByText('Task to delete')).toBeVisible()

  await page.getByRole('button', { name: /delete/i }).click()

  await expect(page.getByText('Task to delete')).not.toBeVisible()
})

test('edits an existing item', async ({ page }) => {
  await page.getByPlaceholder(/description/i).fill('Original task')
  await page.getByRole('button', { name: /^add$/i }).click()

  await page.getByRole('button', { name: /^edit$/i }).click()
  await page.locator('input[type="text"]').last().fill('Updated task')
  await page.getByRole('button', { name: /save/i }).click()

  await expect(page.getByText('Updated task')).toBeVisible()
  await expect(page.getByText('Original task')).not.toBeVisible()
})

test('reorders items with up/down buttons', async ({ page }) => {
  await page.getByPlaceholder(/description/i).fill('First')
  await page.getByRole('button', { name: /^add$/i }).click()
  await page.getByPlaceholder(/description/i).fill('Second')
  await page.getByRole('button', { name: /^add$/i }).click()

  const items = page.locator('ul > li')
  await expect(items.first()).toContainText('First')
  await expect(items.nth(1)).toContainText('Second')

  await page.getByRole('button', { name: /move up/i }).nth(1).click()

  await expect(items.first()).toContainText('Second')
  await expect(items.nth(1)).toContainText('First')
})

test('switches back to view mode when Done is clicked', async ({ page }) => {
  await page.getByRole('button', { name: /done/i }).click()

  await expect(page.getByRole('button', { name: /^start$/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /^add$/i })).not.toBeVisible()
})
