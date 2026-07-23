package br.edu.ufpb.fisioquest.dto.request;

public record UpdatePatientRequest(
    String medicalDiagnosis,
    String mainComplaint
) {}
