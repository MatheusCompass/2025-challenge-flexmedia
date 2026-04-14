package br.com.flexmedia.checkinhub.modules.keys;

import br.com.flexmedia.checkinhub.common.exception.BusinessException;
import br.com.flexmedia.checkinhub.modules.hotel.Hotel;
import br.com.flexmedia.checkinhub.modules.hotel.Reserva;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaService;
import br.com.flexmedia.checkinhub.modules.hotel.StatusReserva;
import br.com.flexmedia.checkinhub.modules.metrics.MetricasService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChavesServiceTest {

    @Mock private ChaveDigitalRepository chaveDigitalRepository;
    @Mock private ReservaService reservaService;
    @Mock private MetricasService metricasService;

    @InjectMocks
    private ChavesService chavesService;

    private Reserva reservaFixture(StatusReserva status) {
        Hotel hotel = Hotel.builder().id(1L).nome("Hotel").cnpj("33.333.333/0001-33")
                .cidade("BH").estado("MG").build();
        return Reserva.builder()
                .id(30L)
                .codigoReserva("RES-003")
                .hospedeNome("Carlos Lima")
                .hospedeCpf("333.444.555-66")
                .quartoNumero("303")
                .hotel(hotel)
                .dataCheckin(LocalDate.now())
                .dataCheckout(LocalDate.now().plusDays(2))
                .status(status)
                .build();
    }

    @Test
    void emitirChave_quandoCheckinRealizado_retornaChaveComToken() {
        Reserva reserva = reservaFixture(StatusReserva.CHECKIN_REALIZADO);
        when(reservaService.findOrThrow(30L)).thenReturn(reserva);
        when(chaveDigitalRepository.findByReservaIdAndAtivaTrue(30L)).thenReturn(List.of());
        when(chaveDigitalRepository.save(any(ChaveDigital.class))).thenAnswer(inv -> {
            ChaveDigital c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        var result = chavesService.emitirChave(30L);

        assertThat(result.token()).isNotBlank();
        assertThat(result.tipo()).isEqualTo(TipoChave.DIGITAL);
        verify(metricasService).registrarChaveEmitida(1L);
    }

    @Test
    void emitirChave_invalidaChaveAntigaAntesDeCriarNova() {
        Reserva reserva = reservaFixture(StatusReserva.CHECKIN_REALIZADO);
        ChaveDigital chaveAntiga = ChaveDigital.builder()
                .id(99L).reserva(reserva).token("OLD").tipo(TipoChave.DIGITAL).ativa(true)
                .dataExpiracao(java.time.LocalDateTime.now().plusHours(1))
                .build();
        when(reservaService.findOrThrow(30L)).thenReturn(reserva);
        when(chaveDigitalRepository.findByReservaIdAndAtivaTrue(30L)).thenReturn(List.of(chaveAntiga));
        when(chaveDigitalRepository.save(any(ChaveDigital.class))).thenAnswer(inv -> inv.getArgument(0));

        chavesService.emitirChave(30L);

        assertThat(chaveAntiga.isAtiva()).isFalse();
        // save chamado para chave antiga (inativa) + nova chave = 2 vezes
        verify(chaveDigitalRepository, times(2)).save(any(ChaveDigital.class));
    }

    @Test
    void emitirChave_quandoStatusNaoCheckinRealizado_lancaBusinessException() {
        Reserva reserva = reservaFixture(StatusReserva.CONFIRMADA);
        when(reservaService.findOrThrow(30L)).thenReturn(reserva);

        assertThatThrownBy(() -> chavesService.emitirChave(30L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("após check-in confirmado");

        verify(chaveDigitalRepository, never()).save(any());
    }
}
