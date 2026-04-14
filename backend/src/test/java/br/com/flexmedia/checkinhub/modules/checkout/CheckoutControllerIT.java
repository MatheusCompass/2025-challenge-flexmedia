package br.com.flexmedia.checkinhub.modules.checkout;

import br.com.flexmedia.checkinhub.modules.hotel.Hotel;
import br.com.flexmedia.checkinhub.modules.hotel.HotelRepository;
import br.com.flexmedia.checkinhub.modules.hotel.Reserva;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaRepository;
import br.com.flexmedia.checkinhub.modules.hotel.StatusReserva;
import br.com.flexmedia.checkinhub.modules.keys.ChaveDigital;
import br.com.flexmedia.checkinhub.modules.keys.ChaveDigitalRepository;
import br.com.flexmedia.checkinhub.modules.keys.TipoChave;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CheckoutControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired HotelRepository hotelRepository;
    @Autowired ReservaRepository reservaRepository;
    @Autowired ChaveDigitalRepository chaveDigitalRepository;

    private Hotel hotel;

    @BeforeEach
    void setUp() {
        hotel = hotelRepository.save(Hotel.builder()
                .nome("Hotel Checkout IT")
                .cnpj("99.888.777/0001-66")
                .cidade("Rio de Janeiro").estado("RJ")
                .build());
    }

    private Reserva salvarReserva(String codigo, String cpf, StatusReserva status) {
        return reservaRepository.save(Reserva.builder()
                .codigoReserva(codigo)
                .hospedeNome("Hóspede " + codigo)
                .hospedeCpf(cpf)
                .hospedeEmail("hospede@test.com")
                .quartoNumero("201")
                .hotel(hotel)
                .dataCheckin(LocalDate.now().minusDays(1))
                .dataCheckout(LocalDate.now())
                .status(status)
                .build());
    }

    // ── Busca de reserva ──────────────────────────────────────────────────────

    @Test
    void buscar_porCodigoComCheckin_retorna200() throws Exception {
        salvarReserva("RES-CO-001", "111.111.111-11", StatusReserva.CHECKIN_REALIZADO);

        mockMvc.perform(get("/api/checkout/reserva/RES-CO-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoReserva").value("RES-CO-001"))
                .andExpect(jsonPath("$.status").value("CHECKIN_REALIZADO"));
    }

    @Test
    void buscar_reservaInexistente_retorna422() throws Exception {
        mockMvc.perform(get("/api/checkout/reserva/RES-FANTASMA"))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── Confirmação de check-out ──────────────────────────────────────────────

    @Test
    void confirmarCheckout_comCheckinRealizado_retorna200EStatusCheckoutRealizado() throws Exception {
        Reserva reserva = salvarReserva("RES-CO-002", "222.222.222-22", StatusReserva.CHECKIN_REALIZADO);

        mockMvc.perform(post("/api/checkout/confirmar/" + reserva.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKOUT_REALIZADO"));
    }

    @Test
    void confirmarCheckout_invalidaChavesAtivasAoConfirmar() throws Exception {
        Reserva reserva = salvarReserva("RES-CO-003", "333.333.333-33", StatusReserva.CHECKIN_REALIZADO);

        // Emite uma chave ativa para a reserva
        chaveDigitalRepository.save(ChaveDigital.builder()
                .reserva(reserva)
                .token("TOKEN-ATIVO-CO")
                .tipo(TipoChave.DIGITAL)
                .ativa(true)
                .dataExpiracao(LocalDateTime.now().plusHours(12))
                .build());

        mockMvc.perform(post("/api/checkout/confirmar/" + reserva.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKOUT_REALIZADO"));

        // Verifica no banco que a chave foi invalidada
        var chaves = chaveDigitalRepository.findByReservaIdAndAtivaTrue(reserva.getId());
        org.assertj.core.api.Assertions.assertThat(chaves).isEmpty();
    }

    @Test
    void confirmarCheckout_semCheckinPrevio_retorna422() throws Exception {
        // Reserva CONFIRMADA (sem check-in) não pode fazer check-out
        Reserva reserva = salvarReserva("RES-CO-004", "444.444.444-44", StatusReserva.CONFIRMADA);

        mockMvc.perform(post("/api/checkout/confirmar/" + reserva.getId()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Check-out não permitido")));
    }

    @Test
    void confirmarCheckout_reservaInexistente_retorna404() throws Exception {
        mockMvc.perform(post("/api/checkout/confirmar/88888"))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirmarCheckout_checkoutDuplicado_retorna422() throws Exception {
        // Reserva já finalizada não pode fazer checkout novamente
        Reserva reserva = salvarReserva("RES-CO-005", "555.555.555-55", StatusReserva.CHECKOUT_REALIZADO);

        mockMvc.perform(post("/api/checkout/confirmar/" + reserva.getId()))
                .andExpect(status().isUnprocessableEntity());
    }
}
