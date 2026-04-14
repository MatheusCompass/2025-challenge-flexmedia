package br.com.flexmedia.checkinhub.pms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO que representa os dados de uma reserva retornados pelo PMS.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PMSReservaDTO {

    private String codigoReserva;
    private String hospedeNome;
    private String hospedeCpf;
    private String hospedeEmail;
    private String quartoNumero;
    private LocalDate dataCheckin;
    private LocalDate dataCheckout;
    private String status;
}
