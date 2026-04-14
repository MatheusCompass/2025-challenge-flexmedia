import { useEffect, useState } from 'react'
import type { Reserva } from '../types'
import { hotelService, reservaService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABEL: Record<Reserva['status'], string> = {
  CONFIRMADA: 'Confirmada',
  CHECKIN_REALIZADO: 'Check-in feito',
  CHECKOUT_REALIZADO: 'Check-out feito',
  CANCELADA: 'Cancelada',
}

const STATUS_COR: Record<Reserva['status'], string> = {
  CONFIRMADA: 'bg-blue-500/20 text-blue-400',
  CHECKIN_REALIZADO: 'bg-green-500/20 text-green-400',
  CHECKOUT_REALIZADO: 'bg-slate-600 text-slate-400',
  CANCELADA: 'bg-red-500/20 text-red-400',
}

interface ReservaForm {
  codigoReserva: string
  hospedeNome: string
  hospedeCpf: string
  hospedeEmail: string
  quartoNumero: string
  hotelId: number
  dataCheckin: string
  dataCheckout: string
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM = (hotelId: number): ReservaForm => ({
  codigoReserva: '',
  hospedeNome: '',
  hospedeCpf: '',
  hospedeEmail: '',
  quartoNumero: '',
  hotelId,
  dataCheckin: today,
  dataCheckout: today,
})

export default function ReservationsPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'

  const [reservas, setReservas] = useState<Reserva[]>([])
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<Reserva['status'] | ''>('')
  const [carregando, setCarregando] = useState(true)
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [hoteis, setHoteis] = useState<{ id: number; nome: string }[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [form, setForm] = useState<ReservaForm>(() => EMPTY_FORM(usuario?.hotelId ?? 1))

  useEffect(() => {
    hotelService.listar(0, 100)
      .then(data => {
        const lista = data.content ?? data
        setHoteis(lista)
        const hotelInicial = usuario?.hotelId ?? lista[0]?.id ?? 1
        setForm(EMPTY_FORM(hotelInicial))
      })
      .catch(() => {})
  }, [usuario?.hotelId])

  async function carregar(p = 0, q = '', status = '') {
    setCarregando(true)
    try {
      const data = await reservaService.listar({
        page: p,
        size: 20,
        busca: q || undefined,
        status: status || undefined,
      })
      const lista = data.content ?? data
      setReservas(lista)
      setTotalPaginas(data.totalPages ?? 1)
      setPagina(p)
    } catch {
      setReservas(MOCK_RESERVAS)
      setTotalPaginas(1)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function handleBusca() { carregar(0, busca, statusFiltro) }

  function handleStatusChange(s: Reserva['status'] | '') {
    setStatusFiltro(s)
    carregar(0, busca, s)
  }

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR')

  function abrirNovo() {
    const hotelPadrao = usuario?.hotelId ?? hoteis[0]?.id ?? 1
    setForm(EMPTY_FORM(hotelPadrao))
    setErro(null)
    setModalAberto(true)
  }

  async function salvarReserva() {
    if (!form.codigoReserva || !form.hospedeNome || !form.hospedeCpf || !form.quartoNumero) {
      setErro('Preencha os campos obrigatórios.')
      return
    }

    setSalvando(true)
    setErro(null)
    try {
      await reservaService.criar(form)
      setModalAberto(false)
      await carregar(0, busca, statusFiltro)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErro(msg ?? 'Erro ao cadastrar reserva.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Reservas</h2>
        <button
          onClick={abrirNovo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nova reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBusca()}
          placeholder="Nome, CPF ou código da reserva..."
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={statusFiltro}
          onChange={e => handleStatusChange(e.target.value as Reserva['status'] | '')}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="CONFIRMADA">Confirmada</option>
          <option value="CHECKIN_REALIZADO">Check-in feito</option>
          <option value="CHECKOUT_REALIZADO">Check-out feito</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
        <button
          onClick={handleBusca}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Buscar
        </button>
      </div>

      {carregando ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="px-6 py-3 font-medium">Código</th>
                  <th className="px-6 py-3 font-medium">Hóspede</th>
                  <th className="px-6 py-3 font-medium">Quarto</th>
                  <th className="px-6 py-3 font-medium">Check-in</th>
                  <th className="px-6 py-3 font-medium">Check-out</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => (
                  <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{r.codigoReserva}</td>
                    <td className="px-6 py-4 font-medium">{r.hospedeNome}</td>
                    <td className="px-6 py-4 text-slate-400">{r.quartoNumero}</td>
                    <td className="px-6 py-4 text-slate-400">{formatarData(r.dataCheckin)}</td>
                    <td className="px-6 py-4 text-slate-400">{formatarData(r.dataCheckout)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center gap-3 mt-4 justify-center">
              <button
                onClick={() => carregar(pagina - 1, busca)}
                disabled={pagina === 0}
                className="px-3 py-1.5 bg-slate-700 disabled:opacity-40 text-white text-sm rounded-lg"
              >
                ← Anterior
              </button>
              <span className="text-sm text-slate-400">{pagina + 1} / {totalPaginas}</span>
              <button
                onClick={() => carregar(pagina + 1, busca)}
                disabled={pagina >= totalPaginas - 1}
                className="px-3 py-1.5 bg-slate-700 disabled:opacity-40 text-white text-sm rounded-lg"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-6">Nova reserva</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Código da reserva *</label>
                <input
                  value={form.codigoReserva}
                  onChange={e => setForm(p => ({ ...p, codigoReserva: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome do hóspede *</label>
                <input
                  value={form.hospedeNome}
                  onChange={e => setForm(p => ({ ...p, hospedeNome: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">CPF *</label>
                <input
                  value={form.hospedeCpf}
                  onChange={e => setForm(p => ({ ...p, hospedeCpf: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.hospedeEmail}
                  onChange={e => setForm(p => ({ ...p, hospedeEmail: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quarto *</label>
                <input
                  value={form.quartoNumero}
                  onChange={e => setForm(p => ({ ...p, quartoNumero: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              {isAdmin ? (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hotel *</label>
                  <select
                    value={form.hotelId}
                    onChange={e => setForm(p => ({ ...p, hotelId: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  >
                    {hoteis.map(h => (
                      <option key={h.id} value={h.id}>{h.nome}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hotel</label>
                  <p className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300">
                    {hoteis.find(h => h.id === form.hotelId)?.nome ?? `Hotel #${form.hotelId}`}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Check-in *</label>
                  <input
                    type="date"
                    value={form.dataCheckin}
                    onChange={e => setForm(p => ({ ...p, dataCheckin: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Check-out *</label>
                  <input
                    type="date"
                    value={form.dataCheckout}
                    onChange={e => setForm(p => ({ ...p, dataCheckout: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
            </div>
            {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarReserva}
                disabled={salvando}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {salvando ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MOCK_RESERVAS: Reserva[] = [
  { id: 1, codigoReserva: 'RES-001', hospedeNome: 'João Silva', hospedeCpf: '111.222.333-44', hospedeEmail: 'joao@email.com', quartoNumero: '201', hotelId: 1, dataCheckin: '2026-04-14', dataCheckout: '2026-04-17', status: 'CHECKIN_REALIZADO' },
  { id: 2, codigoReserva: 'RES-002', hospedeNome: 'Maria Souza', hospedeCpf: '555.666.777-88', hospedeEmail: 'maria@email.com', quartoNumero: '305', hotelId: 1, dataCheckin: '2026-04-15', dataCheckout: '2026-04-18', status: 'CONFIRMADA' },
  { id: 3, codigoReserva: 'RES-003', hospedeNome: 'Carlos Lima', hospedeCpf: '999.000.111-22', hospedeEmail: 'carlos@email.com', quartoNumero: '102', hotelId: 2, dataCheckin: '2026-04-10', dataCheckout: '2026-04-14', status: 'CHECKOUT_REALIZADO' },
]
