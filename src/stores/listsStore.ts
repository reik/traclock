import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TodoList, TodoItem } from '../types'

interface ListsState {
  lists: TodoList[]
  addList: (name: string) => void
  deleteList: (id: string) => void
  addItem: (listId: string, item: Omit<TodoItem, 'id'>) => void
  deleteItem: (listId: string, itemId: string) => void
  updateItem: (listId: string, itemId: string, patch: Partial<Omit<TodoItem, 'id'>>) => void
  swapItems: (listId: string, indexA: number, indexB: number) => void
  reorderItems: (listId: string, fromIndex: number, toIndex: number) => void
}

export const useListsStore = create<ListsState>()(
  persist(
    (set) => ({
      lists: [],

      addList: (name) =>
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: crypto.randomUUID(),
              name,
              items: [],
              createdAt: Date.now(),
            },
          ],
        })),

      deleteList: (id) =>
        set((state) => ({ lists: state.lists.filter((l) => l.id !== id) })),

      addItem: (listId, item) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: [
                    ...l.items,
                    { alertSound: 'chime' as const, ...item, id: crypto.randomUUID() },
                  ],
                }
              : l
          ),
        })),

      deleteItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
              : l
          ),
        })),

      updateItem: (listId, itemId, patch) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((i) =>
                    i.id === itemId ? { ...i, ...patch } : i
                  ),
                }
              : l
          ),
        })),

      swapItems: (listId, indexA, indexB) =>
        set((state) => ({
          lists: state.lists.map((l) => {
            if (l.id !== listId) return l
            const items = [...l.items]
            ;[items[indexA], items[indexB]] = [items[indexB], items[indexA]]
            return { ...l, items }
          }),
        })),

      reorderItems: (listId, fromIndex, toIndex) =>
        set((state) => ({
          lists: state.lists.map((l) => {
            if (l.id !== listId) return l
            const items = [...l.items]
            const [moved] = items.splice(fromIndex, 1)
            items.splice(toIndex, 0, moved)
            return { ...l, items }
          }),
        })),
    }),
    { name: 'traclock-lists' }
  )
)
