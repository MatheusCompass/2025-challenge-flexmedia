import { useEffect, useState } from 'react'
import type { Usuario } from '../types'
import { usuarioService, hotelService } from '../services/api'

interface UsuarioForm {
  nome: string
  email: string
  senha: string
  role: 'ADMIN' | 'OPERADOR'
  hotelId: number | null
}

interface Hotel {
  id: number
  nome: string
}

const EMPTY_FORM: UsuarioForm = {
  nome: '',
  email: '',
  senha: '',
  role: 'OPERADOR',
  hotelId: null,
}

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [hoteis, setHoteis] = useState<Hotel[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<UsuarioForm>({ ...EMPTY_FORM })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [usuariosData, hoteisData] = await Promise.all([
        usuarioService.listar(),
        hotelService.listar(),
      ])
      setUsuarios(usuariosData)
      setHoteis(hoteisData.content ?? hoteisData)
    } catch {
      setUsuarios([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm({ ...EMPTY_FORM })
    setErro(null)
    setSucesso(null)
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await usuarioService.cadastrar(form)
      setSucesso(`Usuário "${form.nome}" cadastrado com sucesso.`)
      setModalAberto(false)
      await carregar()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErro(msg ?? 'Erro ao cadastrar. Verifique os dados.')
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(u: Usuario) {
    if (!confirm(`Desativar "${u.nome}"? O usuário não conseguirá mais fazer login.`)) return
    try {
      await usuarioService.desativar(u.id)
      await carregar()
    } catch {
      alert('Erro ao desativar usuário.')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Usuários</h2>
        <button
          onClick={abrirNovo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo usuário
        </button>
      </div>

      {sucesso && (
        <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-400 text-sm rounded-lg">
          {sucesso}
        </div>
      )}

      {carregando ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Perfil</th>
                <th className="px-6 py-3 font-medium">Hotel</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.nome}</td>
                    <td className="px-6 py-4 text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Operador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {u.hotelId
                        ? (hoteis.find(h => h.id === u.hotelId)?.nome ?? `Hotel #${u.hotelId}`)
                        : <span className="text-slate-600 italic">Global</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.ativo
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-600 text-slate-400'
                      }`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.ativo && (
                        <button
                          onClick={() => desativar(u)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Desativar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal novo usuário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-6">Novo usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome *</label>
                <input
                  value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="email@hotel.com"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Senha * (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Perfil *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as 'ADMIN' | 'OPERADOR' }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="OPERADOR">Operador</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hotel (opcional)</label>
                <select
                  value={form.hotelId ?? ''}
                  onChange={e => setForm(p => ({ ...p, hotelId: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">— Acesso global —</option>
                  {hoteis.map(h => (
                    <option key={h.id} value={h.id}>{h.nome}</option>
                  ))}
                </select>
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
                onClick={salvar}
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
