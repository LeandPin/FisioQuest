package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.request.CreatePatientRequest;
import br.edu.ufpb.fisioquest.dto.request.UpdatePatientRequest;
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
                .sex(request.sex())
                .birthDate(request.birthDate())
                .cpf(request.cpf())
                .phone(request.phone())
                .address(request.address())
                .medicalDiagnosis(request.medicalDiagnosis())
                .mainComplaint(request.mainComplaint())
                .notes(request.notes())
                .physiotherapist(physiotherapist)
                .build();

        Patient saved = patientRepository.save(patient);

        return toPatientResponse(saved);
    }

    /**
     * Retorna apenas os pacientes do fisioterapeuta autenticado.
     */
    @Transactional(readOnly = true)
    public List<PatientResponse> listPatients(UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        return patientRepository.findAllByPhysiotherapist(physiotherapist).stream()
                .map(this::toPatientResponse)
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
                patient.getSex(),
                patient.getBirthDate(),
                patient.getCpf(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getMedicalDiagnosis(),
                patient.getMainComplaint(),
                patient.getNotes(),
                patient.getCreatedAt(),
                responseSummaries
        );
    }

    /**
     * Atualiza diagnóstico médico e queixa principal de um paciente.
     * Verifica ownership antes de permitir a atualização.
     */
    @Transactional
    public PatientDetailResponse updatePatient(UUID patientId, UpdatePatientRequest request, UUID physiotherapistId) {
        User physiotherapist = userRepository.findById(physiotherapistId)
                .orElseThrow(() -> new IllegalArgumentException("Fisioterapeuta não encontrado."));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(PatientNotFoundException::new);

        if (!patient.getPhysiotherapist().getId().equals(physiotherapist.getId())) {
            throw new ForbiddenPatientAccessException();
        }

        patient.setMedicalDiagnosis(request.medicalDiagnosis());
        patient.setMainComplaint(request.mainComplaint());

        patientRepository.save(patient);

        // Re-fetch responses for the detail view
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
                patient.getSex(),
                patient.getBirthDate(),
                patient.getCpf(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getMedicalDiagnosis(),
                patient.getMainComplaint(),
                patient.getNotes(),
                patient.getCreatedAt(),
                responseSummaries
        );
    }

    private PatientResponse toPatientResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getSex(),
                patient.getBirthDate(),
                patient.getCpf(),
                patient.getPhone(),
                patient.getNotes(),
                patient.getCreatedAt()
        );
    }
}
