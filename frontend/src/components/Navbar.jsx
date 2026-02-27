export default function Navbar({ view, onViewChange }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">Task Manager</h1>
      <div className="flex gap-2">
        <button
          onClick={() => onViewChange('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => onViewChange('focus')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'focus'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Focus Mode
        </button>
      </div>
    </nav>
  )
}
