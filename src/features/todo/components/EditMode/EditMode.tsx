import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useListsStore } from '../../../../stores/listsStore'
import { todoItemSchema, type TodoItemFormData } from '../../../../schemas'
import { fromSeconds, toSeconds, formatTime } from '../../../../utils/time'
import type { TodoItem } from '../../../../types'

interface EditModeProps {
  listId: string
  items: TodoItem[]
}

export function EditMode({ listId, items }: EditModeProps) {
  const { addItem, deleteItem, updateItem, swapItems } = useListsStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const addForm = useForm<TodoItemFormData>({
    resolver: zodResolver(todoItemSchema),
    defaultValues: { description: '', minutes: 0, seconds: 30 },
  })

  const editForm = useForm<TodoItemFormData>({
    resolver: zodResolver(todoItemSchema),
  })

  const onAdd = (data: TodoItemFormData) => {
    addItem(listId, {
      description: data.description,
      durationSeconds: toSeconds(data.minutes, data.seconds),
    })
    addForm.reset({ description: '', minutes: 0, seconds: 30 })
  }

  const startEdit = (item: TodoItem) => {
    const { minutes, seconds } = fromSeconds(item.durationSeconds)
    editForm.reset({ description: item.description, minutes, seconds })
    setEditingId(item.id)
  }

  const onEditSave = (itemId: string) => (data: TodoItemFormData) => {
    updateItem(listId, itemId, {
      description: data.description,
      durationSeconds: toSeconds(data.minutes, data.seconds),
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={addForm.handleSubmit(onAdd)}
        className="p-4 bg-white rounded-lg shadow space-y-3"
      >
        <h2 className="font-semibold text-gray-700">Add Item</h2>
        <input
          {...addForm.register('description')}
          type="text"
          placeholder="Description"
          className="w-full border rounded px-3 py-2"
        />
        {addForm.formState.errors.description && (
          <p className="text-red-500 text-sm">
            {addForm.formState.errors.description.message}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Duration:</span>
          <input
            {...addForm.register('minutes', { valueAsNumber: true })}
            type="number"
            min={0}
            max={99}
            className="w-16 border rounded px-2 py-1 text-center"
          />
          <span className="text-gray-500 text-sm">min</span>
          <input
            {...addForm.register('seconds', { valueAsNumber: true })}
            type="number"
            min={0}
            max={59}
            className="w-16 border rounded px-2 py-1 text-center"
          />
          <span className="text-gray-500 text-sm">sec</span>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add
        </button>
      </form>

      {items.length === 0 && (
        <p className="text-gray-400 text-center py-8">No items yet.</p>
      )}

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id} className="p-4 bg-white rounded-lg shadow">
            {editingId === item.id ? (
              <form
                onSubmit={editForm.handleSubmit(onEditSave(item.id))}
                className="space-y-2"
              >
                <input
                  {...editForm.register('description')}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                />
                {editForm.formState.errors.description && (
                  <p className="text-red-500 text-sm">
                    {editForm.formState.errors.description.message}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    {...editForm.register('minutes', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={99}
                    className="w-16 border rounded px-2 py-1 text-center"
                  />
                  <span className="text-sm text-gray-500">min</span>
                  <input
                    {...editForm.register('seconds', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={59}
                    className="w-16 border rounded px-2 py-1 text-center"
                  />
                  <span className="text-sm text-gray-500">sec</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-200 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    aria-label="Move up"
                    onClick={() => swapItems(listId, index, index - 1)}
                    disabled={index === 0}
                    className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none"
                  >
                    ▲
                  </button>
                  <button
                    aria-label="Move down"
                    onClick={() => swapItems(listId, index, index + 1)}
                    disabled={index === items.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.description}</p>
                  <p className="text-sm text-gray-400">{formatTime(item.durationSeconds)}</p>
                </div>
                <button
                  onClick={() => startEdit(item)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(listId, item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
