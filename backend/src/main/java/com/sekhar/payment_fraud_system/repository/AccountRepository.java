package com.sekhar.payment_fraud_system.repository;

import com.sekhar.payment_fraud_system.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);

    boolean existsByUserEmail(String userEmail);

    long countByStatus(String status);

    List<Account> findByUserEmail(String userEmail);

    Account findTopByOrderByIdDesc();
}