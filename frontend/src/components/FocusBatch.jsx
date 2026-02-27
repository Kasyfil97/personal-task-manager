import TaskCard from './TaskCard'

export default function FocusBatch({ tasks, onComplete, onDefer }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">All done!</h2>
        <p className="text-gray-400">No more tasks. Time to celebrate.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, i) => (
        <div key={task.id} className={i === 0 ? 'ring-2 ring-indigo-400 rounded-lg' : ''}>
          <TaskCard
            task={task}
            onComplete={onComplete}
            onDefer={onDefer}
            focusMode
          />
        </div>
      ))}
    </div>
  )
}
