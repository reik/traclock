import { z } from 'zod'

export const todoListSchema = z.object({
  name: z.string().min(1, 'List name is required'),
})

export type TodoListFormData = z.infer<typeof todoListSchema>

export const alertSoundSchema = z.enum(['chime', 'bell', 'beep', 'none'])

export const todoItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  minutes: z.number().int().min(0, 'Min 0').max(99, 'Max 99'),
  seconds: z.number().int().min(0, 'Min 0').max(59, 'Max 59'),
  alertSound: alertSoundSchema.default('chime'),
})

export type TodoItemFormData = z.infer<typeof todoItemSchema>
