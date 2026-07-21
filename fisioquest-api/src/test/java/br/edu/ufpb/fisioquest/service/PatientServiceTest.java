package br.edu.ufpb.fisioquest.service;

import br.edu.ufpb.fisioquest.dto.response.PatientResponse;
import br.edu.ufpb.fisioquest.entity.Patient;
import br.edu.ufpb.fisioquest.entity.User;
import br.edu.ufpb.fisioquest.enums.Role;
import br.edu.ufpb.fisioquest.exception.ForbiddenPatientAccessException;
import br.edu.ufpb.fisioquest.repository.PatientRepository;
import br.edu.ufpb.fisioquest.repository.QuestionnaireResponseRepository;
import br.edu.ufpb.fisioquest.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Unit tests for PatientService.
 * Validates: Requirements 9.5, 11.2
 */
@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private QuestionnaireResponseRepository questionnaireResponseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PatientService patientService;

    private User physiotherapistA;
    private User physiotherapistB;
    private Patient patientOfA;
    private Patient patientOfB;

    @BeforeEach
    void setUp() {
        physiotherapistA = User.builder()
                .id(UUID.randomUUID())
                .fullName("Fisio A")
                .email("fisioa@test.com")
                .passwordHash("$2a$10$hash")
                .role(Role.FISIOTERAPEUTA)
                .failedLoginAttempts(0)
                .createdAt(Instant.now())
                .build();

        physiotherapistB = User.builder()
                .id(UUID.randomUUID())
                .fullName("Fisio B")
                .email("fisiob@test.com")
                .passwordHash("$2a$10$hash")
                .role(Role.FISIOTERAPEUTA)
                .failedLoginAttempts(0)
                .createdAt(Instant.now())
                .build();

        patientOfA = Patient.builder()
                .id(UUID.randomUUID())
                .fullName("Paciente de A")
                .birthDate(LocalDate.of(1990, 5, 15))
                .notes("Notas do paciente A")
                .physiotherapist(physiotherapistA)
                .createdAt(Instant.now())
                .build();

        patientOfB = Patient.builder()
                .id(UUID.randomUUID())
                .fullName("Paciente de B")
                .birthDate(LocalDate.of(1985, 3, 20))
                .notes("Notas do paciente B")
                .physiotherapist(physiotherapistB)
                .createdAt(Instant.now())
                .build();
    }

    // ========== getPatient - ownership check (Requirement 9.5) ==========

    @Test
    @DisplayName("getPatient com paciente de outro fisioterapeuta lança ForbiddenPatientAccessException")
    void getPatient_withPatientFromAnotherPhysiotherapist_throwsForbiddenPatientAccessException() {
        // Given: physiotherapist B tries to access a patient belonging to physiotherapist A
        when(userRepository.findById(physiotherapistB.getId())).thenReturn(Optional.of(physiotherapistB));
        when(patientRepository.findById(patientOfA.getId())).thenReturn(Optional.of(patientOfA));

        // When & Then: should throw ForbiddenPatientAccessException
        assertThatThrownBy(() -> patientService.getPatient(patientOfA.getId(), physiotherapistB.getId()))
                .isInstanceOf(ForbiddenPatientAccessException.class);
    }

    // ========== listPatients - isolation (Requirement 11.2) ==========

    @Test
    @DisplayName("listPatients não retorna pacientes de outros fisioterapeutas")
    void listPatients_doesNotReturnPatientsFromOtherPhysiotherapists() {
        // Given: repository returns only patients belonging to physiotherapist A
        when(userRepository.findById(physiotherapistA.getId())).thenReturn(Optional.of(physiotherapistA));
        when(patientRepository.findAllByPhysiotherapist(physiotherapistA)).thenReturn(List.of(patientOfA));

        // When
        List<PatientResponse> result = patientService.listPatients(physiotherapistA.getId());

        // Then: only patient of A is returned, patient of B is not present
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(patientOfA.getId());
        assertThat(result.get(0).fullName()).isEqualTo("Paciente de A");

        // Verify: no patient from physiotherapist B is in the results
        assertThat(result)
                .extracting(PatientResponse::id)
                .doesNotContain(patientOfB.getId());
    }
}
