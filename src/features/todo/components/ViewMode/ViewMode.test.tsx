import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { ViewMode } from './ViewMode'
import type { TodoItem } from '../../../../types'

vi.mock('../../../../utils/sound', () => ({
  playWarningSound: vi.fn(),
  playNextSound: vi.fn(),
  playCompleteSound: vi.fn(),
  playBellSound: vi.fn(),
  playBeepSound: vi.fn(),
}))

const ITEMS: TodoItem[] = [
  { id: 'a', description: 'Task A', durationSeconds: 15, alertSound: 'chime' },
  { id: 'b', description: 'Task B', durationSeconds: 10, alertSound: 'chime' },
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
