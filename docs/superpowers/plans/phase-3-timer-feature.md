# Phase 3 — Timer Feature

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Deliverable:** Complete working app with countdown, audio cues, and view/edit wiring.

**Prerequisite:** Phase 2 complete.

---

## Task 7: `useTimer` Hook

**Files:**
- Create: `src/features/todo/hooks/useTimer.ts`
- Create: `src/features/todo/hooks/useTimer.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/features/todo/hooks/useTimer.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from './useTimer'
import * as sound from '../../../utils/sound'
import type { TodoItem } from '../../../types'

vi.mock('../../../utils/sound', () => ({
  playWarningSound: vi.fn(),
  playNextSound: vi.fn(),
  playCompleteSound: vi.fn(),
}))

const ITEMS: TodoItem[] = [
  { id: 'a', description: 'Task A', durationSeconds: 15 },
  { id: 'b', description: 'Task B', durationSeconds: 10 },
]

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('useTimer', () => {
  it('should_start_at_first_item_with_correct_seconds', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.secondsLeft).toBe(15)
    expect(result.current.isRunning).toBe(true)
  })

  it('should_decrement_secondsLeft_each_second', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.secondsLeft).toBe(12)
  })

  it('should_advance_to_next_item_when_timer_expires', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(15000))
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.secondsLeft).toBe(10)
  })

  it('should_play_warning_sound_at_10_seconds_remaining', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    expect(sound.playWarningSound).toHaveBeenCalledTimes(1)
  })

  it('should_play_next_sound_when_go_next_called', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    act(() => result.current.goNext())
    expect(sound.playNextSound).toHaveBeenCalledTimes(1)
  })

  it('should_mark_complete_after_last_item_expires', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(15000))
    act(() => vi.advanceTimersByTime(10000))
    expect(result.current.isComplete).toBe(true)
    expect(result.current.isRunning).toBe(false)
  })

  it('should_play_complete_sound_after_last_item', () => {
    const { result } = renderHook(() => useTimer(ITEMS))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(15000))
    act(() => vi.advanceTimersByTime(10000))
    expect(sound.playCompleteSound).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/features/todo/hooks/useTimer.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create `src/features/todo/hooks/useTimer.ts`**

```ts
import { useState, useEffect, useRef, useCallback } from 'react'
import { playWarningSound, playNextSound, playCompleteSound } from '../../../utils/sound'
import type { TodoItem } from '../../../types'

interface TimerState {
  currentIndex: number
  secondsLeft: number
  isRunning: boolean
  isComplete: boolean
}

interface UseTimerReturn extends TimerState {
  start: () => void
  goNext: () => void
}

