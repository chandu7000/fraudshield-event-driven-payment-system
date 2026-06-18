package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.entity.FraudAlert;
import com.sekhar.payment_fraud_system.service.FraudAlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fraud-alerts")
public class FraudAlertController {

    private final FraudAlertService fraudAlertService;

    public FraudAlertController(FraudAlertService fraudAlertService) {
        this.fraudAlertService = fraudAlertService;
    }

    @GetMapping
    public List<FraudAlert> getAllFraudAlerts() {
        return fraudAlertService.getAllFraudAlerts();
    }

    @GetMapping("/status/{status}")
    public List<FraudAlert> getByStatus(@PathVariable String status) {
        return fraudAlertService.getByStatus(status);
    }

    @GetMapping("/account/{accountNumber}")
    public List<FraudAlert> getByAccountNumber(@PathVariable String accountNumber) {
        return fraudAlertService.getByAccountNumber(accountNumber);
    }

    @PutMapping("/{alertId}/resolve")
    public FraudAlert resolveFraudAlert(@PathVariable Long alertId) {
        return fraudAlertService.resolveFraudAlert(alertId);
    }
}