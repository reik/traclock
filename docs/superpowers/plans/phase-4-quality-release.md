# Phase 4 — Quality & Release

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Deliverable:** Tested, deployable project pushed to GitHub.

**Prerequisite:** Phase 3 complete.

---

## Task 10: Build Verification & Manual Smoke Test

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: no errors or warnings.

- [ ] **Step 2: Manually verify the golden path**

```bash
npm run dev
```

Open `http://localhost:5173` and verify:

1. Home page loads with "No lists yet" message
2. "+ New List" → enter name → "Create" → list card appears
3. Empty name → "List name is required" error shown
4. Click list card → navigates to detail page in View mode
5. Click "Edit" → EditMode shown with "Add Item" form
6. Add two items with descriptions and durations → items appear with ▲▼
7. Click ▲ on second item → items swap
8. Click item "Edit" → inline form with current values → change → "Save" → updated
9. Click "Delete" on item → item removed
10. Click "Done" → switches back to View mode
11. Click "Start" → first item highlights in blue, countdown shows (e.g. `00:30`)
12. Click "Go Next" → moves to second item immediately
13. Let timer count down to 10 → item border turns orange and pulses
14. Let timer reach 0 → auto-advances to next item
15. After last item expires → "All done!" banner appears, "Start" button shows "Restart"
16. Clicking "Restart" restarts from first item

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify build and complete traclock app"
git push
```

---

## Task 11: E2E Tests (Playwright)

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/lists.spec.ts`
- Create: `e2e/edit-mode.spec.ts`
- Create: `e2e/timer.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 3: Run Playwright to confirm zero tests exist**

```bash
npx playwright test
```

Expected: "No tests found" or 0 passed.

- [ ] **Step 4: Create `e2e/lists.spec.ts`**

```ts
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
```

- [ ] **Step 5: Create `e2e/edit-mode.spec.ts`**

```ts
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
  await page.locator('input[type="text"]').fill('Updated task')
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
```

- [ ] **Step 6: Create `e2e/timer.spec.ts`**

```ts
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
  await page.clock.tick(5000)

  const firstItem = page.locator('[data-testid^="item-"]').first()
  await expect(firstItem).toHaveClass(/border-orange-500/)
  await expect(firstItem).toHaveClass(/animate-pulse/)
})

test('auto-advances to second item when first timer expires', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.tick(15000)

  const items = page.locator('[data-testid^="item-"]')
  await expect(items.nth(1)).toHaveClass(/border-blue-500/)
  await expect(page.getByText('00:10')).toBeVisible()
})

test('shows All done banner after last item timer expires', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.tick(15000)
  await page.clock.tick(10000)

  await expect(page.getByText(/all done/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /restart/i })).toBeVisible()
})

test('Restart resets timer back to first item', async ({ page }) => {
  await setupListWithItems(page)
  await page.clock.install()

  await page.getByRole('button', { name: /^start$/i }).click()
  await page.clock.tick(15000)
  await page.clock.tick(10000)
  await page.getByRole('button', { name: /restart/i }).click()

  const firstItem = page.locator('[data-testid^="item-"]').first()
  await expect(firstItem).toHaveClass(/border-blue-500/)
  await expect(page.getByText('00:15')).toBeVisible()
})
```

- [ ] **Step 7: Run E2E tests**

```bash
npx playwright test
```

Expected: 18 tests PASS across 3 spec files.

- [ ] **Step 8: Add Playwright scripts to `package.json`**

In `package.json`, add to the `"scripts"` section:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 9: Commit**

```bash
git add e2e playwright.config.ts package.json
git commit -m "test: add Playwright E2E specs for lists, edit mode, and timer"
git push
```

---

## Spec Coverage Checklist

| Requirement | Unit/Integration | E2E |
|---|---|---|
| Add / delete lists | Task 5 | `lists.spec.ts` |
| Each list item has description + duration (min + sec input) | Tasks 2, 6 | `edit-mode.spec.ts` |
| Delete, update, add, swap items | Task 6 | `edit-mode.spec.ts` |
| Clicking list navigates to view mode | Task 9 | `lists.spec.ts` |
| Edit button to enter edit mode | Task 9 | `edit-mode.spec.ts` |
| Start button highlights first item | Tasks 7, 8 | `timer.spec.ts` |
| Timer auto-advances through items | Task 7 | `timer.spec.ts` |
| "Go Next" button to skip ahead manually | Tasks 7, 8 | `timer.spec.ts` |
| Warning sound / orange highlight at last 10 sec | Tasks 2, 7 | `timer.spec.ts` |
| "Go Next" sound when item time expires | Tasks 2, 7 | — (audio not testable in headless) |
| Completion sound + "All done" banner | Tasks 2, 7 | `timer.spec.ts` |
