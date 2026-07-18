package br.edu.ufpb.fisioquest.dto.response;

import java.time.Instant;
import java.util.List;

public record DashboardResponse(
    int totalPatients,
    int totalQuestionnairesApplied,
    Instant lastQuestionnaireAppliedAt,
    List<ScoreDistributionItem> tskScoreDistribution,
    List<PatientScoreComparison> patientScoreComparisons,
    List<TemporalEvolutionItem> temporalEvolution
) {}
