package br.edu.ufpb.fisioquest.controller;

import br.edu.ufpb.fisioquest.dto.request.CreatePatientRequest;
import br.edu.ufpb.fisioquest.dto.response.PatientDetailResponse;
import br.edu.ufpb.fisioquest.dto.response.PatientResponse;
import br.edu.ufpb.fisioquest.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<List<PatientResponse>> listPatients(@AuthenticationPrincipal Jwt jwt) {
        UUID physiotherapistId = UUID.fromString(jwt.getSubject());
        List<PatientResponse> list = patientService.listPatients(physiotherapistId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody CreatePatientRequest request,
                                                         @AuthenticationPrincipal Jwt jwt) {
        UUID physiotherapistId = UUID.fromString(jwt.getSubject());
        PatientResponse response = patientService.createPatient(request, physiotherapistId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientDetailResponse> getPatient(@PathVariable UUID patientId,
                                                            @AuthenticationPrincipal Jwt jwt) {
        UUID physiotherapistId = UUID.fromString(jwt.getSubject());
        PatientDetailResponse detail = patientService.getPatient(patientId, physiotherapistId);
        return ResponseEntity.ok(detail);
    }
}
