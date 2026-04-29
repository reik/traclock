import { z } from 'zod'

export const todoListSchema = z.object({
  name: z.string().min(1, 'List name is required'),
})

export type TodoListFormData = z.infer<typeof todoListSchema>

export const todoItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  minutes: z.number().int().min(0, 'Min 0').max(99, 'Max 99'),
  seconds: z.number().int().min(0, 'Min 0').max(59, 'Max 59'),
})

export type TodoItemFormData = z.infer<typeof todoItemSchema>
