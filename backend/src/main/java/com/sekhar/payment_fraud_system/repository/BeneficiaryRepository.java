package com.sekhar.payment_fraud_system.repository;

import com.sekhar.payment_fraud_system.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByOwnerEmail(String ownerEmail);

    Optional<Beneficiary> findByOwnerEmailAndBeneficiaryAccountNumber(
            String ownerEmail,
            String beneficiaryAccountNumber
    );

    boolean existsByOwnerEmailAndBeneficiaryAccountNumber(
            String ownerEmail,
            String beneficiaryAccountNumber
    );
}