package br.edu.ufpb.fisioquest.exception;

/**
 * Thrown when a registration attempt uses an email that is already taken.
 * Maps to HTTP 409 Conflict.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException() {
        super("O e-mail informado já está cadastrado.");
    }

    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
