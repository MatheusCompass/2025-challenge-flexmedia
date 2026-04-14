package br.com.flexmedia.checkinhub.security;

import br.com.flexmedia.checkinhub.security.dto.LoginRequestDTO;
import br.com.flexmedia.checkinhub.security.dto.LoginResponseDTO;
import br.com.flexmedia.checkinhub.security.dto.UsuarioInfoDTO;
import br.com.flexmedia.checkinhub.security.jwt.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authManager,
                          UsuarioRepository usuarioRepository,
                          JwtService jwtService) {
        this.authManager = authManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        Usuario usuario = usuarioRepository.findByEmailAndAtivoTrue(request.email())
                .orElseThrow();

        String token = jwtService.gerarToken(usuario.getEmail());
        return ResponseEntity.ok(new LoginResponseDTO(token, UsuarioInfoDTO.from(usuario)));
    }
}
