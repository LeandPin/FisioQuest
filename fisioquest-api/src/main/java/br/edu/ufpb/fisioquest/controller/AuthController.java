package br.edu.ufpb.fisioquest.controller;

import br.edu.ufpb.fisioquest.dto.request.LoginRequest;
import br.edu.ufpb.fisioquest.dto.request.RegisterRequest;
import br.edu.ufpb.fisioquest.dto.response.LoginResponse;
import br.edu.ufpb.fisioquest.dto.response.UserResponse;
import br.edu.ufpb.fisioquest.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request, response);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refresh_token") String refreshToken,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.refresh(refreshToken, response);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt,
                                       HttpServletResponse response) {
        authService.logout(jwt, response);
        return ResponseEntity.noContent().build();
    }
}
