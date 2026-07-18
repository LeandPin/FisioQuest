package br.edu.ufpb.fisioquest.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreatePatientRequest(
    @NotBlank String fullName,
    LocalDate birthDate,
    String notes
) {}
