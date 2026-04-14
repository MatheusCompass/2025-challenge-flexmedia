import { useEffect, useState } from 'react'
import type { Hotel } from '../types'
import { hotelService } from '../services/api'

const EMPTY: Hotel = {
  id: 0, nome: '', cnpj: '', cidade: '', estado: '', ativo: true, createdAt: '',
}

export default function HotelsPage() {
  const [hoteis, setHoteis] = useState<Hotel[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<Partial<Hotel>>(EMPTY)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    try {
      const data = await hotelService.listar()
      setHoteis(data.content ?? data)
    } catch {
      setHoteis(MOCK_HOTEIS)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm({ ...EMPTY })
    setErro(null)
    setModalAberto(true)
  }

  function abrirEditar(h: Hotel) {
    setForm({ ...h })
    setErro(null)
    setModalAberto(true)
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    try {
      if (form.id) {
        await hotelService.atualizar(form.id, form)
      } else {
        await hotelService.criar(form)
      }
      setModalAberto(false)
      await carregar()
    } catch (e: unknown) {
      const data = (e as { response?: { data?: { detail?: string; message?: string } } })?.response?.data
      setErro(data?.detail ?? data?.message ?? 'Erro ao salvar. Verifique os dados.')
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(h: Hotel) {
    if (!confirm(`Desativar "${h.nome}"? Esta ação pode ser revertida pelo suporte.`)) return
    try {
      await hotelService.desativar(h.id)
      await carregar()
    } catch {
      alert('Erro ao desativar hotel.')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Hotéis</h2>
        <button
          onClick={abrirNovo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo hotel
        </button>
      </div>

      {carregando ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">CNPJ</th>
                <th className="px-6 py-3 font-medium">Cidade / Estado</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {hoteis.map(h => (
                <tr key={h.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{h.nome}</td>
                  <td className="px-6 py-4 text-slate-400">{h.cnpj}</td>
                  <td className="px-6 py-4 text-slate-400">{h.cidade} / {h.estado}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${h.ativo ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                      {h.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => abrirEditar(h)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
                      Editar
                    </button>
                    {h.ativo && (
                      <button
                        onClick={() => desativar(h)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-6">{form.id ? 'Editar hotel' : 'Novo hotel'}</h3>
            <div className="space-y-4">
              {(['nome', 'cnpj', 'cidade', 'estado'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 mb-1 capitalize">{field}</label>
                  <input
                    value={(form[field] as string) ?? ''}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
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
                onClick={salvar}
                disabled={salvando}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MOCK_HOTEIS: Hotel[] = [
  { id: 1, nome: 'Grand Palace Hotel', cnpj: '11.222.333/0001-44', cidade: 'São Paulo', estado: 'SP', ativo: true, createdAt: '' },
  { id: 2, nome: 'Ocean View Resort', cnpj: '55.666.777/0001-88', cidade: 'Florianópolis', estado: 'SC', ativo: true, createdAt: '' },
  { id: 3, nome: 'Pousada Serra Verde', cnpj: '99.000.111/0001-22', cidade: 'Gramado', estado: 'RS', ativo: false, createdAt: '' },
]
