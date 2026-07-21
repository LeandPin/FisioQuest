package br.edu.ufpb.fisioquest.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record QuestionnaireResponseSummary(
    UUID id,
    String questionnaireType,
    BigDecimal score,
    Instant appliedAt,
    Map<String, Object> responses
) {}
