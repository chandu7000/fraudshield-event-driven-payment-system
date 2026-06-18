package com.sekhar.payment_fraud_system.repository;

import com.sekhar.payment_fraud_system.entity.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {

    List<FraudAlert> findByAccountNumber(String accountNumber);

    List<FraudAlert> findByStatus(String status);

    List<FraudAlert> findBySeverity(String severity);

    long countByAccountNumber(String accountNumber);

    long countBySeverity(String severity);

    long countByStatus(String status);

    long countByAccountNumberAndSeverityIn(
            String accountNumber,
            List<String> severities
    );
}