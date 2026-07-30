package br.edu.ufpb.fisioquest.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendConfirmationRequest(
    @Email @NotBlank String email
) {}
