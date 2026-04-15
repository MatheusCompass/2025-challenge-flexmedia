import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'

const TEMPO_RESET = 10

export default function ThankYouPage() {
  const navigate = useNavigate()
  const { t, resetar, fluxo } = useTotem()
  const [contador, setContador] = useState(TEMPO_RESET)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(intervalo)
          resetar()
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalo)
  }, [])

  const isCheckin = fluxo === 'checkin'

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white gap-6 md:gap-8">
      {/* Ícone */}
      <div className="w-28 h-28 md:w-40 md:h-40 bg-green-500/20 border-4 border-green-400 rounded-full flex items-center justify-center">
        <span className="text-5xl md:text-7xl">{isCheckin ? '🏨' : '👋'}</span>
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-4xl md:text-6xl font-bold text-green-400">{t.obrigado.titulo}</h2>
        <p className="text-xl md:text-3xl text-slate-300">{t.obrigado.instrucao}</p>
      </div>

      {/* Countdown */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-600 flex items-center justify-center">
          <span className="text-2xl md:text-4xl font-mono font-bold">{contador}</span>
        </div>
        <p className="text-slate-500 text-lg">{t.obrigado.voltando}</p>
      </div>

      <button
        onClick={() => { resetar(); navigate('/') }}
        className="px-8 py-3 md:px-12 md:py-4 bg-slate-700 hover:bg-slate-600 text-white text-base md:text-xl rounded-2xl transition-colors active:scale-95"
      >
        {t.geral.btnVoltar}
      </button>
    </div>
  )
}
