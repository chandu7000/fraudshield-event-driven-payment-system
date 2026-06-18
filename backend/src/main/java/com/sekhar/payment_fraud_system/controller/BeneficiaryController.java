package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.BeneficiaryRequestDTO;
import com.sekhar.payment_fraud_system.entity.Beneficiary;
import com.sekhar.payment_fraud_system.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @PostMapping
    public Beneficiary addBeneficiary(
            Authentication authentication,
            @Valid @RequestBody BeneficiaryRequestDTO requestDTO) {

        String ownerEmail = authentication.getName();

        return beneficiaryService.addBeneficiary(ownerEmail, requestDTO);
    }

    @GetMapping
    public List<Beneficiary> getMyBeneficiaries(Authentication authentication) {
        String ownerEmail = authentication.getName();

        return beneficiaryService.getMyBeneficiaries(ownerEmail);
    }

    @DeleteMapping("/{beneficiaryId}")
    public Map<String, String> deleteBeneficiary(
            Authentication authentication,
            @PathVariable Long beneficiaryId) {

        String ownerEmail = authentication.getName();

        beneficiaryService.deleteBeneficiary(ownerEmail, beneficiaryId);

        return Map.of("message", "Beneficiary deleted successfully");
    }
}