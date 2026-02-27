import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CompletedList({ tasks, onDelete }) {
  const [open, setOpen] = useState(false)

  if (tasks.length === 0) return null

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        <span>{open ? '▾' : '▸'}</span>
        Completed ({tasks.length})
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-50 rounded-lg border border-gray-100 p-3 flex items-center gap-3"
            >
              <span className="text-green-500 text-sm">✓</span>
              <span className="flex-1 text-sm text-gray-500 line-through">{task.title}</span>
              {task.due_date && (
                <span className="text-xs text-gray-400">{formatDate(task.due_date)}</span>
              )}
              <button
                onClick={() => onDelete(task.id)}
                className="text-xs text-gray-400 hover:text-red-500"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
