package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.dto.BeneficiaryRequestDTO;
import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.entity.Beneficiary;
import com.sekhar.payment_fraud_system.exception.ResourceNotFoundException;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.BeneficiaryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;

    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            AccountRepository accountRepository
    ) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.accountRepository = accountRepository;
    }

    public Beneficiary addBeneficiary(
            String ownerEmail,
            BeneficiaryRequestDTO requestDTO
    ) {

        Account beneficiaryAccount = accountRepository
                .findByAccountNumber(requestDTO.getBeneficiaryAccountNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Beneficiary account number does not exist"
                        )
                );

        if (beneficiaryAccount.getUserEmail().equals(ownerEmail)) {
            throw new RuntimeException("You cannot add your own account as beneficiary");
        }

        if (beneficiaryRepository.existsByOwnerEmailAndBeneficiaryAccountNumber(
                ownerEmail,
                requestDTO.getBeneficiaryAccountNumber()
        )) {
            throw new RuntimeException("Beneficiary already added");
        }

        Beneficiary beneficiary = new Beneficiary();

        beneficiary.setOwnerEmail(ownerEmail);
        beneficiary.setBeneficiaryName(beneficiaryAccount.getAccountHolderName());
        beneficiary.setBeneficiaryAccountNumber(beneficiaryAccount.getAccountNumber());
        beneficiary.setStatus("PENDING");
        beneficiary.setActivatedAt(LocalDateTime.now().plusMinutes(2));

        return beneficiaryRepository.save(beneficiary);
    }

    public List<Beneficiary> getMyBeneficiaries(String ownerEmail) {
        List<Beneficiary> beneficiaries = beneficiaryRepository.findByOwnerEmail(ownerEmail);

        boolean updated = false;

        for (Beneficiary beneficiary : beneficiaries) {
            if (
                    "PENDING".equalsIgnoreCase(beneficiary.getStatus()) &&
                    beneficiary.getActivatedAt() != null &&
                    LocalDateTime.now().isAfter(beneficiary.getActivatedAt())
            ) {
                beneficiary.setStatus("ACTIVE");
                updated = true;
            }
        }

        if (updated) {
            beneficiaryRepository.saveAll(beneficiaries);
        }

        return beneficiaries;
    }

    public void validateActiveBeneficiary(
            String ownerEmail,
            String beneficiaryAccountNumber
    ) {
        Beneficiary beneficiary = beneficiaryRepository
                .findByOwnerEmailAndBeneficiaryAccountNumber(
                        ownerEmail,
                        beneficiaryAccountNumber
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Please add this account as beneficiary before transfer"
                        )
                );

        if (
                "PENDING".equalsIgnoreCase(beneficiary.getStatus()) &&
                beneficiary.getActivatedAt() != null &&
                LocalDateTime.now().isAfter(beneficiary.getActivatedAt())
        ) {
            beneficiary.setStatus("ACTIVE");
            beneficiaryRepository.save(beneficiary);
        }

        if (!"ACTIVE".equalsIgnoreCase(beneficiary.getStatus())) {
            throw new RuntimeException(
                    "Beneficiary is pending activation. You can transfer after " +
                            beneficiary.getActivatedAt()
            );
        }
    }

    public void deleteBeneficiary(String ownerEmail, Long beneficiaryId) {

        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Beneficiary not found")
                );

        if (!beneficiary.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You are not allowed to delete this beneficiary");
        }

        beneficiaryRepository.delete(beneficiary);
    }
}