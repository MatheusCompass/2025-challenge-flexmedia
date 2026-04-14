package br.com.flexmedia.checkinhub.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-key-must-be-at-least-256bits-long-for-hmacsha");
        props.setExpirationMs(3600000L);
        jwtService = new JwtService(props);
    }

    @Test
    void gerarToken_retornaTokenNaoNulo() {
        String token = jwtService.gerarToken("usuario@hotel.com");
        assertThat(token).isNotBlank();
    }

    @Test
    void extrairEmail_retornaEmailOriginal() {
        String email = "hospede@email.com";
        String token = jwtService.gerarToken(email);
        assertThat(jwtService.extrairEmail(token)).isEqualTo(email);
    }

    @Test
    void isTokenValido_quandoTokenEEmailCorretos_retornaTrue() {
        String email = "admin@hotel.com";
        String token = jwtService.gerarToken(email);
        assertThat(jwtService.isTokenValido(token, email)).isTrue();
    }

    @Test
    void isTokenValido_quandoEmailDiferente_retornaFalse() {
        String token = jwtService.gerarToken("a@hotel.com");
        assertThat(jwtService.isTokenValido(token, "b@hotel.com")).isFalse();
    }

    @Test
    void isTokenValido_quandoTokenInvalido_retornaFalse() {
        assertThat(jwtService.isTokenValido("token.invalido.aqui", "a@hotel.com")).isFalse();
    }

    @Test
    void isTokenValido_quandoTokenExpirado_retornaFalse() {
        JwtProperties expiredProps = new JwtProperties();
        expiredProps.setSecret("test-secret-key-must-be-at-least-256bits-long-for-hmacsha");
        expiredProps.setExpirationMs(-1000L); // já expirado
        JwtService expiredService = new JwtService(expiredProps);

        String email = "user@hotel.com";
        String token = expiredService.gerarToken(email);
        assertThat(expiredService.isTokenValido(token, email)).isFalse();
    }
}
