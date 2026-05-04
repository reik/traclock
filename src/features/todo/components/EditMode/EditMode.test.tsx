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
          { id: 'i1', description: 'First task', durationSeconds: 60, alertSound: 'chime' },
          { id: 'i2', description: 'Second task', durationSeconds: 30, alertSound: 'bell' },
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

  it('should_show_alert_sound_selector_per_item', () => {
    renderEdit()
    const selects = screen.getAllByRole('combobox', { name: /alert sound/i })
    expect(selects).toHaveLength(2)
    expect(selects[0]).toHaveValue('chime')
    expect(selects[1]).toHaveValue('bell')
  })

  it('should_update_alert_sound_on_change', async () => {
    renderEdit()
    const selects = screen.getAllByRole('combobox', { name: /alert sound/i })
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: 'beep' } })
    })
    expect(useListsStore.getState().lists[0].items[0].alertSound).toBe('beep')
  })
})
