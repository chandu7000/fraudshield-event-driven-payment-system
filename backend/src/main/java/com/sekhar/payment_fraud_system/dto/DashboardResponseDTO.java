package com.sekhar.payment_fraud_system.dto;

public class DashboardResponseDTO {

    private long totalAccounts;
    private long totalTransactions;
    private long totalFraudAlerts;
    private long highRiskAccounts;

    public DashboardResponseDTO(long totalAccounts, long totalTransactions,
                                long totalFraudAlerts, long highRiskAccounts) {
        this.totalAccounts = totalAccounts;
        this.totalTransactions = totalTransactions;
        this.totalFraudAlerts = totalFraudAlerts;
        this.highRiskAccounts = highRiskAccounts;
    }

    public long getTotalAccounts() {
        return totalAccounts;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public long getTotalFraudAlerts() {
        return totalFraudAlerts;
    }

    public long getHighRiskAccounts() {
        return highRiskAccounts;
    }
}