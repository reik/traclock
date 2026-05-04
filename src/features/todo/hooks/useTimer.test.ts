import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from './useTimer'
import * as sound from '../../../utils/sound'
import type { TodoItem } from '../../../types'

vi.mock('../../../utils/sound', () => ({
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
