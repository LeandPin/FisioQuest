package br.edu.ufpb.fisioquest.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PatientDetailResponse(
    UUID id,
    String fullName,
    String sex,
    LocalDate birthDate,
    String cpf,
    String phone,
    String address,
    String medicalDiagnosis,
    String mainComplaint,
    String notes,
    Instant createdAt,
    List<QuestionnaireResponseSummary> responses
) {}
