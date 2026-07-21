package br.edu.ufpb.fisioquest.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record QuestionnaireResponseDto(
    UUID id,
    UUID patientId,
    String questionnaireType,
    BigDecimal score,
    Instant appliedAt
) {}
