package br.edu.ufpb.fisioquest.security;

import br.edu.ufpb.fisioquest.entity.User;
import br.edu.ufpb.fisioquest.enums.Role;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.JWKSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes de unidade para TokenService.
 * Validates: Requirements 2.3, 2.4
 */
class TokenServiceTest {

    private TokenService tokenService;
    private JwtDecoder jwtDecoder;
    private User testUser;

    @BeforeEach
    void setUp() throws Exception {
        // Gerar par de chaves RSA para testes
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        // Construir JwtEncoder com NimbusJwtEncoder
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        ImmutableJWKSet<com.nimbusds.jose.proc.SecurityContext> jwkSource = new ImmutableJWKSet<>(jwkSet);
        JwtEncoder jwtEncoder = new NimbusJwtEncoder(jwkSource);

        // Construir JwtDecoder para verificar os tokens gerados
        jwtDecoder = NimbusJwtDecoder.withPublicKey(publicKey).build();

        tokenService = new TokenService(jwtEncoder);

        // Criar usuário de teste
        testUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Maria Silva")
                .email("maria@fisioquest.com")
                .passwordHash("hashed")
                .role(Role.FISIOTERAPEUTA)
                .createdAt(Instant.now())
                .failedLoginAttempts(0)
                .build();
    }

    @Test
    @DisplayName("generateAccessToken deve gerar JWT com claim sub igual ao ID do usuário")
    void generateAccessToken_shouldContainSubjectAsUserId() {
        String token = tokenService.generateAccessToken(testUser);

        Jwt jwt = jwtDecoder.decode(token);

        assertEquals(testUser.getId().toString(), jwt.getSubject());
    }

    @Test
    @DisplayName("generateAccessToken deve gerar JWT com claim email do usuário")
    void generateAccessToken_shouldContainEmailClaim() {
        String token = tokenService.generateAccessToken(testUser);

        Jwt jwt = jwtDecoder.decode(token);

        assertEquals(testUser.getEmail(), jwt.getClaimAsString("email"));
    }

    @Test
    @DisplayName("generateAccessToken deve gerar JWT com claim role FISIOTERAPEUTA")
    void generateAccessToken_shouldContainRoleClaim() {
        String token = tokenService.generateAccessToken(testUser);

        Jwt jwt = jwtDecoder.decode(token);

        assertEquals("FISIOTERAPEUTA", jwt.getClaimAsString("role"));
    }

    @Test
    @DisplayName("generateAccessToken deve gerar JWT com duração de 900 segundos (15 minutos)")
    void generateAccessToken_shouldHave900SecondsDuration() {
        String token = tokenService.generateAccessToken(testUser);

        Jwt jwt = jwtDecoder.decode(token);

        Instant issuedAt = jwt.getIssuedAt();
        Instant expiresAt = jwt.getExpiresAt();

        assertNotNull(issuedAt);
        assertNotNull(expiresAt);
        assertEquals(900, ChronoUnit.SECONDS.between(issuedAt, expiresAt));
    }

    @Test
    @DisplayName("hashRefreshToken deve ser determinístico - mesmo input produz mesmo output")
    void hashRefreshToken_shouldBeDeterministic() {
        String rawToken = UUID.randomUUID().toString();

        String hash1 = tokenService.hashRefreshToken(rawToken);
        String hash2 = tokenService.hashRefreshToken(rawToken);

        assertEquals(hash1, hash2);
    }

    @Test
    @DisplayName("hashRefreshToken não deve retornar o valor original")
    void hashRefreshToken_shouldNotReturnOriginalValue() {
        String rawToken = UUID.randomUUID().toString();

        String hash = tokenService.hashRefreshToken(rawToken);

        assertNotEquals(rawToken, hash);
    }

    @Test
    @DisplayName("hashRefreshToken deve produzir hashes diferentes para inputs diferentes")
    void hashRefreshToken_shouldProduceDifferentHashesForDifferentInputs() {
        String token1 = UUID.randomUUID().toString();
        String token2 = UUID.randomUUID().toString();

        String hash1 = tokenService.hashRefreshToken(token1);
        String hash2 = tokenService.hashRefreshToken(token2);

        assertNotEquals(hash1, hash2);
    }

    @Test
    @DisplayName("generateRefreshToken deve gerar string no formato UUID")
    void generateRefreshToken_shouldGenerateUuidFormat() {
        String refreshToken = tokenService.generateRefreshToken();

        assertDoesNotThrow(() -> UUID.fromString(refreshToken));
    }

    @Test
    @DisplayName("getRefreshTokenExpiry deve retornar aproximadamente now + 7 dias")
    void getRefreshTokenExpiry_shouldReturnApproximately7DaysFromNow() {
        Instant before = Instant.now().plus(7, ChronoUnit.DAYS);
        Instant expiry = tokenService.getRefreshTokenExpiry();
        Instant after = Instant.now().plus(7, ChronoUnit.DAYS);

        // A expiração deve estar entre before e after (margem de execução do teste)
        assertTrue(
                !expiry.isBefore(before.minusSeconds(1)) && !expiry.isAfter(after.plusSeconds(1)),
                "Expiry should be approximately 7 days from now"
        );
    }
}
