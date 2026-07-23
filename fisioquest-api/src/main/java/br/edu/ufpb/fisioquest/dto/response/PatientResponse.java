package br.edu.ufpb.fisioquest.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PatientResponse(
    UUID id,
    String fullName,
    String sex,
    LocalDate birthDate,
    String cpf,
    String phone,
    String notes,
    Instant createdAt
) {}
