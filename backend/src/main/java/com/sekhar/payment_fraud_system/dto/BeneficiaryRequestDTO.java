package com.sekhar.payment_fraud_system.dto;

import jakarta.validation.constraints.NotBlank;

public class BeneficiaryRequestDTO {

    @NotBlank(message = "Beneficiary name is required")
    private String beneficiaryName;

    @NotBlank(message = "Beneficiary account number is required")
    private String beneficiaryAccountNumber;

    public BeneficiaryRequestDTO() {
    }

    public String getBeneficiaryName() {
        return beneficiaryName;
    }

    public void setBeneficiaryName(String beneficiaryName) {
        this.beneficiaryName = beneficiaryName;
    }

    public String getBeneficiaryAccountNumber() {
        return beneficiaryAccountNumber;
    }

    public void setBeneficiaryAccountNumber(String beneficiaryAccountNumber) {
        this.beneficiaryAccountNumber = beneficiaryAccountNumber;
    }
}