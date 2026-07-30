package br.edu.ufpb.fisioquest.exception;

/**
 * Thrown when a login attempt is made for an account whose email has not yet been verified.
 * Maps to HTTP 403 Forbidden.
 */
public class EmailNotVerifiedException extends RuntimeException {

    public EmailNotVerifiedException() {
        super("E-mail não verificado. Verifique sua caixa de entrada e confirme o e-mail antes de fazer login.");
    }

    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
