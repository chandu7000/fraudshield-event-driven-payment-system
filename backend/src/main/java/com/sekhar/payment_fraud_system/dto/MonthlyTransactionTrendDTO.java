package com.sekhar.payment_fraud_system.dto;

import java.math.BigDecimal;

public class MonthlyTransactionTrendDTO {

    private String month;
    private Long transactionCount;
    private BigDecimal totalAmount;

    public MonthlyTransactionTrendDTO(
            String month,
            Long transactionCount,
            BigDecimal totalAmount
    ) {
        this.month = month;
        this.transactionCount = transactionCount;
        this.totalAmount = totalAmount;
    }

    public String getMonth() {
        return month;
    }

    public Long getTransactionCount() {
        return transactionCount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
}