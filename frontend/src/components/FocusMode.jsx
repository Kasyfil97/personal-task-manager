import FocusBatch from './FocusBatch'

export default function FocusMode({ tasks, onComplete, onDefer }) {
  const batch = tasks.slice(0, 3)

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-indigo-700">Focus Mode</h2>
        <p className="text-sm text-gray-500 mt-1">
          {tasks.length > 0
            ? `Showing top ${batch.length} of ${tasks.length} tasks. Complete or defer each to see the next batch.`
            : 'No tasks remaining.'}
        </p>
      </div>
      <FocusBatch tasks={batch} onComplete={onComplete} onDefer={onDefer} />
    </div>
  )
}
