package com.sekhar.payment_fraud_system.dto;

public class AccountAnalyticsReportDTO {

    private Long totalAccounts;
    private Long activeAccounts;
    private Long frozenAccounts;
    private Long highRiskAccounts;

    public AccountAnalyticsReportDTO(
            Long totalAccounts,
            Long activeAccounts,
            Long frozenAccounts,
            Long highRiskAccounts
    ) {
        this.totalAccounts = totalAccounts;
        this.activeAccounts = activeAccounts;
        this.frozenAccounts = frozenAccounts;
        this.highRiskAccounts = highRiskAccounts;
    }

    public Long getTotalAccounts() {
        return totalAccounts;
    }

    public Long getActiveAccounts() {
        return activeAccounts;
    }

    public Long getFrozenAccounts() {
        return frozenAccounts;
    }

    public Long getHighRiskAccounts() {
        return highRiskAccounts;
    }
}