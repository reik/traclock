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
  const itemsRef = useRef(items)
  itemsRef.current = items

  const start = useCallback(() => {
    if (itemsRef.current.length === 0) return
    warningPlayedRef.current = false
    setState({
      currentIndex: 0,
      secondsLeft: itemsRef.current[0].durationSeconds,
      isRunning: true,
      isComplete: false,
    })
  }, [])

  const goNext = useCallback(() => {
    setState((s) => {
      const nextIndex = s.currentIndex + 1
      const currentItems = itemsRef.current
      if (nextIndex < currentItems.length) {
        playNextSound()
        warningPlayedRef.current = false
        return {
          currentIndex: nextIndex,
          secondsLeft: currentItems[nextIndex].durationSeconds,
          isRunning: true,
          isComplete: false,
        }
      }
      playCompleteSound()
      return { ...s, isRunning: false, isComplete: true }
    })
  }, [])

  useEffect(() => {
    if (!state.isRunning) return

    const interval = setInterval(() => {
      setState((s) => {
        if (!s.isRunning) return s

        const next = s.secondsLeft - 1

        if (next === 10 && !warningPlayedRef.current) {
          warningPlayedRef.current = true
          playWarningSound()
        }

        if (next <= 0) {
          const nextIndex = s.currentIndex + 1
          const currentItems = itemsRef.current
          if (nextIndex >= currentItems.length) {
            playCompleteSound()
            return { ...s, isRunning: false, isComplete: true }
          }
          playNextSound()
          warningPlayedRef.current = false
          return {
            currentIndex: nextIndex,
            secondsLeft: currentItems[nextIndex].durationSeconds,
            isRunning: true,
            isComplete: false,
          }
        }

        return { ...s, secondsLeft: next }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.isRunning, state.currentIndex])

  return { ...state, start, goNext }
}
