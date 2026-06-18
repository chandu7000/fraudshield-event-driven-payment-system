package com.sekhar.payment_fraud_system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class StatementResponse {

    private String accountNumber;
    private String accountHolderName;

    private LocalDate fromDate;
    private LocalDate toDate;

    private BigDecimal currentBalance;
    private BigDecimal totalCredits;
    private BigDecimal totalDebits;
    private BigDecimal netAmount;

    private int transactionCount;

    private List<StatementTransactionResponse> transactions;

    public StatementResponse() {
    }

    public StatementResponse(
            String accountNumber,
            String accountHolderName,
            LocalDate fromDate,
            LocalDate toDate,
            BigDecimal currentBalance,
            BigDecimal totalCredits,
            BigDecimal totalDebits,
            BigDecimal netAmount,
            int transactionCount,
            List<StatementTransactionResponse> transactions
    ) {
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.currentBalance = currentBalance;
        this.totalCredits = totalCredits;
        this.totalDebits = totalDebits;
        this.netAmount = netAmount;
        this.transactionCount = transactionCount;
        this.transactions = transactions;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public BigDecimal getTotalCredits() {
        return totalCredits;
    }

    public BigDecimal getTotalDebits() {
        return totalDebits;
    }

    public BigDecimal getNetAmount() {
        return netAmount;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    public List<StatementTransactionResponse> getTransactions() {
        return transactions;
    }
}