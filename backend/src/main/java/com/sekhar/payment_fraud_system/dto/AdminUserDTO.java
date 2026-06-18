package com.sekhar.payment_fraud_system.dto;

public class AdminUserDTO {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Boolean enabled;
    private String accountNumber;
    private String accountStatus;

    public AdminUserDTO(
            Long id,
            String fullName,
            String email,
            String role,
            Boolean enabled,
            String accountNumber,
            String accountStatus
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.accountNumber = accountNumber;
        this.accountStatus = accountStatus;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountStatus() {
        return accountStatus;
    }
}