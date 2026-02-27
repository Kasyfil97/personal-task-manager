import { test, expect } from '@playwright/test'

async function clearTasks(request) {
  const incomplete = await (await request.get('http://localhost:8000/tasks')).json()
  const completed = await (await request.get('http://localhost:8000/tasks/completed')).json()
  for (const t of [...incomplete, ...completed]) {
    await request.delete(`http://localhost:8000/tasks/${t.id}`)
  }
}

async function apiCreateTask(request, title, priority = 'med') {
  const res = await request.post('http://localhost:8000/tasks', {
    data: { title, priority },
  })
  return res.json()
}

// Drag from one element to another using page.mouse (required for dnd-kit PointerSensor)
async function dragElement(page, source, target) {
  const srcBox = await source.boundingBox()
  const tgtBox = await target.boundingBox()
  const sx = srcBox.x + srcBox.width / 2
  const sy = srcBox.y + srcBox.height / 2
  const tx = tgtBox.x + tgtBox.width / 2
  const ty = tgtBox.y + tgtBox.height / 2

  await page.mouse.move(sx, sy)
  await page.mouse.down()
  // Move past the 5px activation threshold first
  await page.mouse.move(sx, sy - 10, { steps: 5 })
  // Then move to target with many steps for smooth simulation
  await page.mouse.move(tx, ty, { steps: 30 })
  await page.mouse.up()
  // Give the reorder API call time to complete
  await page.waitForTimeout(500)
}

test.beforeEach(async ({ request }) => {
  await clearTasks(request)
})

test('create a task and verify it appears in the list', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '+ Add Task' }).click()

  await page.fill('input[name="title"]', 'Buy milk')
  await page.selectOption('select[name="priority"]', 'high')
  // Target the form's submit button specifically
  await page.locator('button[type="submit"]').click()

  await expect(page.locator('text=Buy milk')).toBeVisible()
  // High priority badge (bg-red-100 class)
  await expect(page.locator('.bg-red-100').first()).toBeVisible()
})

test('reorder tasks via drag-and-drop and verify order persists after reload', async ({ page }) => {
  await page.goto('/')

  // Create 3 tasks via form so they appear in the UI immediately
  for (const title of ['Task Alpha', 'Task Beta', 'Task Gamma']) {
    await page.getByRole('button', { name: '+ Add Task' }).click()
    await page.fill('input[name="title"]', title)
    await page.locator('button[type="submit"]').click()
    await expect(page.locator(`text=${title}`)).toBeVisible()
  }

  // Verify initial order
  const cards = page.locator('.bg-white.rounded-lg.border')
  await expect(cards.first()).toContainText('Task Alpha')

  // Drag the 3rd item's handle to the position of the 1st item's handle
  const handles = page.locator('text=⠿')
  await dragElement(page, handles.nth(2), handles.nth(0))

  // Reload and verify Gamma is now first
  await page.reload()
  await expect(page.locator('.bg-white.rounded-lg.border').first()).toContainText('Task Gamma')
})

test('Focus Mode: complete a task and next batch loads', async ({ page, request }) => {
  for (let i = 1; i <= 4; i++) {
    await apiCreateTask(request, `Focus Task ${i}`)
  }

  await page.goto('/')
  await page.getByRole('button', { name: 'Focus Mode' }).click()

  // Top 3 visible, 4th not
  await expect(page.locator('text=Focus Task 1')).toBeVisible()
  await expect(page.locator('text=Focus Task 2')).toBeVisible()
  await expect(page.locator('text=Focus Task 3')).toBeVisible()
  await expect(page.locator('text=Focus Task 4')).not.toBeVisible()

  // Click Done on the first task card
  await page.locator('.bg-white.rounded-lg.border', { hasText: 'Focus Task 1' })
    .getByRole('button', { name: 'Done' }).click()

  // Task 4 should now appear, Task 1 gone
  await expect(page.locator('text=Focus Task 4')).toBeVisible()
  await expect(page.locator('text=Focus Task 1')).not.toBeVisible()
})

test('Focus Mode: defer a task and it moves to end', async ({ page, request }) => {
  for (let i = 1; i <= 4; i++) {
    await apiCreateTask(request, `Defer Task ${i}`)
  }

  await page.goto('/')
  await page.getByRole('button', { name: 'Focus Mode' }).click()

  // Defer the first task
  await page.locator('.bg-white.rounded-lg.border', { hasText: 'Defer Task 1' })
    .getByRole('button', { name: 'Defer' }).click()

  // Task 4 enters batch; tasks 2 & 3 still there; task 1 is pushed to end (not in top 3)
  await expect(page.locator('text=Defer Task 2')).toBeVisible()
  await expect(page.locator('text=Defer Task 3')).toBeVisible()
  await expect(page.locator('text=Defer Task 4')).toBeVisible()
  await expect(page.locator('text=Defer Task 1')).not.toBeVisible()
})

test('all done state shows when no tasks remain', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Focus Mode' }).click()
  await expect(page.locator('text=All done!')).toBeVisible()
})
