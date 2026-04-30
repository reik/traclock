import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useListsStore } from '../stores/listsStore'
import { EditMode } from '../features/todo/components/EditMode'
import { ViewMode } from '../features/todo/components/ViewMode'

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const list = useListsStore((state) => state.lists.find((l) => l.id === listId))
  const [isEditing, setIsEditing] = useState(false)

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          List not found.{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 underline"
          >
            Go home
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{list.name}</h1>
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Done
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <EditMode listId={list.id} items={list.items} />
        ) : (
          <ViewMode items={list.items} />
        )}
      </div>
    </div>
  )
}
