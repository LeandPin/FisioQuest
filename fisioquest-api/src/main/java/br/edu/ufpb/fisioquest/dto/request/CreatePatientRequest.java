package br.edu.ufpb.fisioquest.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreatePatientRequest(
    @NotBlank String fullName,
    @NotBlank String sex,
    LocalDate birthDate,
    String cpf,
    String phone,
    String address,
    String medicalDiagnosis,
    String mainComplaint,
    String notes
) {}
