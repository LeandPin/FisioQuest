package br.edu.ufpb.fisioquest.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record DashboardResponse(
    int totalPatients,
    int totalQuestionnairesApplied,
    Instant lastQuestionnaireAppliedAt,
    int questionnairesThisMonth,
    int patientsWithResponsesThisMonth,
    BigDecimal averageTskScore,
    BigDecimal averagePcsScore,
    List<ScoreDistributionItem> tskScoreDistribution,
    List<ScoreDistributionItem> pcsScoreDistribution,
    List<PatientScoreComparison> patientScoreComparisons,
    List<TemporalEvolutionItem> temporalEvolution
) {}
