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
