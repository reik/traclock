import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useListsStore } from '../../../../stores/listsStore'
import { todoItemSchema, type TodoItemFormData } from '../../../../schemas'
import { fromSeconds, toSeconds, formatTime } from '../../../../utils/time'
import type { TodoItem, AlertSound } from '../../../../types'

interface EditModeProps {
  listId: string
  items: TodoItem[]
}

const ALERT_SOUNDS: { value: AlertSound; label: string }[] = [
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'beep', label: 'Beep' },
  { value: 'none', label: 'None' },
]

interface SortableItemProps {
  item: TodoItem
  onEdit: (item: TodoItem) => void
  editingId: string | null
  editForm: ReturnType<typeof useForm<TodoItemFormData>>
  onEditSave: (itemId: string) => (data: TodoItemFormData) => void
  onCancelEdit: () => void
  onDelete: (itemId: string) => void
  onSoundChange: (itemId: string, sound: AlertSound) => void
}

function SortableItem({
  item,
  onEdit,
  editingId,
  editForm,
  onEditSave,
  onCancelEdit,
  onDelete,
  onSoundChange,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="p-4 bg-white rounded-lg shadow">
      {editingId === item.id ? (
        <form onSubmit={editForm.handleSubmit(onEditSave(item.id))} className="space-y-2">
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
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="cursor-grab text-gray-400 hover:text-gray-600 px-1 touch-none"
          >
            ⠿
          </button>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{item.description}</p>
            <p className="text-sm text-gray-400">{formatTime(item.durationSeconds)}</p>
          </div>
          <select
            aria-label="Alert sound"
            value={item.alertSound}
            onChange={(e) => onSoundChange(item.id, e.target.value as AlertSound)}
            className="border rounded px-2 py-1 text-sm"
          >
            {ALERT_SOUNDS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onEdit(item)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </li>
  )
}

export function EditMode({ listId, items }: EditModeProps) {
  const { addItem, deleteItem, updateItem, reorderItems } = useListsStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor))

  const addForm = useForm<TodoItemFormData>({
    resolver: zodResolver(todoItemSchema),
    defaultValues: { description: '', minutes: 0, seconds: 30, alertSound: 'chime' },
  })

  const editForm = useForm<TodoItemFormData>({
    resolver: zodResolver(todoItemSchema),
  })

  const onAdd = (data: TodoItemFormData) => {
    addItem(listId, {
      description: data.description,
      durationSeconds: toSeconds(data.minutes, data.seconds),
      alertSound: data.alertSound,
    })
    addForm.reset({ description: '', minutes: 0, seconds: 30, alertSound: 'chime' })
  }

  const startEdit = (item: TodoItem) => {
    const { minutes, seconds } = fromSeconds(item.durationSeconds)
    editForm.reset({ description: item.description, minutes, seconds, alertSound: item.alertSound })
    setEditingId(item.id)
  }

  const onEditSave = (itemId: string) => (data: TodoItemFormData) => {
    updateItem(listId, itemId, {
      description: data.description,
      durationSeconds: toSeconds(data.minutes, data.seconds),
      alertSound: data.alertSound,
    })
    setEditingId(null)
  }

  const onSoundChange = (itemId: string, sound: AlertSound) => {
    updateItem(listId, itemId, { alertSound: sound })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = items.findIndex((i) => i.id === active.id)
    const toIndex = items.findIndex((i) => i.id === over.id)
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderItems(listId, fromIndex, toIndex)
    }
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
        <div className="flex items-center gap-2">
          <label htmlFor="add-alert-sound" className="text-sm text-gray-600">
            Sound:
          </label>
          <select
            {...addForm.register('alertSound')}
            id="add-alert-sound"
            className="border rounded px-2 py-1 text-sm"
          >
            {ALERT_SOUNDS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onEdit={startEdit}
                editingId={editingId}
                editForm={editForm}
                onEditSave={onEditSave}
                onCancelEdit={() => setEditingId(null)}
                onDelete={(id) => deleteItem(listId, id)}
                onSoundChange={onSoundChange}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
