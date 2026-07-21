package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.request.SaveResponseRequest;
import br.edu.ufpb.fisioquest.dto.response.QuestionnaireResponseDto;
import br.edu.ufpb.fisioquest.entity.Patient;
import br.edu.ufpb.fisioquest.entity.QuestionnaireResponse;
import br.edu.ufpb.fisioquest.entity.User;
import br.edu.ufpb.fisioquest.exception.ForbiddenPatientAccessException;
import br.edu.ufpb.fisioquest.exception.PatientNotFoundException;
import br.edu.ufpb.fisioquest.repository.PatientRepository;
import br.edu.ufpb.fisioquest.repository.QuestionnaireResponseRepository;
import br.edu.ufpb.fisioquest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class QuestionnaireResponseService {

    private final PatientRepository patientRepository;
    private final QuestionnaireResponseRepository questionnaireResponseRepository;
    private final UserRepository userRepository;

    public QuestionnaireResponseService(PatientRepository patientRepository,
                                        QuestionnaireResponseRepository questionnaireResponseRepository,
                                        UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.questionnaireResponseRepository = questionnaireResponseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Salva uma resposta de questionário para um paciente.
     * Verifica que o paciente pertence ao fisioterapeuta autenticado (403 se não).
     * Calcula o score de acordo com o tipo do questionário e persiste a resposta.
     */
    @Transactional
    public QuestionnaireResponseDto saveResponse(SaveResponseRequest request, UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(PatientNotFoundException::new);

        if (!patient.getPhysiotherapist().getId().equals(physiotherapist.getId())) {
            throw new ForbiddenPatientAccessException();
        }

        BigDecimal score = calculateScore(request.questionnaireType(), request.responses());

        QuestionnaireResponse entity = QuestionnaireResponse.builder()
                .patient(patient)
                .physiotherapist(physiotherapist)
                .questionnaireType(request.questionnaireType())
                .responses(request.responses())
                .score(score)
                .appliedAt(Instant.now())
                .build();

        QuestionnaireResponse saved = questionnaireResponseRepository.save(entity);

        return new QuestionnaireResponseDto(
                saved.getId(),
                saved.getPatient().getId(),
                saved.getQuestionnaireType(),
                saved.getScore(),
                saved.getAppliedAt()
        );
    }

    private static final Set<Integer> TSK_INVERTED_ITEMS = Set.of(4, 8, 12, 16);

    /**
     * Calcula o score com base no tipo do questionário.
     * TSK (Tampa Scale of Kinesiophobia): itens 4, 8, 12 e 16 são invertidos (5 - valor) antes de somar.
     * PCS (Pain Catastrophizing Scale): soma simples dos valores numéricos.
     * Outros: soma simples dos valores numéricos como padrão.
     */
    private BigDecimal calculateScore(String questionnaireType, Map<String, Object> responses) {
        if (questionnaireType != null && questionnaireType.equalsIgnoreCase("TSK")) {
            return calculateTskScore(responses);
        }
        if (questionnaireType != null && questionnaireType.equalsIgnoreCase("PCS")) {
            return calculatePcsScore(responses);
        }
        // Default: soma simples de todos os valores
        int total = responses.values().stream()
                .mapToInt(this::toNumericValue)
                .sum();
        return BigDecimal.valueOf(total);
    }

    /**
     * TSK: loop de 1 a 17 (chaves "1" a "17"), inverte itens 4, 8, 12 e 16 (5 - valor).
     * Valor padrão é 1 caso a chave esteja ausente.
     */
    private BigDecimal calculateTskScore(Map<String, Object> responses) {
        int total = 0;
        for (int i = 1; i <= 17; i++) {
            Object raw = responses.get(String.valueOf(i));
            int value = raw != null ? toNumericValue(raw) : 1;
            int finalValue = TSK_INVERTED_ITEMS.contains(i) ? 5 - value : value;
            total += finalValue;
        }
        return BigDecimal.valueOf(total);
    }

    /**
     * PCS: soma simples de todos os valores numéricos no mapa de respostas.
     */
    private BigDecimal calculatePcsScore(Map<String, Object> responses) {
        int total = responses.values().stream()
                .mapToInt(this::toNumericValue)
                .sum();
        return BigDecimal.valueOf(total);
    }

    private int toNumericValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
