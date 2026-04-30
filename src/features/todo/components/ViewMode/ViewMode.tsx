import { useTimer } from '../../hooks/useTimer'
import { formatTime } from '../../../../utils/time'
import { cn } from '../../../../utils/cn'
import type { TodoItem } from '../../../../types'

interface ViewModeProps {
  items: TodoItem[]
}

export function ViewMode({ items }: ViewModeProps) {
  const { currentIndex, secondsLeft, isRunning, isComplete, start, goNext } =
    useTimer(items)

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={start}
          disabled={isRunning || items.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {isComplete ? 'Restart' : 'Start'}
        </button>
        {isRunning && (
          <button
            onClick={goNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Go Next →
          </button>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No items. Switch to Edit mode to add items.
        </p>
      )}

      {isComplete && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg font-semibold text-center text-lg">
          All done!
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item, index) => {
          const isActive = isRunning && index === currentIndex
          const isDone = index < currentIndex && (isRunning || isComplete)
          const isWarning = isActive && secondsLeft <= 10 && secondsLeft < item.durationSeconds

          return (
            <li
              key={item.id}
              data-testid={`item-${item.id}`}
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-300',
                isActive && !isWarning && 'border-blue-500 bg-blue-50',
                isActive && isWarning && 'border-orange-500 bg-orange-50 animate-pulse',
                isDone && 'border-gray-200 bg-gray-50 opacity-50',
                !isActive && !isDone && 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-medium',
                    isDone && 'line-through text-gray-400',
                    isActive && 'text-blue-800'
                  )}
                >
                  {item.description}
                </span>
                <span
                  className={cn(
                    'font-mono font-bold',
                    isActive ? 'text-2xl' : 'text-sm text-gray-400',
                    isActive && isWarning && 'text-orange-600',
                    isActive && !isWarning && 'text-blue-600'
                  )}
                >
                  {isActive ? formatTime(secondsLeft) : formatTime(item.durationSeconds)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
