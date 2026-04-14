package br.com.flexmedia.checkinhub.modules.conteudo.dto;

import br.com.flexmedia.checkinhub.modules.conteudo.ConteudoTotem;
import br.com.flexmedia.checkinhub.modules.conteudo.TipoConteudo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConteudoTotemDTO(
        Long id,
        @NotNull Long hotelId,
        @NotNull TipoConteudo tipo,
        @NotBlank String titulo,
        @NotBlank String urlMidia,
        int ordemExibicao,
        boolean ativo
) {
    public static ConteudoTotemDTO from(ConteudoTotem c) {
        return new ConteudoTotemDTO(c.getId(), c.getHotel().getId(), c.getTipo(),
                c.getTitulo(), c.getUrlMidia(), c.getOrdemExibicao(), c.isAtivo());
    }
}
