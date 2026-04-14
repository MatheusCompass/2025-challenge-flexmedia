package br.com.flexmedia.checkinhub.security.dto;

import br.com.flexmedia.checkinhub.security.RoleUsuario;
import br.com.flexmedia.checkinhub.security.Usuario;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        RoleUsuario role,
        Long hotelId,
        boolean ativo
) {
    public static UsuarioResponseDTO from(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getRole(),
                u.getHotel() != null ? u.getHotel().getId() : null,
                u.isAtivo()
        );
    }
}
