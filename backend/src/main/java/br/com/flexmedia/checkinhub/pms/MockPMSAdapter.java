package br.com.flexmedia.checkinhub.pms;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Implementação mock do PMSAdapter para desenvolvimento e testes.
 * Ativada quando app.pms.adapter=mock (padrão).
 */
@Component
@ConditionalOnProperty(name = "app.pms.adapter", havingValue = "mock", matchIfMissing = true)
public class MockPMSAdapter implements PMSAdapter {

    @Override
    public PMSReservaDTO buscarReserva(String codigoReserva) {
        if ("INVALIDO".equalsIgnoreCase(codigoReserva)) {
            throw new RuntimeException("Reserva não encontrada: " + codigoReserva);
        }
        return PMSReservaDTO.builder()
                .codigoReserva(codigoReserva)
                .hospedeNome("João da Silva")
                .hospedeCpf("123.456.789-00")
                .hospedeEmail("joao.silva@email.com")
                .quartoNumero("205")
                .dataCheckin(LocalDate.now())
                .dataCheckout(LocalDate.now().plusDays(3))
                .status("CONFIRMADA")
                .build();
    }

    @Override
    public void confirmarCheckin(String reservaId) {
        // Mock: log sem ação real
    }

    @Override
    public void confirmarCheckout(String reservaId) {
        // Mock: log sem ação real
    }
}
