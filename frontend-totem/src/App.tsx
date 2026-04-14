import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TotemProvider } from './context/TotemContext'
import IdlePage from './pages/IdlePage'
import LanguagePage from './pages/LanguagePage'
import SearchReservationPage from './pages/SearchReservationPage'
import ConfirmDataPage from './pages/ConfirmDataPage'
import FacialRecognitionPage from './pages/FacialRecognitionPage'
import IssueKeyPage from './pages/IssueKeyPage'
import CheckoutPage from './pages/CheckoutPage'
import ThankYouPage from './pages/ThankYouPage'

function App() {
  return (
    <TotemProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IdlePage />} />
          <Route path="/selecionar-idioma" element={<LanguagePage />} />
          <Route path="/buscar-reserva" element={<SearchReservationPage />} />
          <Route path="/confirmar-dados" element={<ConfirmDataPage />} />
          <Route path="/facial" element={<FacialRecognitionPage />} />
          <Route path="/emitir-chave" element={<IssueKeyPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/obrigado" element={<ThankYouPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TotemProvider>
  )
}

export default App
