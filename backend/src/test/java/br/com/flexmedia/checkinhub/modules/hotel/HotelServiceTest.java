package br.com.flexmedia.checkinhub.modules.hotel;

import br.com.flexmedia.checkinhub.common.exception.BusinessException;
import br.com.flexmedia.checkinhub.common.exception.ResourceNotFoundException;
import br.com.flexmedia.checkinhub.modules.hotel.dto.HotelRequestDTO;
import br.com.flexmedia.checkinhub.modules.hotel.dto.HotelResponseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private HotelService hotelService;

    private Hotel hotelFixture() {
        return Hotel.builder()
                .id(1L).nome("Hotel Teste").cnpj("12.345.678/0001-99")
                .cidade("São Paulo").estado("SP").ativo(true)
                .build();
    }

    @Test
    void listar_retornaPaginaDeHoteis() {
        when(hotelRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(hotelFixture())));

        var result = hotelService.listar(PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).nome()).isEqualTo("Hotel Teste");
    }

    @Test
    void criar_quandoCnpjNovo_retornaHotelCriado() {
        var request = new HotelRequestDTO("Hotel Novo", "12.345.678/0001-99", "Rio", "RJ");
        when(hotelRepository.existsByCnpj("12.345.678/0001-99")).thenReturn(false);
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotelFixture());

        HotelResponseDTO result = hotelService.criar(request);

        assertThat(result.nome()).isEqualTo("Hotel Teste");
        verify(hotelRepository).save(any(Hotel.class));
    }

    @Test
    void criar_quandoCnpjDuplicado_lancaBusinessException() {
        var request = new HotelRequestDTO("Outro Hotel", "12.345.678/0001-99", "SP", "SP");
        when(hotelRepository.existsByCnpj("12.345.678/0001-99")).thenReturn(true);

        assertThatThrownBy(() -> hotelService.criar(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("CNPJ já cadastrado");

        verify(hotelRepository, never()).save(any());
    }

    @Test
    void buscarPorId_quandoExiste_retornaHotel() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotelFixture()));

        HotelResponseDTO result = hotelService.buscarPorId(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.cidade()).isEqualTo("São Paulo");
    }

    @Test
    void buscarPorId_quandoNaoExiste_lancaResourceNotFoundException() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hotelService.buscarPorId(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void desativar_quandoExiste_defineAtivoComoFalse() {
        Hotel hotel = hotelFixture();
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        hotelService.desativar(1L);

        assertThat(hotel.isAtivo()).isFalse();
        verify(hotelRepository).save(hotel);
    }

    @Test
    void atualizar_quandoExiste_atualizaCampos() {
        Hotel hotel = hotelFixture();
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any())).thenReturn(hotel);

        var request = new HotelRequestDTO("Nome Atualizado", "12.345.678/0001-99", "Campinas", "SP");
        HotelResponseDTO result = hotelService.atualizar(1L, request);

        assertThat(hotel.getNome()).isEqualTo("Nome Atualizado");
        assertThat(hotel.getCidade()).isEqualTo("Campinas");
    }
}
