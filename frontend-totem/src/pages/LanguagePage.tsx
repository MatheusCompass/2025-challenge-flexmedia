import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'
import type { Idioma } from '../types'

const IDIOMAS: { code: Idioma; label: string; flag: string }[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export default function LanguagePage() {
  const navigate = useNavigate()
  const { setIdioma, setFluxo, t } = useTotem()
  const [etapa, setEtapa] = useState<'idioma' | 'acao'>('idioma')

  function selecionarIdioma(code: Idioma) {
    setIdioma(code)
    setEtapa('acao')
  }

  function selecionarFluxo(fluxo: 'checkin' | 'checkout') {
    setFluxo(fluxo)
    navigate('/buscar-reserva')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 text-white gap-12">
      {etapa === 'idioma' ? (
        <>
          <h2 className="text-5xl font-bold text-center leading-tight">
            Selecione seu idioma<br />
            <span className="text-3xl text-slate-400">Select your language</span><br />
            <span className="text-3xl text-slate-400">Seleccione su idioma</span>
          </h2>
          <div className="flex gap-8">
            {IDIOMAS.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => selecionarIdioma(code)}
                className="flex flex-col items-center gap-4 px-16 py-10 bg-slate-800 hover:bg-blue-700 rounded-3xl text-3xl font-semibold transition-colors active:scale-95"
              >
                <span className="text-6xl">{flag}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-5xl font-bold">{t.telaInicial.boasVindas}</h2>
          <p className="text-2xl text-slate-400">{t.telaInicial.instrucao}</p>
          <div className="flex gap-8">
            <button
              onClick={() => selecionarFluxo('checkin')}
              className="px-16 py-10 bg-blue-600 hover:bg-blue-500 text-white text-3xl font-semibold rounded-3xl transition-colors active:scale-95"
            >
              {t.telaInicial.btnCheckin}
            </button>
            <button
              onClick={() => selecionarFluxo('checkout')}
              className="px-16 py-10 bg-slate-700 hover:bg-slate-600 text-white text-3xl font-semibold rounded-3xl transition-colors active:scale-95"
            >
              {t.telaInicial.btnCheckout}
            </button>
          </div>
        </>
      )}
      <button
        onClick={() => {
          if (etapa === 'acao') setEtapa('idioma')
          else navigate('/')
        }}
        className="text-slate-500 text-xl hover:text-slate-300 mt-4"
      >
        {t.geral.btnCancelar}
      </button>
    </div>
  )
}
