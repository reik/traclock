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
