package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.request.LoginRequest;
import br.edu.ufpb.fisioquest.dto.request.RegisterRequest;
import br.edu.ufpb.fisioquest.dto.response.LoginResponse;
import br.edu.ufpb.fisioquest.dto.response.UserResponse;
import br.edu.ufpb.fisioquest.entity.RefreshToken;
import br.edu.ufpb.fisioquest.entity.User;
import br.edu.ufpb.fisioquest.enums.Role;
import br.edu.ufpb.fisioquest.exception.AccountLockedException;
import br.edu.ufpb.fisioquest.exception.EmailAlreadyExistsException;
import br.edu.ufpb.fisioquest.repository.RefreshTokenRepository;
import br.edu.ufpb.fisioquest.repository.UserRepository;
import br.edu.ufpb.fisioquest.security.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 10;
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final String REFRESH_TOKEN_PATH = "/api/auth/refresh";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       TokenService tokenService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registra um novo fisioterapeuta.
     * Valida unicidade do email, codifica senha com BCrypt, persiste User com role FISIOTERAPEUTA.
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyExistsException();
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.FISIOTERAPEUTA)
                .failedLoginAttempts(0)
                .build();

        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getCreatedAt()
        );
    }

    /**
     * Autentica o fisioterapeuta, gera Access_Token e Refresh_Token.
     * Implementa rate limiting: 5 tentativas → bloqueio de 10 minutos.
     */
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        // Verifica se a conta está bloqueada
        if (user.isLocked()) {
            throw new AccountLockedException();
        }

        // Tenta autenticar
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            handleFailedLogin(user);
            throw new BadCredentialsException("Credenciais inválidas");
        }

        // Login bem-sucedido: reseta tentativas falhas
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        // Gera tokens
        String accessToken = tokenService.generateAccessToken(user);
        String rawRefreshToken = tokenService.generateRefreshToken();
        String refreshTokenHash = tokenService.hashRefreshToken(rawRefreshToken);

        // Persiste hash do refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(refreshTokenHash)
                .user(user)
                .expiresAt(tokenService.getRefreshTokenExpiry())
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        // Seta cookie HttpOnly com o refresh token
        addRefreshTokenCookie(response, rawRefreshToken);

        return new LoginResponse(accessToken);
    }

    /**
     * Renova o Access_Token usando um Refresh_Token válido.
     * Implementa rotação: revoga o token antigo e gera um novo.
     */
    @Transactional
    public LoginResponse refresh(String rawRefreshToken, HttpServletResponse response) {
        String tokenHash = tokenService.hashRefreshToken(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));

        if (!storedToken.isValid()) {
            throw new BadCredentialsException("Refresh token inválido ou expirado");
        }

        // Rotação: revoga o token atual
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = storedToken.getUser();

        // Gera novo par de tokens
        String newAccessToken = tokenService.generateAccessToken(user);
        String newRawRefreshToken = tokenService.generateRefreshToken();
        String newRefreshTokenHash = tokenService.hashRefreshToken(newRawRefreshToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .tokenHash(newRefreshTokenHash)
                .user(user)
                .expiresAt(tokenService.getRefreshTokenExpiry())
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        // Seta novo cookie
        addRefreshTokenCookie(response, newRawRefreshToken);

        return new LoginResponse(newAccessToken);
    }

    /**
     * Revoga todos os Refresh_Tokens do usuário e limpa o cookie.
     */
    @Transactional
    public void logout(Jwt jwt, HttpServletResponse response) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado"));

        refreshTokenRepository.revokeAllByUser(user);
        clearRefreshTokenCookie(response);
    }

    /**
     * Incrementa failedLoginAttempts e bloqueia a conta se atingir o limite.
     */
    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCK_DURATION_MINUTES, ChronoUnit.MINUTES));
        }

        userRepository.save(user);
    }

    /**
     * Adiciona o cookie HttpOnly com o Refresh_Token.
     */
    private void addRefreshTokenCookie(HttpServletResponse response, String rawRefreshToken) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath(REFRESH_TOKEN_PATH);
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias em segundos
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    /**
     * Limpa o cookie de Refresh_Token (Max-Age=0).
     */
    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath(REFRESH_TOKEN_PATH);
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }
}
