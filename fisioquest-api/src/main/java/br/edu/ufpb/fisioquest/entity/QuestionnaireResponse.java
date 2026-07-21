package br.edu.ufpb.fisioquest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "questionnaire_responses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionnaireResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "physiotherapist_id", nullable = false)
    private User physiotherapist;

    @Column(nullable = false, length = 100)
    private String questionnaireType;

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> responses;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal score;

    @Column(nullable = false)
    private Instant appliedAt;
}
