package br.edu.ufpb.fisioquest.exception;

import br.edu.ufpb.fisioquest.dto.response.ErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Testes de unidade para GlobalExceptionHandler.
 * Validates: Requirements 7.4
 */
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("MethodArgumentNotValidException deve retornar 400 Bad Request com mensagem do campo inválido")
    void handleValidation_shouldReturn400WithFieldErrorMessage() {
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "email", "O e-mail é obrigatório");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(400, body.status());
        assertEquals("Bad Request", body.error());
        assertEquals("O e-mail é obrigatório", body.message());
    }

    @Test
    @DisplayName("BadCredentialsException deve retornar 401 Unauthorized com mensagem genérica")
    void handleBadCredentials_shouldReturn401WithGenericMessage() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<ErrorResponse> response = handler.handleBadCredentials(ex);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(401, body.status());
        assertEquals("Unauthorized", body.error());
        assertEquals("Credenciais inválidas", body.message());
    }

    @Test
    @DisplayName("AccessDeniedException deve retornar 403 Forbidden com mensagem da exceção")
    void handleAccessDenied_shouldReturn403WithExceptionMessage() {
        AccessDeniedException ex = new AccessDeniedException("Acesso negado: o paciente não pertence ao fisioterapeuta autenticado.");

        ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(403, body.status());
        assertEquals("Forbidden", body.error());
        assertEquals("Acesso negado: o paciente não pertence ao fisioterapeuta autenticado.", body.message());
    }

    @Test
    @DisplayName("EntityNotFoundException deve retornar 404 Not Found com mensagem da exceção")
    void handleEntityNotFound_shouldReturn404WithExceptionMessage() {
        EntityNotFoundException ex = new EntityNotFoundException("Paciente não encontrado.");

        ResponseEntity<ErrorResponse> response = handler.handleEntityNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(404, body.status());
        assertEquals("Not Found", body.error());
        assertEquals("Paciente não encontrado.", body.message());
    }

    @Test
    @DisplayName("EmailAlreadyExistsException deve retornar 409 Conflict com mensagem da exceção")
    void handleEmailAlreadyExists_shouldReturn409WithExceptionMessage() {
        EmailAlreadyExistsException ex = new EmailAlreadyExistsException();

        ResponseEntity<ErrorResponse> response = handler.handleEmailAlreadyExists(ex);

        assertEquals(HttpStatus.CONFLICT.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(409, body.status());
        assertEquals("Conflict", body.error());
        assertEquals("O e-mail informado já está cadastrado.", body.message());
    }

    @Test
    @DisplayName("AccountLockedException deve retornar 429 Too Many Requests com mensagem da exceção")
    void handleAccountLocked_shouldReturn429WithExceptionMessage() {
        AccountLockedException ex = new AccountLockedException();

        ResponseEntity<ErrorResponse> response = handler.handleAccountLocked(ex);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(429, body.status());
        assertEquals("Too Many Requests", body.error());
        assertEquals("Conta bloqueada temporariamente devido a muitas tentativas de login. Tente novamente mais tarde.", body.message());
    }

    @Test
    @DisplayName("Exception genérica deve retornar 500 Internal Server Error com mensagem padrão")
    void handleGenericException_shouldReturn500WithDefaultMessage() {
        Exception ex = new Exception("Algo inesperado aconteceu");

        ResponseEntity<ErrorResponse> response = handler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getStatusCode().value());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.timestamp());
        assertEquals(500, body.status());
        assertEquals("Internal Server Error", body.error());
        assertEquals("Erro interno do servidor", body.message());
    }
}
