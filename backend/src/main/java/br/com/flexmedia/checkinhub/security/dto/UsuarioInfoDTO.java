package br.com.flexmedia.checkinhub.security.dto;

public record UsuarioInfoDTO(
        Long id,
        String nome,
        String email,
        String role,
        Long hotelId
) {
    public static UsuarioInfoDTO from(br.com.flexmedia.checkinhub.security.Usuario u) {
        return new UsuarioInfoDTO(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getRole().name(),
                u.getHotel() != null ? u.getHotel().getId() : null
        );
    }
}