export function useTimer(items: TodoItem[]): UseTimerReturn {
  const [state, setState] = useState<TimerState>({
    currentIndex: 0,
    secondsLeft: items[0]?.durationSeconds ?? 0,
    isRunning: false,
    isComplete: false,
  })

  const warningPlayedRef = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  const advanceTo = useCallback(
    (index: number) => {
      if (index >= items.length) {
        setState((s) => ({ ...s, isRunning: false, isComplete: true }))
        playCompleteSound()
        return
      }
      warningPlayedRef.current = false
      setState({
        currentIndex: index,
        secondsLeft: items[index].durationSeconds,
        isRunning: true,
        isComplete: false,
      })
    },
    [items]
  )

  const start = useCallback(() => {
    if (items.length === 0) return
    warningPlayedRef.current = false
    setState({
      currentIndex: 0,
      secondsLeft: items[0].durationSeconds,
      isRunning: true,
      isComplete: false,
    })
  }, [items])

  const goNext = useCallback(() => {
    const { currentIndex } = stateRef.current
    const nextIndex = currentIndex + 1
    if (nextIndex < items.length) {
      playNextSound()
    }
    advanceTo(nextIndex)
  }, [advanceTo, items.length])

  useEffect(() => {
    if (!state.isRunning) return

    if (state.secondsLeft === 10 && !warningPlayedRef.current) {
      warningPlayedRef.current = true
      playWarningSound()
    }

    if (state.secondsLeft <= 0) {
      playNextSound()
      advanceTo(state.currentIndex + 1)
      return
    }

    const timer = setTimeout(() => {
      setState((s) => ({ ...s, secondsLeft: s.secondsLeft - 1 }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [state.isRunning, state.secondsLeft, state.currentIndex, advanceTo])

  return { ...state, start, goNext }
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/features/todo/hooks/useTimer.test.ts
```

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/todo/hooks
git commit -m "feat: implement useTimer hook with warning/next/complete sounds"
git push
```

---

## Task 8: View Mode

**Files:**
- Create: `src/features/todo/components/ViewMode/ViewMode.tsx`
- Create: `src/features/todo/components/ViewMode/ViewMode.test.tsx`
- Create: `src/features/todo/components/ViewMode/index.ts`

- [ ] **Step 1: Write failing tests**

Create `src/features/todo/components/ViewMode/ViewMode.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { ViewMode } from './ViewMode'
import type { TodoItem } from '../../../../types'

vi.mock('../../../../utils/sound', () => ({
  playWarningSound: vi.fn(),
  playNextSound: vi.fn(),
  playCompleteSound: vi.fn(),
}))

const ITEMS: TodoItem[] = [
  { id: 'a', description: 'Task A', durationSeconds: 15 },
  { id: 'b', description: 'Task B', durationSeconds: 10 },
]

beforeEach(() => vi.useFakeTimers())
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks() })

describe('ViewMode', () => {
  it('should_show_empty_state_when_no_items', () => {
    render(<ViewMode items={[]} />)
    expect(screen.getByText(/no items/i)).toBeInTheDocument()
  })

  it('should_render_all_items', () => {
    render(<ViewMode items={ITEMS} />)
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
  })

  it('should_show_start_button_initially', () => {
    render(<ViewMode items={ITEMS} />)
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument()
  })

  it('should_show_go_next_button_after_start', () => {
    render(<ViewMode items={ITEMS} />)
    act(() => fireEvent.click(screen.getByRole('button', { name: /^start$/i })))
    expect(screen.getByRole('button', { name: /go next/i })).toBeInTheDocument()
  })

  it('should_highlight_first_item_when_started', () => {
    render(<ViewMode items={ITEMS} />)
    act(() => fireEvent.click(screen.getByRole('button', { name: /^start$/i })))
    expect(screen.getByTestId('item-a')).toHaveClass('border-blue-500')
  })

  it('should_show_countdown_timer_for_active_item', () => {
    render(<ViewMode items={ITEMS} />)
    act(() => fireEvent.click(screen.getByRole('button', { name: /^start$/i })))
    expect(screen.getByText('00:15')).toBeInTheDocument()
  })

  it('should_advance_to_next_item_on_go_next', () => {
    render(<ViewMode items={ITEMS} />)
    act(() => fireEvent.click(screen.getByRole('button', { name: /^start$/i })))
    act(() => fireEvent.click(screen.getByRole('button', { name: /go next/i })))
    expect(screen.getByTestId('item-b')).toHaveClass('border-blue-500')
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/features/todo/components/ViewMode/ViewMode.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/features/todo/components/ViewMode/ViewMode.tsx`**

```tsx
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

  if (items.length === 0) {
    return (
      <p className="text-gray-400 text-center py-12">
        No items. Switch to Edit mode to add items.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={start}
          disabled={isRunning}
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

      {isComplete && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg font-semibold text-center text-lg">
          All done!
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item, index) => {
          const isActive = isRunning && index === currentIndex
          const isDone = index < currentIndex && (isRunning || isComplete)
          const isWarning = isActive && secondsLeft <= 10

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
```

- [ ] **Step 4: Create `src/features/todo/components/ViewMode/index.ts`**

```ts
export { ViewMode } from './ViewMode'
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
npx vitest run src/features/todo/components/ViewMode/ViewMode.test.tsx
```

Expected: 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/todo/components/ViewMode
git commit -m "feat: implement ViewMode with timer display, highlighting, and controls"
git push
```

---

## Task 9: List Detail Page — Wire Edit & View

**Files:**
- Modify: `src/pages/ListDetailPage.tsx`
- Create: `src/pages/ListDetailPage.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/pages/ListDetailPage.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ListDetailPage } from './ListDetailPage'
import { useListsStore } from '../stores/listsStore'

vi.mock('../utils/sound', () => ({
  playWarningSound: vi.fn(),
  playNextSound: vi.fn(),
  playCompleteSound: vi.fn(),
}))

beforeEach(() => {
  useListsStore.setState({
    lists: [
      {
        id: 'list-1',
        name: 'Morning Routine',
        items: [{ id: 'i1', description: 'Stretch', durationSeconds: 120 }],
        createdAt: 0,
      },
    ],
  })
})

function renderDetail(listId = 'list-1') {
  return render(
    <MemoryRouter initialEntries={[`/list/${listId}`]}>
      <Routes>
        <Route path="/list/:listId" element={<ListDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ListDetailPage', () => {
  it('should_show_list_name', () => {
    renderDetail()
    expect(screen.getByText('Morning Routine')).toBeInTheDocument()
  })

  it('should_render_view_mode_by_default', () => {
    renderDetail()
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument()
  })

  it('should_switch_to_edit_mode_on_edit_click', () => {
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument()
  })

  it('should_show_not_found_for_unknown_list', () => {
    renderDetail('unknown-id')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/pages/ListDetailPage.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/pages/ListDetailPage.tsx`**

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useListsStore } from '../stores/listsStore'
import { EditMode } from '../features/todo/components/EditMode'
import { ViewMode } from '../features/todo/components/ViewMode'

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const list = useListsStore((state) => state.lists.find((l) => l.id === listId))
  const [isEditing, setIsEditing] = useState(false)

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          List not found.{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 underline"
          >
            Go home
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{list.name}</h1>
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Done
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <EditMode listId={list.id} items={list.items} />
        ) : (
          <ViewMode items={list.items} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ListDetailPage.tsx src/pages/ListDetailPage.test.tsx
git commit -m "feat: implement ListDetailPage wiring ViewMode and EditMode"
git push
```
