import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'
import type { Idioma } from '../types'

const IDIOMAS: { code: Idioma; label: string; flag: string }[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function LanguagePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setIdioma, setFluxo, t } = useTotem()

  function selecionar(code: Idioma) {
    setIdioma(code)
    const fluxo = params.get('fluxo') as 'checkin' | 'checkout' | null
    setFluxo(fluxo ?? 'checkin')
    navigate('/buscar-reserva')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 text-white gap-12">
      <h2 className="text-5xl font-bold">{t.selecionarIdioma.titulo}</h2>
      <div className="flex gap-8">
        {IDIOMAS.map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => selecionar(code)}
            className="flex flex-col items-center gap-4 px-16 py-10 bg-slate-800 hover:bg-blue-700 rounded-3xl text-3xl font-semibold transition-colors active:scale-95"
          >
            <span className="text-6xl">{flag}</span>
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate('/')}
        className="text-slate-500 text-xl hover:text-slate-300 mt-4"
      >
        {t.geral.btnCancelar}
      </button>
    </div>
  )
}
