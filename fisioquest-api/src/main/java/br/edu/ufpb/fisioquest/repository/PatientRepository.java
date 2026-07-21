package br.edu.ufpb.fisioquest.repository;

import br.edu.ufpb.fisioquest.entity.Patient;
import br.edu.ufpb.fisioquest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    List<Patient> findAllByPhysiotherapist(User physiotherapist);

    Optional<Patient> findByIdAndPhysiotherapist(UUID id, User physiotherapist);
}
