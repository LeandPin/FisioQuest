package br.edu.ufpb.fisioquest.exception;

/**
 * Thrown when a registration attempt uses an email from a domain not in the allowed list.
 * Maps to HTTP 422 Unprocessable Entity.
 */
public class EmailDomainNotAllowedException extends RuntimeException {

    public EmailDomainNotAllowedException() {
        super("O domínio do e-mail informado não é permitido. Utilize um e-mail institucional.");
    }

    public EmailDomainNotAllowedException(String message) {
        super(message);
    }
}
