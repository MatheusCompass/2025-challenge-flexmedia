import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'

export default function FacialRecognitionPage() {
  const navigate = useNavigate()
  const { t, fluxo } = useTotem()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'aguardando' | 'processando' | 'sucesso'>('aguardando')
  const [cameraAtiva, setCameraAtiva] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function iniciarCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraAtiva(true)
        }
        // Simulação MVP: valida após 3 segundos com câmera ativa
        setTimeout(() => {
          setStatus('processando')
          setTimeout(() => {
            setStatus('sucesso')
            setTimeout(() => {
              const proxima = fluxo === 'checkout' ? '/checkout' : '/emitir-chave'
              navigate(proxima)
            }, 1500)
          }, 1500)
        }, 3000)
      } catch {
        // Câmera não disponível — permite avanço manual
        setCameraAtiva(false)
      }
    }

    iniciarCamera()

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

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

  function validarManualmente() {
    const proxima = fluxo === 'checkout' ? '/checkout' : '/emitir-chave'
    navigate(proxima)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 text-white gap-8">
      <h2 className="text-5xl font-bold">{t.reconhecimentoFacial.titulo}</h2>

      {/* Visor da câmera */}
      <div className={`relative w-80 h-80 rounded-full overflow-hidden border-4 ${statusCor[status]} transition-colors duration-500`}>
        {cameraAtiva ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-6xl">📷</span>
          </div>
        )}
        {status === 'sucesso' && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
            <span className="text-8xl">✓</span>
          </div>
        )}
      </div>

      <p className="text-2xl text-slate-300 text-center px-16">{statusTexto[status]}</p>

      {/* Botão de fallback manual */}
      {status === 'aguardando' && (
        <button
          onClick={validarManualmente}
          className="mt-4 px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white text-xl rounded-2xl transition-colors active:scale-95"
        >
          {t.reconhecimentoFacial.btnManual}
        </button>
      )}
    </div>
  )
}
