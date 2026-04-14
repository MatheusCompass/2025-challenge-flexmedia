import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'

const PROMO_SLIDES = [
  { id: 1, texto: 'Aproveite nosso restaurante — aberto das 7h às 23h' },
  { id: 2, texto: 'Piscina aquecida disponível para hóspedes' },
  { id: 3, texto: 'Wi-Fi gratuito em todos os ambientes' },
]

export default function IdlePage() {
  const navigate = useNavigate()
  const { t, resetar } = useTotem()

  useEffect(() => {
    resetar()
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-between h-screen w-screen bg-slate-900 text-white p-12 cursor-pointer"
      onClick={() => navigate('/selecionar-idioma')}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-4 mt-16">
        <h1 className="text-7xl font-bold tracking-tight text-white">
          {t.tituloApp}
        </h1>
        <p className="text-2xl text-slate-400">{t.telaInicial.boasVindas}</p>
      </div>

      {/* Instrução central */}
      <div className="flex flex-col items-center gap-8">
        <div className="w-32 h-1 bg-blue-500 rounded-full animate-pulse" />
        <p className="text-3xl text-slate-300 font-light">{t.telaInicial.instrucao}</p>
        <div className="flex gap-6 mt-4">
          <button
            onClick={e => { e.stopPropagation(); navigate('/selecionar-idioma?fluxo=checkin') }}
            className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white text-2xl font-semibold rounded-2xl transition-colors active:scale-95"
          >
            {t.telaInicial.btnCheckin}
          </button>
          <button
            onClick={e => { e.stopPropagation(); navigate('/selecionar-idioma?fluxo=checkout') }}
            className="px-12 py-6 bg-slate-700 hover:bg-slate-600 text-white text-2xl font-semibold rounded-2xl transition-colors active:scale-95"
          >
            {t.telaInicial.btnCheckout}
          </button>
        </div>
      </div>

      {/* Promoções */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex gap-4 overflow-hidden">
          {PROMO_SLIDES.map(s => (
            <div
              key={s.id}
              className="flex-1 bg-slate-800 rounded-xl p-5 text-slate-300 text-lg text-center"
            >
              {s.texto}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
