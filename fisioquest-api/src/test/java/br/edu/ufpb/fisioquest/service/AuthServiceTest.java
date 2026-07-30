package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.request.LoginRequest;
import br.edu.ufpb.fisioquest.dto.request.RegisterRequest;
import br.edu.ufpb.fisioquest.dto.response.LoginResponse;
import br.edu.ufpb.fisioquest.entity.RefreshToken;
import br.edu.ufpb.fisioquest.entity.User;
import br.edu.ufpb.fisioquest.enums.Role;
import br.edu.ufpb.fisioquest.exception.AccountLockedException;
import br.edu.ufpb.fisioquest.exception.EmailDomainNotAllowedException;
import br.edu.ufpb.fisioquest.exception.EmailNotVerifiedException;
import br.edu.ufpb.fisioquest.exception.InvalidConfirmationTokenException;
import br.edu.ufpb.fisioquest.repository.RefreshTokenRepository;
import br.edu.ufpb.fisioquest.repository.UserRepository;
import br.edu.ufpb.fisioquest.security.TokenService;
import br.edu.ufpb.fisioquest.service.EmailService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 * Validates: Requirements 2.5, 4.2, 4.3
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;

    @Mock
    private HttpServletResponse httpServletResponse;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Inject allowed email domains via reflection (replaces @Value injection)
        ReflectionTestUtils.setField(authService, "allowedEmailDomainsRaw", "ci.ufpb.br,academico.ufpb.br,test.com");

        testUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("João Silva")
                .email("joao@test.com")
                .passwordHash("$2a$10$hashedpassword")
                .role(Role.FISIOTERAPEUTA)
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .emailVerified(true)
                .createdAt(Instant.now())
                .build();
    }

    // ========== Lock Logic Tests (Requirement 2.5) ==========

    @Test
    @DisplayName("5th failed login attempt sets lockedUntil on the user account")
    void fifthFailedAttempt_setsLockedUntil() {
        // Given: user has 4 failed attempts already
        testUser.setFailedLoginAttempts(4);
        LoginRequest request = new LoginRequest("joao@test.com", "wrongpassword");

        when(userRepository.findByEmail("joao@test.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When & Then: login throws BadCredentialsException
        assertThatThrownBy(() -> authService.login(request, httpServletResponse))
                .isInstanceOf(BadCredentialsException.class);

        // Verify: user now has 5 failed attempts and lockedUntil is set
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(savedUser.getLockedUntil()).isNotNull();
        assertThat(savedUser.getLockedUntil()).isAfter(Instant.now());
    }

    @Test
    @DisplayName("6th attempt on locked account throws AccountLockedException")
    void sixthAttempt_onLockedAccount_throwsAccountLockedException() {
        // Given: user is already locked (lockedUntil is in the future)
        testUser.setFailedLoginAttempts(5);
        testUser.setLockedUntil(Instant.now().plus(10, ChronoUnit.MINUTES));
        LoginRequest request = new LoginRequest("joao@test.com", "anypassword");

        when(userRepository.findByEmail("joao@test.com")).thenReturn(Optional.of(testUser));

        // When & Then: login throws AccountLockedException
        assertThatThrownBy(() -> authService.login(request, httpServletResponse))
                .isInstanceOf(AccountLockedException.class);

        // Verify: AuthenticationManager is never called
        verify(authenticationManager, never()).authenticate(any());
    }

    // ========== Successful Login Tests (Requirement 2.5 - reset counter) ==========

    @Test
    @DisplayName("Successful login resets failedLoginAttempts to 0")
    void successfulLogin_resetsFailedLoginAttempts() {
        // Given: user had some previous failed attempts
        testUser.setFailedLoginAttempts(3);
        LoginRequest request = new LoginRequest("joao@test.com", "correctpassword");

        when(userRepository.findByEmail("joao@test.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("joao@test.com", "correctpassword"));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(tokenService.generateRefreshToken()).thenReturn("raw-refresh-token");
        when(tokenService.hashRefreshToken("raw-refresh-token")).thenReturn("hashed-refresh-token");
        when(tokenService.getRefreshTokenExpiry()).thenReturn(Instant.now().plus(7, ChronoUnit.DAYS));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        LoginResponse response = authService.login(request, httpServletResponse);

        // Then: access token returned
        assertThat(response.accessToken()).isEqualTo("access-token");

        // Verify: user's failedLoginAttempts reset to 0
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getFailedLoginAttempts()).isEqualTo(0);
        assertThat(savedUser.getLockedUntil()).isNull();
    }

    // ========== Refresh Token Tests (Requirements 4.2, 4.3) ==========

    @Test
    @DisplayName("Refresh with revoked token throws BadCredentialsException")
    void refresh_withRevokedToken_throwsBadCredentialsException() {
        // Given: a refresh token that has been revoked
        String rawToken = "some-refresh-token";
        String tokenHash = "hashed-token";

        RefreshToken revokedToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .tokenHash(tokenHash)
                .user(testUser)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(true)
                .createdAt(Instant.now())
                .build();

        when(tokenService.hashRefreshToken(rawToken)).thenReturn(tokenHash);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(revokedToken));

        // When & Then: refresh throws BadCredentialsException
        assertThatThrownBy(() -> authService.refresh(rawToken, httpServletResponse))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("inválido");

        // Verify: no new tokens are generated
        verify(tokenService, never()).generateAccessToken(any(User.class));
        verify(tokenService, never()).generateRefreshToken();
    }

    // ========== Email Domain Validation Tests (Requirement 15.1, 15.2) ==========

    @Test
    @DisplayName("Register with disallowed email domain throws EmailDomainNotAllowedException")
    void register_withDisallowedDomain_throwsEmailDomainNotAllowedException() {
        // Given: email with disallowed domain
        RegisterRequest request = new RegisterRequest(
                "João Silva",
                "joao@gmail.com",
                "password123"
        );

        // When & Then: registration throws EmailDomainNotAllowedException
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailDomainNotAllowedException.class)
                .hasMessageContaining("domínio");

        // Verify: user is never saved
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendConfirmationEmail(anyString(), anyString(), anyString());
    }

    // ========== Email Verification Tests (Requirements 15.3, 15.5, 15.6) ==========

    @Test
    @DisplayName("Login with unverified email throws EmailNotVerifiedException")
    void login_withUnverifiedEmail_throwsEmailNotVerifiedException() {
        // Given: user with emailVerified = false
        testUser.setEmailVerified(false);
        LoginRequest request = new LoginRequest("joao@test.com", "correctpassword");

        when(userRepository.findByEmail("joao@test.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("joao@test.com", "correctpassword"));

        // When & Then: login throws EmailNotVerifiedException
        assertThatThrownBy(() -> authService.login(request, httpServletResponse))
                .isInstanceOf(EmailNotVerifiedException.class)
                .hasMessageContaining("verificado");

        // Verify: no tokens are generated
        verify(tokenService, never()).generateAccessToken(any(User.class));
        verify(tokenService, never()).generateRefreshToken();
    }

    @Test
    @DisplayName("confirmEmail with expired token throws InvalidConfirmationTokenException")
    void confirmEmail_withExpiredToken_throwsInvalidConfirmationTokenException() {
        // Given: user with expired token (expiresAt in the past)
        String token = "expired-token-uuid";
        testUser.setEmailVerificationToken(token);
        testUser.setEmailVerificationTokenExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));
        testUser.setEmailVerified(false);

        when(userRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(testUser));

        // When & Then: confirmEmail throws InvalidConfirmationTokenException
        assertThatThrownBy(() -> authService.confirmEmail(token))
                .isInstanceOf(InvalidConfirmationTokenException.class)
                .hasMessageContaining("inválido");

        // Verify: user's emailVerified is NOT set to true
        verify(userRepository, never()).save(any(User.class));
    }
}
