package br.edu.ufpb.fisioquest.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record TemporalEvolutionItem(Instant date, BigDecimal averageScore) {}
