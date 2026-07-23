ALTER TABLE patients ADD COLUMN sex VARCHAR(20) NOT NULL DEFAULT 'Não informado';
ALTER TABLE patients ADD COLUMN cpf VARCHAR(14) NULL;
ALTER TABLE patients ADD COLUMN phone VARCHAR(20) NULL;
ALTER TABLE patients ADD COLUMN address TEXT NULL;
ALTER TABLE patients ADD COLUMN medical_diagnosis TEXT NULL;
ALTER TABLE patients ADD COLUMN main_complaint TEXT NULL;

-- Remove default after backfilling existing rows
ALTER TABLE patients ALTER COLUMN sex DROP DEFAULT;
