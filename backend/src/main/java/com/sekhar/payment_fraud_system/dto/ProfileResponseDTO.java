package com.sekhar.payment_fraud_system.dto;

public class ProfileResponseDTO {

    private String fullName;
    private String email;
    private String role;
    private String accountNumber;
    private String accountStatus;

    public ProfileResponseDTO() {
    }

    public ProfileResponseDTO(
            String fullName,
            String email,
            String role,
            String accountNumber,
            String accountStatus) {

        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.accountNumber = accountNumber;
        this.accountStatus = accountStatus;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }
}