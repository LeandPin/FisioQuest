package br.edu.ufpb.fisioquest.exception;

/**
 * Thrown when a user's account is locked due to too many failed login attempts.
 * Maps to HTTP 429 Too Many Requests.
 */
public class AccountLockedException extends RuntimeException {

    public AccountLockedException() {
        super("Conta bloqueada temporariamente devido a muitas tentativas de login. Tente novamente mais tarde.");
    }

    public AccountLockedException(String message) {
        super(message);
    }
}
