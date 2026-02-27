import { test, expect } from '@playwright/test'

// Helper: create a task via API directly to avoid UI flakiness in setup
async function apiCreateTask(request, title, priority = 'med') {
  const res = await request.post('http://localhost:8000/tasks', {
    data: { title, priority },
  })
  return res.json()
}

// Helper: clear all tasks via API before each test
async function clearTasks(request) {
  const incomplete = await (await request.get('http://localhost:8000/tasks')).json()
  const completed = await (await request.get('http://localhost:8000/tasks/completed')).json()
  for (const t of [...incomplete, ...completed]) {
    await request.delete(`http://localhost:8000/tasks/${t.id}`)
  }
}

test.beforeEach(async ({ request }) => {
  await clearTasks(request)
})

test('create a task and verify it appears in the list', async ({ page }) => {
  await page.goto('/')
  await page.click('text=+ Add Task')
  await page.fill('input[name="title"]', 'Buy milk')
  await page.selectOption('select[name="priority"]', 'high')
  await page.click('text=Add Task')

  await expect(page.locator('text=Buy milk')).toBeVisible()
  await expect(page.locator('.bg-red-100')).toBeVisible() // high priority badge
})

test('reorder tasks via drag-and-drop and verify order persists after reload', async ({ page, request }) => {
  await apiCreateTask(request, 'Task Alpha')
  await apiCreateTask(request, 'Task Beta')
  await apiCreateTask(request, 'Task Gamma')

  await page.goto('/')
  // Verify initial order
  const items = page.locator('.bg-white.rounded-lg.border')
  await expect(items.first()).toContainText('Task Alpha')

  // Drag Task Gamma (3rd) to the top
  const source = items.nth(2)
  const target = items.nth(0)
  await source.dragTo(target)

  // Reload and verify order persisted
  await page.reload()
  const reloaded = page.locator('.bg-white.rounded-lg.border')
  // After drag, Gamma should be near the top (positions updated via API)
  const firstTitle = await reloaded.first().textContent()
  expect(firstTitle).toContain('Task Gamma')
})

test('Focus Mode: complete a task and next batch loads', async ({ page, request }) => {
  for (let i = 1; i <= 4; i++) {
    await apiCreateTask(request, `Focus Task ${i}`)
  }

  await page.goto('/')
  await page.click('text=Focus Mode')

  // Should show top 3 tasks
  await expect(page.locator('text=Focus Task 1')).toBeVisible()
  await expect(page.locator('text=Focus Task 2')).toBeVisible()
  await expect(page.locator('text=Focus Task 3')).toBeVisible()
  await expect(page.locator('text=Focus Task 4')).not.toBeVisible()

  // Complete first task
  await page.locator('text=Focus Task 1').locator('..').locator('..').locator('button:has-text("Done")').click()

  // Task 4 should now appear
  await expect(page.locator('text=Focus Task 4')).toBeVisible()
  await expect(page.locator('text=Focus Task 1')).not.toBeVisible()
})

test('Focus Mode: defer a task and it moves to end', async ({ page, request }) => {
  for (let i = 1; i <= 4; i++) {
    await apiCreateTask(request, `Defer Task ${i}`)
  }

  await page.goto('/')
  await page.click('text=Focus Mode')

  // Defer first task
  await page.locator('text=Defer Task 1').locator('..').locator('..').locator('button:has-text("Defer")').click()

  // Task 4 should now be visible (deferred task moved to end, task 4 enters batch)
  await expect(page.locator('text=Defer Task 4')).toBeVisible()
  // Task 1 should still exist but at the end — not in the top 3
  await expect(page.locator('text=Defer Task 2')).toBeVisible()
  await expect(page.locator('text=Defer Task 3')).toBeVisible()
})

test('all done state shows when no tasks remain', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Focus Mode')
  await expect(page.locator('text=All done!')).toBeVisible()
})
