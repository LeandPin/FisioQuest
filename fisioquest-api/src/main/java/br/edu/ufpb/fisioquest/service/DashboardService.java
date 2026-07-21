package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.response.DashboardResponse;
import br.edu.ufpb.fisioquest.dto.response.PatientScoreComparison;
import br.edu.ufpb.fisioquest.dto.response.ScoreDistributionItem;
import br.edu.ufpb.fisioquest.dto.response.TemporalEvolutionItem;
import br.edu.ufpb.fisioquest.entity.Patient;
import br.edu.ufpb.fisioquest.entity.QuestionnaireResponse;
import br.edu.ufpb.fisioquest.entity.User;
import br.edu.ufpb.fisioquest.repository.PatientRepository;
import br.edu.ufpb.fisioquest.repository.QuestionnaireResponseRepository;
import br.edu.ufpb.fisioquest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final QuestionnaireResponseRepository questionnaireResponseRepository;
    private final UserRepository userRepository;

    public DashboardService(PatientRepository patientRepository,
                            QuestionnaireResponseRepository questionnaireResponseRepository,
                            UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.questionnaireResponseRepository = questionnaireResponseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        int totalPatients = patientRepository.findAllByPhysiotherapist(physiotherapist).size();

        int totalQuestionnairesApplied = (int) questionnaireResponseRepository.countByPhysiotherapist(physiotherapist);

        Instant lastQuestionnaireAppliedAt = questionnaireResponseRepository
                .findTopByPhysiotherapistOrderByAppliedAtDesc(physiotherapist)
                .map(QuestionnaireResponse::getAppliedAt)
                .orElse(null);

        List<QuestionnaireResponse> allResponses = questionnaireResponseRepository
                .findAllByPhysiotherapist(physiotherapist);

        List<ScoreDistributionItem> tskScoreDistribution = computeTskScoreDistribution(allResponses);

        List<Patient> patients = patientRepository.findAllByPhysiotherapist(physiotherapist);
        List<PatientScoreComparison> patientScoreComparisons = computePatientScoreComparisons(patients, allResponses);

        List<TemporalEvolutionItem> temporalEvolution = computeTemporalEvolution(allResponses);

        return new DashboardResponse(
                totalPatients,
                totalQuestionnairesApplied,
                lastQuestionnaireAppliedAt,
                tskScoreDistribution,
                patientScoreComparisons,
                temporalEvolution
        );
    }

    private List<ScoreDistributionItem> computeTskScoreDistribution(List<QuestionnaireResponse> allResponses) {
        List<QuestionnaireResponse> tskResponses = allResponses.stream()
                .filter(r -> "TSK".equalsIgnoreCase(r.getQuestionnaireType()))
                .toList();

        int lowFear = 0;
        int moderateFear = 0;
        int highFear = 0;
        int veryHighFear = 0;

        for (QuestionnaireResponse r : tskResponses) {
            int score = r.getScore().intValue();
            if (score >= 17 && score <= 24) {
                lowFear++;
            } else if (score >= 25 && score <= 36) {
                moderateFear++;
            } else if (score >= 37 && score <= 52) {
                highFear++;
            } else if (score >= 53 && score <= 68) {
                veryHighFear++;
            }
        }

        return List.of(
                new ScoreDistributionItem("17-24", lowFear),
                new ScoreDistributionItem("25-36", moderateFear),
                new ScoreDistributionItem("37-52", highFear),
                new ScoreDistributionItem("53-68", veryHighFear)
        );
    }

    private List<PatientScoreComparison> computePatientScoreComparisons(
            List<Patient> patients, List<QuestionnaireResponse> allResponses) {

        Map<UUID, List<QuestionnaireResponse>> responsesByPatient = allResponses.stream()
                .collect(Collectors.groupingBy(r -> r.getPatient().getId()));

        return patients.stream()
                .filter(p -> responsesByPatient.containsKey(p.getId()))
                .map(p -> {
                    List<QuestionnaireResponse> patientResponses = responsesByPatient.get(p.getId());
                    QuestionnaireResponse mostRecent = patientResponses.stream()
                            .max(Comparator.comparing(QuestionnaireResponse::getAppliedAt))
                            .orElseThrow();
                    return new PatientScoreComparison(p.getFullName(), mostRecent.getScore());
                })
                .sorted(Comparator.comparing(PatientScoreComparison::patientName))
                .toList();
    }

    private List<TemporalEvolutionItem> computeTemporalEvolution(List<QuestionnaireResponse> allResponses) {
        if (allResponses.isEmpty()) {
            return List.of();
        }

        Map<LocalDate, List<QuestionnaireResponse>> responsesByDay = allResponses.stream()
                .collect(Collectors.groupingBy(r ->
                        r.getAppliedAt().atZone(ZoneOffset.UTC).toLocalDate()));

        return responsesByDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Instant date = entry.getKey().atStartOfDay(ZoneOffset.UTC).toInstant();
                    BigDecimal average = entry.getValue().stream()
                            .map(QuestionnaireResponse::getScore)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP);
                    return new TemporalEvolutionItem(date, average);
                })
                .toList();
    }
}
