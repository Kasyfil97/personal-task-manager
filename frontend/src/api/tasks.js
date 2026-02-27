const BASE = '/tasks'

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const getTasks = () => req('')
export const getCompleted = () => req('/completed')
export const createTask = (data) => req('', { method: 'POST', body: JSON.stringify(data) })
export const updateTask = (id, data) => req(`/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const completeTask = (id) => req(`/${id}/complete`, { method: 'PATCH' })
export const deferTask = (id) => req(`/${id}/defer`, { method: 'PATCH' })
export const reorderTasks = (items) => req('/reorder', { method: 'PATCH', body: JSON.stringify(items) })
export const deleteTask = (id) => req(`/${id}`, { method: 'DELETE' })
