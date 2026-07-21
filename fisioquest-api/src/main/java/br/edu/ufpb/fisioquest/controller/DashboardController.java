package br.edu.ufpb.fisioquest.controller;

import br.edu.ufpb.fisioquest.dto.response.DashboardResponse;
import br.edu.ufpb.fisioquest.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        UUID physiotherapistId = UUID.fromString(jwt.getSubject());
        DashboardResponse response = dashboardService.getDashboard(physiotherapistId);
        return ResponseEntity.ok(response);
    }
}
