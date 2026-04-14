package br.com.flexmedia.checkinhub.modules.checkout;

import br.com.flexmedia.checkinhub.common.exception.BusinessException;
import br.com.flexmedia.checkinhub.modules.hotel.Hotel;
import br.com.flexmedia.checkinhub.modules.hotel.Reserva;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaRepository;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaService;
import br.com.flexmedia.checkinhub.modules.hotel.StatusReserva;
import br.com.flexmedia.checkinhub.modules.keys.ChaveDigital;
import br.com.flexmedia.checkinhub.modules.keys.ChaveDigitalRepository;
import br.com.flexmedia.checkinhub.modules.keys.TipoChave;
import br.com.flexmedia.checkinhub.modules.metrics.MetricasService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock private ReservaService reservaService;
    @Mock private ReservaRepository reservaRepository;
    @Mock private ChaveDigitalRepository chaveDigitalRepository;
    @Mock private MetricasService metricasService;

    @InjectMocks
    private CheckoutService checkoutService;

    private Hotel hotelFixture() {
        return Hotel.builder().id(1L).nome("Hotel Test").cnpj("22.222.222/0001-22")
                .cidade("RJ").estado("RJ").build();
    }

    private Reserva reservaFixture(StatusReserva status) {
        return Reserva.builder()
                .id(20L)
                .codigoReserva("RES-002")
                .hospedeNome("Maria Souza")
                .hospedeCpf("222.333.444-55")
                .quartoNumero("202")
                .hotel(hotelFixture())
                .dataCheckin(LocalDate.now().minusDays(2))
                .dataCheckout(LocalDate.now())
                .status(status)
                .build();
    }

    private ChaveDigital chaveFixture(Reserva reserva) {
        return ChaveDigital.builder()
                .id(1L)
                .reserva(reserva)
                .token("TOKEN123")
                .tipo(TipoChave.DIGITAL)
                .ativa(true)
                .dataExpiracao(LocalDateTime.now().plusHours(2))
                .build();
    }

    @Test
    void confirmarCheckout_quandoStatusCheckinRealizado_realizaCheckoutComSucesso() {
        Reserva reserva = reservaFixture(StatusReserva.CHECKIN_REALIZADO);
        ChaveDigital chave = chaveFixture(reserva);
        when(reservaService.findOrThrow(20L)).thenReturn(reserva);
        when(chaveDigitalRepository.findByReservaIdAndAtivaTrue(20L)).thenReturn(List.of(chave));

        var result = checkoutService.confirmarCheckout(20L);

        assertThat(result.status()).isEqualTo(StatusReserva.CHECKOUT_REALIZADO);
        assertThat(chave.isAtiva()).isFalse();
        verify(reservaRepository).save(reserva);
        verify(metricasService).registrarCheckout(1L);
    }

    @Test
    void confirmarCheckout_quandoStatusNaoCheckinRealizado_lancaBusinessException() {
        Reserva reserva = reservaFixture(StatusReserva.CONFIRMADA);
        when(reservaService.findOrThrow(20L)).thenReturn(reserva);

        assertThatThrownBy(() -> checkoutService.confirmarCheckout(20L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Check-out não permitido");

        verify(reservaRepository, never()).save(any());
    }

    @Test
    void confirmarCheckout_semChavesAtivas_aindaRealizaCheckout() {
        Reserva reserva = reservaFixture(StatusReserva.CHECKIN_REALIZADO);
        when(reservaService.findOrThrow(20L)).thenReturn(reserva);
        when(chaveDigitalRepository.findByReservaIdAndAtivaTrue(20L)).thenReturn(List.of());

        var result = checkoutService.confirmarCheckout(20L);

        assertThat(result.status()).isEqualTo(StatusReserva.CHECKOUT_REALIZADO);
        verify(metricasService).registrarCheckout(1L);
    }
}
