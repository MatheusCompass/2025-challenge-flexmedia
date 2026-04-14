package br.com.flexmedia.checkinhub.modules.hotel.dto;

import br.com.flexmedia.checkinhub.modules.hotel.Hotel;

import java.time.LocalDateTime;

public record HotelResponseDTO(
        Long id,
        String nome,
        String cnpj,
        String cidade,
        String estado,
        boolean ativo,
        LocalDateTime createdAt
) {
    public static HotelResponseDTO from(Hotel h) {
        return new HotelResponseDTO(h.getId(), h.getNome(), h.getCnpj(),
                h.getCidade(), h.getEstado(), h.isAtivo(), h.getCreatedAt());
    }
}
