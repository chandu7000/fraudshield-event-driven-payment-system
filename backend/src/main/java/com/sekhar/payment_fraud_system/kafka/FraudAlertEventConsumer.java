package com.sekhar.payment_fraud_system.kafka;

import com.sekhar.payment_fraud_system.service.AuditLogService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class FraudAlertEventConsumer {

    private final AuditLogService auditLogService;

    public FraudAlertEventConsumer(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @KafkaListener(
            topics = "fraud-alert-events",
            groupId = "notification-group"
    )
    public void consume(FraudAlertEvent event) {

        System.out.println("=================================");
        System.out.println("Fraud Alert Event Received");
        System.out.println("Fraud Alert ID: " + event.getFraudAlertId());
        System.out.println("Transaction ID: " + event.getTransactionId());
        System.out.println("Account Number: " + event.getAccountNumber());
        System.out.println("Reason: " + event.getAlertReason());
        System.out.println("Severity: " + event.getSeverity());
        System.out.println("=================================");

        auditLogService.logAction(
                "FRAUD_ALERT_CREATED",
                "SYSTEM",
                "Fraud Alert ID: " + event.getFraudAlertId()
                        + ", Transaction ID: " + event.getTransactionId()
                        + ", Account Number: " + event.getAccountNumber()
                        + ", Reason: " + event.getAlertReason()
                        + ", Severity: " + event.getSeverity()
        );
    }
}