package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.entity.FraudAlert;
import com.sekhar.payment_fraud_system.repository.FraudAlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FraudAlertService {

    private final FraudAlertRepository fraudAlertRepository;

    public FraudAlertService(FraudAlertRepository fraudAlertRepository) {
        this.fraudAlertRepository = fraudAlertRepository;
    }

    public List<FraudAlert> getAllFraudAlerts() {
        return fraudAlertRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<FraudAlert> getByStatus(String status) {
        return fraudAlertRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<FraudAlert> getByAccountNumber(String accountNumber) {
        return fraudAlertRepository.findByAccountNumberOrderByCreatedAtDesc(accountNumber);
    }

    public FraudAlert resolveFraudAlert(Long alertId) {
        FraudAlert fraudAlert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Fraud alert not found"));

        fraudAlert.setStatus("RESOLVED");

        return fraudAlertRepository.save(fraudAlert);
    }
}