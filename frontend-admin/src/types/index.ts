export interface Hotel {
  id: number
  nome: string
  cnpj: string
  cidade: string
  estado: string
  ativo: boolean
  createdAt: string
}

export interface Reserva {
  id: number
  codigoReserva: string
  hospedeNome: string
  hospedeCpf: string
  hospedeEmail: string
  quartoNumero: string
  hotelId: number
  dataCheckin: string
  dataCheckout: string
  status: 'CONFIRMADA' | 'CHECKIN_REALIZADO' | 'CHECKOUT_REALIZADO' | 'CANCELADA'
}

export interface MetricasDia {
  data: string
  totalCheckins: number
  totalCheckouts: number
  ocupacao: number
}

export interface ConteudoTotem {
  id: number
  hotelId: number
  tipo: 'SLIDE' | 'BANNER' | 'VIDEO'
  titulo: string
  urlMidia: string
  ordemExibicao: number
  ativo: boolean
}

export interface Usuario {
  id: number
  nome: string
  email: string
  role: 'ADMIN' | 'OPERADOR'
  hotelId: number | null
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
