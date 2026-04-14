package br.com.flexmedia.checkinhub.modules.keys;

import br.com.flexmedia.checkinhub.modules.hotel.Hotel;
import br.com.flexmedia.checkinhub.modules.hotel.HotelRepository;
import br.com.flexmedia.checkinhub.modules.hotel.Reserva;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaRepository;
import br.com.flexmedia.checkinhub.modules.hotel.StatusReserva;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ChavesControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired HotelRepository hotelRepository;
    @Autowired ReservaRepository reservaRepository;
    @Autowired ChaveDigitalRepository chaveDigitalRepository;

    private Hotel hotel;

    @BeforeEach
    void setUp() {
        hotel = hotelRepository.save(Hotel.builder()
                .nome("Hotel Chaves IT")
                .cnpj("33.444.555/0001-77")
                .cidade("Brasília").estado("DF")
                .build());
    }

    private Reserva salvarReserva(String codigo, StatusReserva status) {
        return reservaRepository.save(Reserva.builder()
                .codigoReserva(codigo)
                .hospedeNome("Hóspede " + codigo)
                .hospedeCpf("000.111.222-33")
                .hospedeEmail("hospede@test.com")
                .quartoNumero("301")
                .hotel(hotel)
                .dataCheckin(LocalDate.now())
                .dataCheckout(LocalDate.now().plusDays(3))
                .status(status)
                .build());
    }

    @Test
    void emitirChave_comCheckinRealizado_retorna201ComToken() throws Exception {
        Reserva reserva = salvarReserva("RES-CH-001", StatusReserva.CHECKIN_REALIZADO);

        mockMvc.perform(post("/api/chaves/" + reserva.getId()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo").value("DIGITAL"))
                .andExpect(jsonPath("$.ativa").value(true));
    }

    @Test
    void emitirChave_semCheckin_retorna422() throws Exception {
        Reserva reserva = salvarReserva("RES-CH-002", StatusReserva.CONFIRMADA);

        mockMvc.perform(post("/api/chaves/" + reserva.getId()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail")
                        .value(org.hamcrest.Matchers.containsString("após check-in confirmado")));
    }

    @Test
    void emitirChave_reservaInexistente_retorna404() throws Exception {
        mockMvc.perform(post("/api/chaves/77777"))
                .andExpect(status().isNotFound());
    }

    @Test
    void emitirChave_reemissao_invalidaChaveAnteriorECriaNovaChave() throws Exception {
        Reserva reserva = salvarReserva("RES-CH-003", StatusReserva.CHECKIN_REALIZADO);

        // Emite a primeira chave
        String resp1 = mockMvc.perform(post("/api/chaves/" + reserva.getId()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Reemite — deve invalidar a anterior e emitir nova
        String resp2 = mockMvc.perform(post("/api/chaves/" + reserva.getId()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Tokens devem ser diferentes
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        String token1 = mapper.readTree(resp1).get("token").asText();
        String token2 = mapper.readTree(resp2).get("token").asText();
        assertThat(token1).isNotEqualTo(token2);

        // Somente 1 chave ativa no banco
        var ativas = chaveDigitalRepository.findByReservaIdAndAtivaTrue(reserva.getId());
        assertThat(ativas).hasSize(1);
        assertThat(ativas.get(0).getToken()).isEqualTo(token2);
    }

    @Test
    void emitirChave_aposCheckout_retorna422() throws Exception {
        Reserva reserva = salvarReserva("RES-CH-004", StatusReserva.CHECKOUT_REALIZADO);

        mockMvc.perform(post("/api/chaves/" + reserva.getId()))
                .andExpect(status().isUnprocessableEntity());
    }
}
