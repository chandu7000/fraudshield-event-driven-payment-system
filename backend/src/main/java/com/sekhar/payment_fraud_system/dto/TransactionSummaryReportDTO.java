package com.sekhar.payment_fraud_system.dto;

import java.math.BigDecimal;

public class TransactionSummaryReportDTO {

    private Long totalTransactions;
    private BigDecimal totalTransferAmount;
    private Long todayTransactions;
    private BigDecimal todayTransferAmount;
    private Long monthTransactions;
    private BigDecimal monthTransferAmount;

    public TransactionSummaryReportDTO() {
    }

    public TransactionSummaryReportDTO(
            Long totalTransactions,
            BigDecimal totalTransferAmount,
            Long todayTransactions,
            BigDecimal todayTransferAmount,
            Long monthTransactions,
            BigDecimal monthTransferAmount
    ) {
        this.totalTransactions = totalTransactions;
        this.totalTransferAmount = totalTransferAmount;
        this.todayTransactions = todayTransactions;
        this.todayTransferAmount = todayTransferAmount;
        this.monthTransactions = monthTransactions;
        this.monthTransferAmount = monthTransferAmount;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public BigDecimal getTotalTransferAmount() {
        return totalTransferAmount;
    }

    public Long getTodayTransactions() {
        return todayTransactions;
    }

    public BigDecimal getTodayTransferAmount() {
        return todayTransferAmount;
    }

    public Long getMonthTransactions() {
        return monthTransactions;
    }

    public BigDecimal getMonthTransferAmount() {
        return monthTransferAmount;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public void setTotalTransferAmount(BigDecimal totalTransferAmount) {
        this.totalTransferAmount = totalTransferAmount;
    }

    public void setTodayTransactions(Long todayTransactions) {
        this.todayTransactions = todayTransactions;
    }

    public void setTodayTransferAmount(BigDecimal todayTransferAmount) {
        this.todayTransferAmount = todayTransferAmount;
    }

    public void setMonthTransactions(Long monthTransactions) {
        this.monthTransactions = monthTransactions;
    }

    public void setMonthTransferAmount(BigDecimal monthTransferAmount) {
        this.monthTransferAmount = monthTransferAmount;
    }
}