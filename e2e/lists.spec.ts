import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('shows empty state when no lists exist', async ({ page }) => {
  await expect(page.getByText(/no lists yet/i)).toBeVisible()
})

test('creates a new list and shows it on the home page', async ({ page }) => {
  await page.getByRole('button', { name: /new list/i }).click()
  await page.getByPlaceholder(/list name/i).fill('Morning Routine')
  await page.getByRole('button', { name: /create/i }).click()

  await expect(page.getByText('Morning Routine')).toBeVisible()
  await expect(page.getByText('0 items')).toBeVisible()
})

test('shows validation error when creating list with empty name', async ({ page }) => {
  await page.getByRole('button', { name: /new list/i }).click()
  await page.getByRole('button', { name: /create/i }).click()

  await expect(page.getByText(/list name is required/i)).toBeVisible()
})

test('deletes a list', async ({ page }) => {
  await page.getByRole('button', { name: /new list/i }).click()
  await page.getByPlaceholder(/list name/i).fill('Temp List')
  await page.getByRole('button', { name: /create/i }).click()
  await expect(page.getByText('Temp List')).toBeVisible()

  await page.getByRole('button', { name: /delete/i }).click()

  await expect(page.getByText('Temp List')).not.toBeVisible()
  await expect(page.getByText(/no lists yet/i)).toBeVisible()
})

test('navigates to list detail page when list is clicked', async ({ page }) => {
  await page.getByRole('button', { name: /new list/i }).click()
  await page.getByPlaceholder(/list name/i).fill('Work Tasks')
  await page.getByRole('button', { name: /create/i }).click()

  await page.getByText('Work Tasks').click()

  await expect(page).toHaveURL(/\/list\//)
  await expect(page.getByRole('heading', { name: 'Work Tasks' })).toBeVisible()
})
