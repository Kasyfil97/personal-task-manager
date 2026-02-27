import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import FocusMode from './components/FocusMode'
import CompletedList from './components/CompletedList'
import * as api from './api/tasks'

export default function App() {
  const [view, setView] = useState('all')
  const [tasks, setTasks] = useState([])
  const [completed, setCompleted] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([api.getTasks(), api.getCompleted()])
      setTasks(t)
      setCompleted(c)
    } catch (e) {
      setError('Failed to load tasks. Is the backend running?')
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleCreate(data) {
    try {
      await api.createTask(data)
      setShowForm(false)
      await fetchAll()
    } catch { setError('Failed to create task') }
  }

  async function handleEdit(data) {
    try {
      await api.updateTask(editTask.id, data)
      setEditTask(null)
      await fetchAll()
    } catch { setError('Failed to update task') }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTask(id)
      await fetchAll()
    } catch { setError('Failed to delete task') }
  }

  async function handleComplete(id) {
    try {
      await api.completeTask(id)
      await fetchAll()
    } catch { setError('Failed to complete task') }
  }

  async function handleDefer(id) {
    try {
      await api.deferTask(id)
      await fetchAll()
    } catch { setError('Failed to defer task') }
  }

  async function handleReorder(items) {
    try {
      const updated = await api.reorderTasks(items)
      setTasks(updated)
    } catch { setError('Failed to reorder tasks') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar view={view} onViewChange={setView} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {view === 'all' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Tasks <span className="text-gray-400 font-normal text-sm">({tasks.length})</span>
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                + Add Task
              </button>
            </div>
            <TaskList
              tasks={tasks}
              onEdit={(task) => setEditTask(task)}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onReorder={handleReorder}
            />
            <CompletedList tasks={completed} onDelete={handleDelete} />
          </>
        ) : (
          <FocusMode tasks={tasks} onComplete={handleComplete} onDefer={handleDefer} />
        )}

        {(showForm || editTask) && (
          <TaskForm
            onSubmit={editTask ? handleEdit : handleCreate}
            onClose={() => { setShowForm(false); setEditTask(null) }}
            initial={editTask ? {
              title: editTask.title,
              due_date: editTask.due_date || '',
              priority: editTask.priority,
              notes: editTask.notes || '',
            } : undefined}
          />
        )}
      </main>
    </div>
  )
}
