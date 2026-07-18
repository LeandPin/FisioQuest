package br.edu.ufpb.fisioquest.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PatientDetailResponse(
    UUID id,
    String fullName,
    LocalDate birthDate,
    String notes,
    Instant createdAt,
    List<QuestionnaireResponseSummary> responses
) {}
