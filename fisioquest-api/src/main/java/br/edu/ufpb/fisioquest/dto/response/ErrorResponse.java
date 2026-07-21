package br.edu.ufpb.fisioquest.dto.response;

import java.time.Instant;

/**
 * Standardized error response body returned by the GlobalExceptionHandler.
 */
public record ErrorResponse(Instant timestamp, int status, String error, String message) {
}
