package br.com.flexmedia.checkinhub.config;

import br.com.flexmedia.checkinhub.security.RoleUsuario;
import br.com.flexmedia.checkinhub.security.Usuario;
import br.com.flexmedia.checkinhub.security.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsByEmail("admin@flexmedia.com")) {
            log.info("DataLoader: admin já existe, nenhuma ação necessária.");
            return;
        }

        Usuario admin = Usuario.builder()
                .nome("Admin FlexMedia")
                .email("admin@flexmedia.com")
                .senha(passwordEncoder.encode("admin123"))
                .role(RoleUsuario.ADMIN)
                .ativo(true)
                .build();

        usuarioRepository.save(admin);
        log.info("DataLoader: usuário admin criado — admin@flexmedia.com / admin123");
    }
}
