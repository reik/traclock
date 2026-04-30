import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ListDetailPage } from './ListDetailPage'
import { useListsStore } from '../stores/listsStore'

vi.mock('../utils/sound', () => ({
  playWarningSound: vi.fn(),
  playNextSound: vi.fn(),
  playCompleteSound: vi.fn(),
}))

beforeEach(() => {
  useListsStore.setState({
    lists: [
      {
        id: 'list-1',
        name: 'Morning Routine',
        items: [{ id: 'i1', description: 'Stretch', durationSeconds: 120 }],
        createdAt: 0,
      },
    ],
  })
})

function renderDetail(listId = 'list-1') {
  return render(
    <MemoryRouter initialEntries={[`/list/${listId}`]}>
      <Routes>
        <Route path="/list/:listId" element={<ListDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ListDetailPage', () => {
  it('should_show_list_name', () => {
    renderDetail()
    expect(screen.getByText('Morning Routine')).toBeInTheDocument()
  })

  it('should_render_view_mode_by_default', () => {
    renderDetail()
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument()
  })

  it('should_switch_to_edit_mode_on_edit_click', () => {
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument()
  })

  it('should_show_not_found_for_unknown_list', () => {
    renderDetail('unknown-id')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
