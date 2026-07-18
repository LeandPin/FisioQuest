CREATE TABLE patients (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name            VARCHAR(255) NOT NULL,
    birth_date           DATE NULL,
    notes                TEXT NULL,
    physiotherapist_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_physiotherapist_id ON patients(physiotherapist_id);

CREATE TABLE questionnaire_responses (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id           UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    physiotherapist_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    questionnaire_type   VARCHAR(100) NOT NULL,
    responses            JSONB NOT NULL,
    score                NUMERIC(10, 2) NOT NULL,
    applied_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_patient_id ON questionnaire_responses(patient_id);
CREATE INDEX idx_qr_physiotherapist_id ON questionnaire_responses(physiotherapist_id);
CREATE INDEX idx_qr_type ON questionnaire_responses(questionnaire_type);
