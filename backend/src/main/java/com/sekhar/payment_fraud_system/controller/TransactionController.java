package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.SecureTransferRequestDTO;
import com.sekhar.payment_fraud_system.dto.TransactionRequestDTO;
import com.sekhar.payment_fraud_system.dto.AdminTransferRequestDTO;
import com.sekhar.payment_fraud_system.entity.Transaction;
import com.sekhar.payment_fraud_system.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public Transaction createTransaction(
            @Valid @RequestBody TransactionRequestDTO requestDTO) {

        Transaction transaction = new Transaction();

        transaction.setFromAccountNumber(requestDTO.getFromAccountNumber());
        transaction.setToAccountNumber(requestDTO.getToAccountNumber());
        transaction.setAmount(requestDTO.getAmount());

        return transactionService.createTransaction(transaction);
    }

    @PostMapping("/admin-transfer")
    public Transaction createAdminTransfer(
            @Valid @RequestBody AdminTransferRequestDTO requestDTO,
            Authentication authentication) {
        String adminEmail = authentication.getName();

        return transactionService.createAdminAssistedTransfer(
                adminEmail,
                requestDTO.getFromAccountNumber(),
                requestDTO.getToAccountNumber(),
                requestDTO.getAmount(),
                requestDTO.getReason(),
                requestDTO.getRemarks());
    }

    @PostMapping("/my-transfer")
    public Transaction createMyTransfer(
            @Valid @RequestBody SecureTransferRequestDTO requestDTO,
            Authentication authentication) {

        String userEmail = authentication.getName();

        return transactionService.createMyTransfer(
                userEmail,
                requestDTO.getToAccountNumber(),
                requestDTO.getAmount(),
                requestDTO.getDeviceId(),
                requestDTO.getLocation());
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @GetMapping("/my")
    public List<Transaction> getMyTransactions(
            Authentication authentication) {

        String userEmail = authentication.getName();

        return transactionService.getMyTransactions(userEmail);
    }

    @GetMapping("/account/{accountNumber}")
    public List<Transaction> getTransactionsByAccount(
            @PathVariable String accountNumber) {
        return transactionService.getTransactionsByAccount(accountNumber);
    }
}