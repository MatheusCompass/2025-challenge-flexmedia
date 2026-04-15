import { useEffect, useState } from 'react'
import type { ConteudoTotem } from '../types'
import { conteudoService, hotelService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TIPO_LABEL = { SLIDE: 'Slide', BANNER: 'Banner', VIDEO: 'Vídeo' }

const EMPTY_FORM = (hotelId: number): Partial<ConteudoTotem> => ({
  tipo: 'SLIDE', titulo: '', urlMidia: '', ordemExibicao: 1, ativo: true, hotelId,
})

export default function ContentPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'ADMIN'

  // ADMIN pode selecionar qualquer hotel; OPERADOR usa o seu hotelId
  const [hotelIdSelecionado, setHotelIdSelecionado] = useState<number>(
    usuario?.hotelId ?? 1
  )
  const [hoteis, setHoteis] = useState<{ id: number; nome: string }[]>([])

  const [itens, setItens] = useState<ConteudoTotem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<Partial<ConteudoTotem>>(EMPTY_FORM(hotelIdSelecionado))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Carrega lista de hotéis para o selector do ADMIN
  useEffect(() => {
    if (isAdmin) {
      hotelService.listar(0, 100)
        .then(data => setHoteis(data.content ?? data))
        .catch(() => {})
    }
  }, [isAdmin])

  async function carregar() {
    setCarregando(true)
    try {
      const data = await conteudoService.listar(hotelIdSelecionado)
      setItens(data)
    } catch {
      setItens(MOCK_CONTEUDO)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [hotelIdSelecionado]) // eslint-disable-line

  function abrirNovo() {
    setForm(EMPTY_FORM(hotelIdSelecionado))
    setErro(null)
    setModalAberto(true)
  }

  function abrirEditar(item: ConteudoTotem) {
    setForm({ ...item })
    setErro(null)
    setModalAberto(true)
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    try {
      if (form.id) {
        await conteudoService.atualizar(form.id, form)
      } else {
        await conteudoService.criar({ ...form, hotelId: hotelIdSelecionado })
      }
      setModalAberto(false)
      await carregar()
    } catch {
      setErro('Erro ao salvar conteúdo.')
    } finally {
      setSalvando(false)
    }
  }

  async function remover(id: number) {
    if (!confirm('Remover este conteúdo?')) return
    try {
      await conteudoService.remover(id)
      await carregar()
    } catch {
      // ignora em dev
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Conteúdo do Totem</h2>
          {isAdmin && hoteis.length > 0 && (
            <select
              value={hotelIdSelecionado}
              onChange={e => setHotelIdSelecionado(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {hoteis.map(h => (
                <option key={h.id} value={h.id}>{h.nome}</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={abrirNovo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo conteúdo
        </button>
      </div>

      {carregando ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itens.map(item => (
            <div
              key={item.id}
              className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* Preview */}
              <div className="h-36 bg-slate-700 flex items-center justify-center relative">
                {item.tipo === 'VIDEO' ? (
                  <span className="text-4xl">🎬</span>
                ) : (
                  <img
                    src={item.urlMidia}
                    alt={item.titulo}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-slate-900/80 text-slate-300 rounded-full">
                  {TIPO_LABEL[item.tipo]}
                </span>
                {!item.ativo && (
                  <span className="absolute top-2 left-2 text-xs px-2 py-0.5 bg-slate-600 text-slate-400 rounded-full">
                    Inativo
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-sm truncate">{item.titulo}</p>
                <p className="text-xs text-slate-500 mt-0.5">Ordem: {item.ordemExibicao}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => abrirEditar(item)}
                    className="flex-1 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remover(item.id)}
                    className="flex-1 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-6">{form.id ? 'Editar conteúdo' : 'Novo conteúdo'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(p => ({ ...p, tipo: e.target.value as ConteudoTotem['tipo'] }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="SLIDE">Slide</option>
                  <option value="BANNER">Banner</option>
                  <option value="VIDEO">Vídeo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Título</label>
                <input
                  value={form.titulo ?? ''}
                  onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">URL da mídia</label>
                <input
                  value={form.urlMidia ?? ''}
                  onChange={e => setForm(p => ({ ...p, urlMidia: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ordem de exibição</label>
                <input
                  type="number"
                  min={1}
                  value={form.ordemExibicao ?? 1}
                  onChange={e => setForm(p => ({ ...p, ordemExibicao: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo ?? true}
                  onChange={e => setForm(p => ({ ...p, ativo: e.target.checked }))}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm text-slate-300">Ativo</span>
              </label>
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

const MOCK_CONTEUDO: ConteudoTotem[] = [
  { id: 1, hotelId: 1, tipo: 'SLIDE', titulo: 'Bem-vindo ao Grand Palace', urlMidia: 'https://placehold.co/400x200/1e40af/white?text=Slide+1', ordemExibicao: 1, ativo: true },
  { id: 2, hotelId: 1, tipo: 'BANNER', titulo: 'Restaurante aberto até 23h', urlMidia: 'https://placehold.co/400x200/065f46/white?text=Banner+1', ordemExibicao: 2, ativo: true },
  { id: 3, hotelId: 1, tipo: 'VIDEO', titulo: 'Tour pelo hotel', urlMidia: '', ordemExibicao: 3, ativo: false },
]
