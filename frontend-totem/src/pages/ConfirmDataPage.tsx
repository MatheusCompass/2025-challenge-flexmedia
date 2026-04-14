import { useNavigate } from 'react-router-dom'
import { useTotem } from '../context/TotemContext'

export default function ConfirmDataPage() {
  const navigate = useNavigate()
  const { t, reserva } = useTotem()

  if (!reserva) {
    navigate('/')
    return null
  }

  function confirmar() {
    navigate('/facial')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 text-white gap-10 px-16">
      <h2 className="text-5xl font-bold">{t.confirmarDados.titulo}</h2>

      <div className="w-full max-w-2xl bg-slate-800 rounded-3xl p-10 flex flex-col gap-6 text-2xl">
        <Row label={t.confirmarDados.nome} value={reserva.hospedeNome} />
        <Row label={t.confirmarDados.quarto} value={reserva.quartoNumero} />
        <Row label={t.confirmarDados.dataCheckin} value={reserva.dataCheckin} />
        <Row label={t.confirmarDados.dataCheckout} value={reserva.dataCheckout} />
      </div>

      <div className="flex gap-6 w-full max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-5 bg-slate-700 hover:bg-slate-600 text-white text-xl font-semibold rounded-2xl transition-colors active:scale-95"
        >
          {t.confirmarDados.btnVoltar}
        </button>
        <button
          onClick={confirmar}
          className="flex-2 flex-grow py-5 bg-blue-600 hover:bg-blue-500 text-white text-xl font-semibold rounded-2xl transition-colors active:scale-95"
        >
          {t.confirmarDados.btnConfirmar}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-700 pb-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
