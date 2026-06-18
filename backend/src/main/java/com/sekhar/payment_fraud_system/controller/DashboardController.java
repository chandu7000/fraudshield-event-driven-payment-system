package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.DashboardResponseDTO;
import com.sekhar.payment_fraud_system.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponseDTO getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}