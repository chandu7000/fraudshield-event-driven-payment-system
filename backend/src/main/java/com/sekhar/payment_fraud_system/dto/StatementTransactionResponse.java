package com.sekhar.payment_fraud_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StatementTransactionResponse {

    private Long id;
    private String type;
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private String status;
    private LocalDateTime transactionTime;

    public StatementTransactionResponse() {
    }

    public StatementTransactionResponse(Long id, String type, String fromAccountNumber,
                                        String toAccountNumber, BigDecimal amount,
                                        String status, LocalDateTime transactionTime) {
        this.id = id;
        this.type = type;
        this.fromAccountNumber = fromAccountNumber;
        this.toAccountNumber = toAccountNumber;
        this.amount = amount;
        this.status = status;
        this.transactionTime = transactionTime;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getFromAccountNumber() {
        return fromAccountNumber;
    }

    public String getToAccountNumber() {
        return toAccountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }
}