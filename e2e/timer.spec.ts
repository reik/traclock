import { test, expect } from '@playwright/test'

async function setupListWithItems(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: /new list/i }).click()
  await page.getByPlaceholder(/list name/i).fill('Timer Test')
  await page.getByRole('button', { name: /create/i }).click()
  await page.getByText('Timer Test').click()
  await page.getByRole('button', { name: /^edit$/i }).click()

  await page.getByPlaceholder(/description/i).fill('Task One')
  await page.locator('input[type="number"]').first().fill('0')
  await page.locator('input[type="number"]').nth(1).fill('15')
  await page.getByRole('button', { name: /^add$/i }).click()

  await page.getByPlaceholder(/description/i).fill('Task Two')
  await page.locator('input[type="number"]').first().fill('0')
  await page.locator('input[type="number"]').nth(1).fill('10')
  await page.getByRole('button', { name: /^add$/i }).click()

  await page.getByRole('button', { name: /done/i }).click()
}

test('shows Start button and all items before timer begins', async ({ page }) => {
  await setupListWithItems(page)

  await expect(page.getByRole('button', { name: /^start$/i })).toBeVisible()
  await expect(page.getByText('Task One')).toBeVisible()
  await expect(page.getByText('Task Two')).toBeVisible()
  await expect(page.getByRole('button', { name: /go next/i })).not.toBeVisible()
})

test('highlights first item and shows Go Next button when Start is clicked', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()

  const firstItem = page.locator('[data-testid^="item-"]').first()
  await expect(firstItem).toHaveClass(/border-blue-500/)
  await expect(page.getByRole('button', { name: /go next/i })).toBeVisible()
  await expect(page.getByText('00:15')).toBeVisible()
})

test('Go Next advances to second item immediately', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.getByRole('button', { name: /go next/i }).click()

  const items = page.locator('[data-testid^="item-"]')
  await expect(items.nth(1)).toHaveClass(/border-blue-500/)
  await expect(page.getByText('00:10')).toBeVisible()
})

test('item turns orange during last 10 seconds', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.runFor(5000)

  const firstItem = page.locator('[data-testid^="item-"]').first()
  await expect(firstItem).toHaveClass(/border-orange-500/)
  await expect(firstItem).toHaveClass(/animate-pulse/)
})

test('auto-advances to second item when first timer expires', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.runFor(15000)

  const items = page.locator('[data-testid^="item-"]')
  await expect(items.nth(1)).toHaveClass(/border-blue-500/)
  await expect(page.getByText('00:10')).toBeVisible()
})

test('shows All done banner after last item timer expires', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.runFor(15000)
  await page.clock.runFor(10000)

  await expect(page.getByText(/all done/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /restart/i })).toBeVisible()
})

test('Restart resets timer back to first item', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.runFor(15000)
  await page.clock.runFor(10000)
  await page.getByRole('button', { name: /restart/i }).click()

  const firstItem = page.locator('[data-testid^="item-"]').first()
  await expect(firstItem).toHaveClass(/border-blue-500/)
  await expect(page.getByText('00:15')).toBeVisible()
})
