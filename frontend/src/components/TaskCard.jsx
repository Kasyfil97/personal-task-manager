const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  med: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

const PRIORITY_LABELS = { high: 'High', med: 'Med', low: 'Low' }

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}

export default function TaskCard({ task, onEdit, onDelete, onComplete, onDefer, dragHandle, focusMode }) {
  const overdue = isOverdue(task.due_date)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-3 group hover:shadow-sm transition-shadow">
      {dragHandle && (
        <div {...dragHandle} className="mt-1 cursor-grab text-gray-300 hover:text-gray-500 select-none">
          ⠿
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-800 truncate">{task.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.med}`}>
            {PRIORITY_LABELS[task.priority] || task.priority}
          </span>
          {task.due_date && (
            <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              {overdue ? 'Overdue: ' : ''}{formatDate(task.due_date)}
            </span>
          )}
        </div>
        {task.notes && (
          <p className="text-sm text-gray-500 mt-1 truncate">{task.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {focusMode ? (
          <>
            <button
              onClick={() => onComplete(task.id)}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
            >
              Done
            </button>
            <button
              onClick={() => onDefer(task.id)}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600"
            >
              Defer
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onComplete(task.id)}
              className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Complete"
            >
              ✓
            </button>
            <button
              onClick={() => onEdit(task)}
              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit"
            >
              ✎
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}
