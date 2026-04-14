import axios from 'axios'
import type { Reserva, ChaveEmitida } from '../types'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

export const checkinService = {
  buscarReserva: (codigo: string): Promise<Reserva> =>
    api.post('/checkin/buscar-reserva', { codigo }).then(r => r.data),

  confirmar: (reservaId: string): Promise<void> =>
    api.post('/checkin/confirmar', { reservaId }).then(r => r.data),
}

export const checkoutService = {
  iniciar: (reservaId: string): Promise<Reserva> =>
    api.post('/checkout/iniciar', { reservaId }).then(r => r.data),

  confirmar: (reservaId: string): Promise<void> =>
    api.post('/checkout/confirmar', { reservaId }).then(r => r.data),
}

export const chavesService = {
  emitir: (reservaId: string): Promise<ChaveEmitida> =>
    api.post('/chaves/emitir', { reservaId }).then(r => r.data),
}
