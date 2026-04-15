import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'
import { checkinService } from '../services/api'

type Modo = 'camera' | 'dataNascimento'

export default function FacialRecognitionPage() {
  const navigate = useNavigate()
  const { t, fluxo, reserva } = useTotem()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const temDataNascimento = !!reserva?.hospedeDataNascimento
  const [modo, setModo] = useState<Modo>('camera')
  const [statusCamera, setStatusCamera] = useState<'aguardando' | 'processando' | 'sucesso'>('aguardando')
  const [cameraAtiva, setCameraAtiva] = useState(false)

  // DOB mode state
  const [dataNascimento, setDataNascimento] = useState('')
  const [erroData, setErroData] = useState<string | null>(null)
  const [confirmandoDob, setConfirmandoDob] = useState(false)

  async function prosseguir() {
    if (fluxo === 'checkin' && reserva?.id) {
      try { await checkinService.confirmar(reserva.id) } catch { /* ignora */ }
    }
    navigate(fluxo === 'checkout' ? '/checkout' : '/emitir-chave')
  }

  // Camera: start/stop when modo changes
  useEffect(() => {
    if (modo !== 'camera') {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      setCameraAtiva(false)
      setStatusCamera('aguardando')
      return
    }

    let cancelled = false

    async function iniciarCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream }
        setCameraAtiva(true)
        // Simulação MVP: auto-valida após 3 s
        setTimeout(() => {
          if (cancelled) return
          setStatusCamera('processando')
          setTimeout(() => {
            if (cancelled) return
            setStatusCamera('sucesso')
            setTimeout(() => { if (!cancelled) prosseguir() }, 1500)
          }, 1500)
        }, 3000)
      } catch {
        setCameraAtiva(false)
      }
    }

    iniciarCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [modo])

  async function confirmarDataNascimento() {
    if (!dataNascimento) {
      setErroData(t.verificacaoIdentidade.erroDataObrigatoria)
      return
    }
    if (dataNascimento !== reserva?.hospedeDataNascimento) {
      setErroData(t.verificacaoIdentidade.erroDataInvalida)
      return
    }
    setErroData(null)
    setConfirmandoDob(true)
    await prosseguir()
  }

  async function validarManualmente() {
    await prosseguir()
  }

  function trocarModo(novoModo: Modo) {
    setErroData(null)
    setDataNascimento('')
    setModo(novoModo)
  }

  const statusTexto = {
    aguardando: t.reconhecimentoFacial.instrucao,
    processando: t.reconhecimentoFacial.processando,
    sucesso: t.reconhecimentoFacial.sucesso,
  }
  const statusCor = {
    aguardando: 'border-blue-500',
    processando: 'border-yellow-400',
    sucesso: 'border-green-400',
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-slate-900 text-white gap-6 px-4 py-8">
      <h2 className="text-3xl md:text-5xl font-bold text-center">{t.reconhecimentoFacial.titulo}</h2>

      {/* Seletor de modo — só aparece se dataNascimento estiver cadastrada */}
      {temDataNascimento && (
        <div className="flex gap-2 bg-slate-800 rounded-2xl p-1">
          <button
            onClick={() => trocarModo('camera')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-base md:text-lg font-medium transition-colors ${
              modo === 'camera' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📷 {t.verificacaoIdentidade.btnCamera}
          </button>
          <button
            onClick={() => trocarModo('dataNascimento')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-base md:text-lg font-medium transition-colors ${
              modo === 'dataNascimento' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎂 {t.verificacaoIdentidade.btnDataNascimento}
          </button>
        </div>
      )}

      {/* ── Modo Câmera ── */}
      {modo === 'camera' && (
        <>
          <div className={`relative w-56 h-56 md:w-80 md:h-80 rounded-full overflow-hidden border-4 ${statusCor[statusCamera]} transition-colors duration-500`}>
            {cameraAtiva ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <span className="text-6xl">📷</span>
              </div>
            )}
            {statusCamera === 'sucesso' && (
              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                <span className="text-8xl">✓</span>
              </div>
            )}
          </div>

          <p className="text-lg md:text-2xl text-slate-300 text-center px-6 md:px-16">{statusTexto[statusCamera]}</p>

          {statusCamera === 'aguardando' && (
            <button
              onClick={validarManualmente}
              className="mt-2 px-6 py-3 md:px-10 md:py-4 bg-slate-700 hover:bg-slate-600 text-white text-base md:text-xl rounded-2xl transition-colors active:scale-95"
            >
              {t.reconhecimentoFacial.btnManual}
            </button>
          )}
        </>
      )}

      {/* ── Modo Data de Nascimento ── */}
      {modo === 'dataNascimento' && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="bg-slate-800 rounded-3xl p-6 md:p-8 w-full shadow-xl flex flex-col gap-4">
            <label className="text-slate-400 text-sm md:text-base">{t.verificacaoIdentidade.labelData}</label>
            <input
              type="date"
              value={dataNascimento}
              onChange={e => { setDataNascimento(e.target.value); setErroData(null) }}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-lg md:text-xl focus:outline-none focus:border-blue-500 [color-scheme:dark]"
            />
            {erroData && (
              <p className="text-red-400 text-sm md:text-base text-center">{erroData}</p>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white text-base md:text-xl rounded-2xl transition-colors active:scale-95"
            >
              {t.geral.btnVoltar}
            </button>
            <button
              onClick={confirmarDataNascimento}
              disabled={confirmandoDob}
              className="flex-1 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-base md:text-xl font-semibold rounded-2xl transition-colors active:scale-95"
            >
              {confirmandoDob ? t.geral.carregando : t.verificacaoIdentidade.btnConfirmar}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

