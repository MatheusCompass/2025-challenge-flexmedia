package br.com.flexmedia.checkinhub.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmailAndAtivoTrue(String email);
    boolean existsByEmail(String email);
}
