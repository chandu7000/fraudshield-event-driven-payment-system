package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.dto.StatementResponse;
import com.sekhar.payment_fraud_system.dto.StatementTransactionResponse;
import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.entity.Transaction;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class StatementService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public StatementService(TransactionRepository transactionRepository,
            AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    public StatementResponse getMyStatement(String email, LocalDate fromDate, LocalDate toDate) {

        List<Account> accounts = accountRepository.findByUserEmail(email);

        if (accounts.isEmpty()) {
            throw new RuntimeException("Account not found for logged-in user");
        }

        Account account = accounts.get(0);

        LocalDateTime startTime = fromDate.atStartOfDay();
        LocalDateTime endTime = toDate.atTime(LocalTime.MAX);

        List<Transaction> transactions = transactionRepository.findStatementTransactions(
                account.getAccountNumber(),
                startTime,
                endTime);

        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;

        List<StatementTransactionResponse> transactionResponses = transactions.stream()
                .map(transaction -> {

                    String type;

                    if (transaction.getToAccountNumber().equals(account.getAccountNumber())) {
                        type = "CREDIT";
                    } else {
                        type = "DEBIT";
                    }

                    return new StatementTransactionResponse(
                            transaction.getId(),
                            type,
                            transaction.getFromAccountNumber(),
                            transaction.getToAccountNumber(),
                            transaction.getAmount(),
                            transaction.getStatus(),
                            transaction.getTransactionTime());
                })
                .toList();

        for (Transaction transaction : transactions) {
            if (transaction.getToAccountNumber().equals(account.getAccountNumber())) {
                totalCredits = totalCredits.add(transaction.getAmount());
            }

            if (transaction.getFromAccountNumber().equals(account.getAccountNumber())) {
                totalDebits = totalDebits.add(transaction.getAmount());
            }
        }

        BigDecimal netAmount = totalCredits.subtract(totalDebits);

        return new StatementResponse(
                account.getAccountNumber(),
                account.getAccountHolderName(),
                fromDate,
                toDate,
                account.getBalance(),
                totalCredits,
                totalDebits,
                netAmount,
                transactions.size(),
                transactionResponses);
    }
}