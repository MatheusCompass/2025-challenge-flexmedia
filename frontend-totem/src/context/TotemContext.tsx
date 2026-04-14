import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Idioma, Reserva } from '../types'
import pt from '../locales/pt.json'
import en from '../locales/en.json'
import es from '../locales/es.json'

const traducoes = { pt, en, es }

interface TotemContextType {
  idioma: Idioma
  setIdioma: (idioma: Idioma) => void
  t: typeof pt
  reserva: Reserva | null
  setReserva: (reserva: Reserva | null) => void
  fluxo: 'checkin' | 'checkout' | null
  setFluxo: (fluxo: 'checkin' | 'checkout' | null) => void
  resetar: () => void
}

const TotemContext = createContext<TotemContextType | null>(null)

export function TotemProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>('pt')
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [fluxo, setFluxo] = useState<'checkin' | 'checkout' | null>(null)

  const t = traducoes[idioma]

  function resetar() {
    setReserva(null)
    setFluxo(null)
    setIdioma('pt')
  }

  return (
    <TotemContext.Provider value={{ idioma, setIdioma, t, reserva, setReserva, fluxo, setFluxo, resetar }}>
      {children}
    </TotemContext.Provider>
  )
}

export function useTotem(): TotemContextType {
  const ctx = useContext(TotemContext)
  if (!ctx) throw new Error('useTotem deve ser usado dentro de TotemProvider')
  return ctx
}
