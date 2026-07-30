package br.edu.ufpb.fisioquest.exception;

/**
 * Thrown when an email confirmation token is invalid, not found, or has expired.
 * Maps to HTTP 400 Bad Request.
 */
public class InvalidConfirmationTokenException extends RuntimeException {

    public InvalidConfirmationTokenException() {
        super("Token de confirmação inválido ou expirado.");
    }

    public InvalidConfirmationTokenException(String message) {
        super(message);
    }
}
