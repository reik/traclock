export type AlertSound = 'chime' | 'bell' | 'beep' | 'none'

export interface TodoItem {
  id: string
  description: string
  durationSeconds: number
  alertSound: AlertSound
}

export interface TodoList {
  id: string
  name: string
  items: TodoItem[]
  createdAt: number
}
