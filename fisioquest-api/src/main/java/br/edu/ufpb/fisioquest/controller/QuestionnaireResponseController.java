package br.edu.ufpb.fisioquest.controller;

import br.edu.ufpb.fisioquest.dto.request.SaveResponseRequest;
import br.edu.ufpb.fisioquest.dto.response.QuestionnaireResponseDto;
import br.edu.ufpb.fisioquest.service.QuestionnaireResponseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/questionnaire-responses")
public class QuestionnaireResponseController {

    private final QuestionnaireResponseService questionnaireResponseService;

    public QuestionnaireResponseController(QuestionnaireResponseService questionnaireResponseService) {
        this.questionnaireResponseService = questionnaireResponseService;
    }

    @PostMapping
    public ResponseEntity<QuestionnaireResponseDto> saveResponse(@Valid @RequestBody SaveResponseRequest request,
                                                                 @AuthenticationPrincipal Jwt jwt) {
        UUID physiotherapistId = UUID.fromString(jwt.getSubject());
        QuestionnaireResponseDto response = questionnaireResponseService.saveResponse(request, physiotherapistId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
