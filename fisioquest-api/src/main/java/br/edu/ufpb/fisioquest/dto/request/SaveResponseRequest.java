package br.edu.ufpb.fisioquest.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record SaveResponseRequest(
    @NotNull UUID patientId,
    @NotBlank String questionnaireType,
    @NotNull Map<String, Object> responses
) {}
