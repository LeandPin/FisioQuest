package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.request.CreatePatientRequest;
import br.edu.ufpb.fisioquest.dto.response.PatientDetailResponse;
import br.edu.ufpb.fisioquest.dto.response.PatientResponse;
import br.edu.ufpb.fisioquest.dto.response.QuestionnaireResponseSummary;
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

import java.util.List;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final QuestionnaireResponseRepository questionnaireResponseRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository,
                          QuestionnaireResponseRepository questionnaireResponseRepository,
                          UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.questionnaireResponseRepository = questionnaireResponseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Cria um novo paciente vinculado ao fisioterapeuta autenticado.
     */
    @Transactional
    public PatientResponse createPatient(CreatePatientRequest request, UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        Patient patient = Patient.builder()
                .fullName(request.fullName())
                .birthDate(request.birthDate())
                .notes(request.notes())
                .physiotherapist(physiotherapist)
                .build();

        Patient saved = patientRepository.save(patient);

        return new PatientResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getBirthDate(),
                saved.getNotes(),
                saved.getCreatedAt()
        );
    }

    /**
     * Retorna apenas os pacientes do fisioterapeuta autenticado.
     */
    @Transactional(readOnly = true)
    public List<PatientResponse> listPatients(UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        return patientRepository.findAllByPhysiotherapist(physiotherapist).stream()
                .map(patient -> new PatientResponse(
                        patient.getId(),
                        patient.getFullName(),
                        patient.getBirthDate(),
                        patient.getNotes(),
                        patient.getCreatedAt()
                ))
                .toList();
    }

    /**
     * Retorna detalhes de um paciente com suas respostas de questionário.
     * Verifica ownership: lança PatientNotFoundException se inexistente,
     * lança ForbiddenPatientAccessException se não pertencer ao fisioterapeuta.
     */
    @Transactional(readOnly = true)
    public PatientDetailResponse getPatient(UUID patientId, UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(PatientNotFoundException::new);

        if (!patient.getPhysiotherapist().getId().equals(physiotherapist.getId())) {
            throw new ForbiddenPatientAccessException();
        }

        List<QuestionnaireResponse> questionnaireResponses =
                questionnaireResponseRepository.findAllByPatientAndPhysiotherapist(patient, physiotherapist);

        List<QuestionnaireResponseSummary> responseSummaries = questionnaireResponses.stream()
                .map(qr -> new QuestionnaireResponseSummary(
                        qr.getId(),
                        qr.getQuestionnaireType(),
                        qr.getScore(),
                        qr.getAppliedAt(),
                        qr.getResponses()
                ))
                .toList();

        return new PatientDetailResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getBirthDate(),
                patient.getNotes(),
                patient.getCreatedAt(),
                responseSummaries
        );
    }
}
