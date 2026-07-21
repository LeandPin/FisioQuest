package br.edu.ufpb.fisioquest.exception;

import jakarta.persistence.EntityNotFoundException;

/**
 * Thrown when a patient is not found.
 * Maps to HTTP 404 Not Found.
 */
public class PatientNotFoundException extends EntityNotFoundException {

    public PatientNotFoundException() {
        super("Paciente não encontrado.");
    }

    public PatientNotFoundException(String message) {
        super(message);
    }
}
