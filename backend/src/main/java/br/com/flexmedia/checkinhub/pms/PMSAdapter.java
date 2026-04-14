package br.com.flexmedia.checkinhub.pms;

/**
 * Adapter de integração com sistemas PMS hoteleiros.
 * Implementar esta interface para suportar diferentes fornecedores
 * (Opera, TOTVS Hiper, etc.) sem alterar o core da aplicação.
 */
public interface PMSAdapter {

    /**
     * Busca uma reserva no PMS pelo código de reserva.
     *
     * @param codigoReserva código único da reserva
     * @return dados da reserva encontrada
     * @throws br.com.flexmedia.checkinhub.pms.exception.ReservaNaoEncontradaException se não encontrada
     */
    PMSReservaDTO buscarReserva(String codigoReserva);

    /**
     * Confirma o check-in no PMS, atualizando o status do quarto.
     *
     * @param reservaId identificador interno da reserva
     */
    void confirmarCheckin(String reservaId);

    /**
     * Confirma o check-out no PMS e libera o quarto.
     *
     * @param reservaId identificador interno da reserva
     */
    void confirmarCheckout(String reservaId);
}
