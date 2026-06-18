package com.sekhar.payment_fraud_system.kafka;

public class FraudAlertEvent {

    private Long fraudAlertId;
    private Long transactionId;
    private String accountNumber;
    private String alertReason;
    private String severity;

    public FraudAlertEvent() {
    }

    public FraudAlertEvent(Long fraudAlertId, Long transactionId,
                           String accountNumber, String alertReason,
                           String severity) {
        this.fraudAlertId = fraudAlertId;
        this.transactionId = transactionId;
        this.accountNumber = accountNumber;
        this.alertReason = alertReason;
        this.severity = severity;
    }

    public Long getFraudAlertId() {
        return fraudAlertId;
    }

    public void setFraudAlertId(Long fraudAlertId) {
        this.fraudAlertId = fraudAlertId;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAlertReason() {
        return alertReason;
    }

    public void setAlertReason(String alertReason) {
        this.alertReason = alertReason;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}