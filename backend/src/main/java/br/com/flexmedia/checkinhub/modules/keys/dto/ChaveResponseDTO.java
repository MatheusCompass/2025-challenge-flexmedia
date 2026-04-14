package br.com.flexmedia.checkinhub.modules.keys.dto;

import br.com.flexmedia.checkinhub.modules.keys.ChaveDigital;
import br.com.flexmedia.checkinhub.modules.keys.TipoChave;

import java.time.LocalDateTime;

public record ChaveResponseDTO(
        Long id,
        String token,
        TipoChave tipo,
        LocalDateTime dataEmissao,
        LocalDateTime dataExpiracao,
        boolean ativa
) {
    public static ChaveResponseDTO from(ChaveDigital c) {
        return new ChaveResponseDTO(c.getId(), c.getToken(), c.getTipo(),
                c.getDataEmissao(), c.getDataExpiracao(), c.isAtiva());
    }
}
