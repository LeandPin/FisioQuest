package br.edu.ufpb.fisioquest.repository;

import br.edu.ufpb.fisioquest.entity.Patient;
import br.edu.ufpb.fisioquest.entity.QuestionnaireResponse;
import br.edu.ufpb.fisioquest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionnaireResponseRepository extends JpaRepository<QuestionnaireResponse, UUID> {

    List<QuestionnaireResponse> findAllByPatientAndPhysiotherapist(Patient patient, User physiotherapist);

    long countByPhysiotherapist(User physiotherapist);

    Optional<QuestionnaireResponse> findTopByPhysiotherapistOrderByAppliedAtDesc(User physiotherapist);

    List<QuestionnaireResponse> findAllByPhysiotherapist(User physiotherapist);
}
