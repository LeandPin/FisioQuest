package br.edu.ufpb.fisioquest.exception;

import org.springframework.security.access.AccessDeniedException;

/**
 * Thrown when a physiotherapist tries to access a patient that belongs to another physiotherapist.
 * Maps to HTTP 403 Forbidden.
 */
public class ForbiddenPatientAccessException extends AccessDeniedException {

    public ForbiddenPatientAccessException() {
        super("Acesso negado: o paciente não pertence ao fisioterapeuta autenticado.");
    }

    public ForbiddenPatientAccessException(String message) {
        super(message);
    }
}
