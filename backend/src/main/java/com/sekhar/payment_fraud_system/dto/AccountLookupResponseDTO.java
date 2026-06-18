package com.sekhar.payment_fraud_system.dto;

public class AccountLookupResponseDTO {

    private String accountNumber;
    private String accountHolderName;

    public AccountLookupResponseDTO(String accountNumber, String accountHolderName) {
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }
}