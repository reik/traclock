export interface TodoItem {
  id: string
  description: string
  durationSeconds: number
}

export interface TodoList {
  id: string
  name: string
  items: TodoItem[]
  createdAt: number
}
