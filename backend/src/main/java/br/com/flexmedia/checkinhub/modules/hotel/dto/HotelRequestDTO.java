package br.com.flexmedia.checkinhub.modules.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record HotelRequestDTO(
        @NotBlank String nome,
        @NotBlank @Pattern(regexp = "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", message = "CNPJ inválido") String cnpj,
        @NotBlank String cidade,
        @NotBlank @Size(min = 2, max = 2) String estado
) {}
