package br.edu.ufpb.fisioquest.dto.response;

import java.math.BigDecimal;

public record PatientScoreComparison(String patientName, BigDecimal lastScore) {}
