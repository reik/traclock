import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ListDetailPage } from './pages/ListDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list/:listId" element={<ListDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
