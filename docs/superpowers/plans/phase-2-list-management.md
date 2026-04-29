# Phase 2 — List Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Deliverable:** Full CRUD for lists and items, no timer.

**Prerequisite:** Phase 1 complete.

---

## Task 5: Home Page — List CRUD

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Create: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/pages/HomePage.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import { HomePage } from './HomePage'
import { useListsStore } from '../stores/listsStore'

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useListsStore.setState({ lists: [] })
})

describe('HomePage', () => {
  it('should_show_empty_state_when_no_lists', () => {
    renderPage()
    expect(screen.getByText(/no lists yet/i)).toBeInTheDocument()
  })

  it('should_add_a_list_when_form_submitted', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /new list/i }))
    fireEvent.change(screen.getByPlaceholderText(/list name/i), {
      target: { value: 'Morning Routine' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create/i }))
    })
    expect(screen.getByText('Morning Routine')).toBeInTheDocument()
  })

  it('should_delete_a_list', async () => {
    useListsStore.setState({
      lists: [{ id: 'l1', name: 'Test List', items: [], createdAt: 0 }],
    })
    renderPage()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    })
    expect(screen.queryByText('Test List')).not.toBeInTheDocument()
  })

  it('should_show_validation_error_when_name_is_empty', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /new list/i }))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create/i }))
    })
    expect(screen.getByText(/list name is required/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/pages/HomePage.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/pages/HomePage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useListsStore } from '../stores/listsStore'
import { todoListSchema, type TodoListFormData } from '../schemas'

export function HomePage() {
  const { lists, addList, deleteList } = useListsStore()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoListFormData>({ resolver: zodResolver(todoListSchema) })

  const onSubmit = (data: TodoListFormData) => {
    addList(data.name)
    reset()
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Lists</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New List
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 p-4 bg-white rounded-lg shadow space-y-2"
          >
            <input
              {...register('name')}
              placeholder="List name"
              className="w-full border rounded px-3 py-2"
              autoFocus
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset() }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {lists.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No lists yet. Create one!
          </p>
        ) : (
          <ul className="space-y-3">
            {lists.map((list) => (
              <li
                key={list.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <button
                  onClick={() => navigate(`/list/${list.id}`)}
                  className="flex-1 text-left font-medium text-gray-800 hover:text-blue-700"
                >
                  {list.name}
                  <span className="ml-2 text-sm text-gray-400">
                    {list.items.length} items
                  </span>
                </button>
                <button
                  onClick={() => deleteList(list.id)}
                  className="ml-4 text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/pages/HomePage.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.test.tsx
git commit -m "feat: implement Home page with list add/delete"
git push
```

---

## Task 6: Edit Mode — Item CRUD & Reorder

**Files:**
- Create: `src/features/todo/components/EditMode/EditMode.tsx`
- Create: `src/features/todo/components/EditMode/EditMode.test.tsx`
- Create: `src/features/todo/components/EditMode/index.ts`

- [ ] **Step 1: Write failing tests**

Create `src/features/todo/components/EditMode/EditMode.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { EditMode } from './EditMode'
import { useListsStore } from '../../../../stores/listsStore'

const LIST_ID = 'list-1'

beforeEach(() => {
  useListsStore.setState({
    lists: [
      {
        id: LIST_ID,
        name: 'Test',
        items: [
          { id: 'i1', description: 'First task', durationSeconds: 60 },
          { id: 'i2', description: 'Second task', durationSeconds: 30 },
        ],
        createdAt: 0,
      },
    ],
  })
})

function renderEdit() {
  const items = useListsStore.getState().lists[0].items
  return render(<EditMode listId={LIST_ID} items={items} />)
}

describe('EditMode', () => {
  it('should_render_existing_items', () => {
    renderEdit()
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('should_add_a_new_item', async () => {
    renderEdit()
    fireEvent.change(screen.getByPlaceholderText(/description/i), {
      target: { value: 'New task' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
    })
    expect(useListsStore.getState().lists[0].items).toHaveLength(3)
    expect(useListsStore.getState().lists[0].items[2].description).toBe('New task')
  })

  it('should_delete_an_item', async () => {
    renderEdit()
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })
    expect(useListsStore.getState().lists[0].items).toHaveLength(1)
    expect(useListsStore.getState().lists[0].items[0].description).toBe('Second task')
  })

  it('should_swap_items_up', async () => {
    renderEdit()
    const upButtons = screen.getAllByRole('button', { name: /move up/i })
    await act(async () => {
      fireEvent.click(upButtons[1])
    })
    const items = useListsStore.getState().lists[0].items
    expect(items[0].description).toBe('Second task')
    expect(items[1].description).toBe('First task')
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/features/todo/components/EditMode/EditMode.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/features/todo/components/EditMode/EditMode.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `src/features/todo/components/EditMode/index.ts`**

```ts
export { EditMode } from './EditMode'
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
npx vitest run src/features/todo/components/EditMode/EditMode.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/todo/components/EditMode
git commit -m "feat: implement EditMode with add/delete/update/reorder"
git push
```
