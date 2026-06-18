package com.sekhar.payment_fraud_system.dto;

public class FraudAnalyticsReportDTO {

    private Long totalFraudAlerts;
    private Long highSeverityAlerts;
    private Long mediumSeverityAlerts;
    private Long openAlerts;
    private Long resolvedAlerts;

    public FraudAnalyticsReportDTO() {
    }

    public FraudAnalyticsReportDTO(
            Long totalFraudAlerts,
            Long highSeverityAlerts,
            Long mediumSeverityAlerts,
            Long openAlerts,
            Long resolvedAlerts
    ) {
        this.totalFraudAlerts = totalFraudAlerts;
        this.highSeverityAlerts = highSeverityAlerts;
        this.mediumSeverityAlerts = mediumSeverityAlerts;
        this.openAlerts = openAlerts;
        this.resolvedAlerts = resolvedAlerts;
    }

    public Long getTotalFraudAlerts() {
        return totalFraudAlerts;
    }

    public Long getHighSeverityAlerts() {
        return highSeverityAlerts;
    }

    public Long getMediumSeverityAlerts() {
        return mediumSeverityAlerts;
    }

    public Long getOpenAlerts() {
        return openAlerts;
    }

    public Long getResolvedAlerts() {
        return resolvedAlerts;
    }

    public void setTotalFraudAlerts(Long totalFraudAlerts) {
        this.totalFraudAlerts = totalFraudAlerts;
    }

    public void setHighSeverityAlerts(Long highSeverityAlerts) {
        this.highSeverityAlerts = highSeverityAlerts;
    }

    public void setMediumSeverityAlerts(Long mediumSeverityAlerts) {
        this.mediumSeverityAlerts = mediumSeverityAlerts;
    }

    public void setOpenAlerts(Long openAlerts) {
        this.openAlerts = openAlerts;
    }

    public void setResolvedAlerts(Long resolvedAlerts) {
        this.resolvedAlerts = resolvedAlerts;
    }
}