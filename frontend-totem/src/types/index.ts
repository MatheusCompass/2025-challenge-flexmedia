export type Idioma = 'pt' | 'en' | 'es'

export type StatusReserva = 'CONFIRMADA' | 'CHECKIN_REALIZADO' | 'CHECKOUT_REALIZADO' | 'CANCELADA'

export type TipoChave = 'DIGITAL' | 'RFID'

export interface Reserva {
  id: number
  codigoReserva: string
  hospedeNome: string
  hospedeCpf: string
  hospedeEmail: string
  quartoNumero: string
  dataCheckin: string
  dataCheckout: string
  status: StatusReserva
}

export interface ChaveEmitida {
  tipo: TipoChave
  token: string
  dataEmissao: string
}
