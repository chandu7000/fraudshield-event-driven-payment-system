package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.entity.Transaction;
import com.sekhar.payment_fraud_system.exception.InsufficientBalanceException;
import com.sekhar.payment_fraud_system.exception.ResourceNotFoundException;
import com.sekhar.payment_fraud_system.kafka.TransactionEvent;
import com.sekhar.payment_fraud_system.kafka.TransactionEventProducer;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class TransactionService {

        private static final BigDecimal DAILY_TRANSFER_LIMIT = new BigDecimal("100000");
        private static final BigDecimal MONTHLY_TRANSFER_LIMIT = new BigDecimal("2000000");

        private final TransactionRepository transactionRepository;
        private final AccountRepository accountRepository;
        private final AuditLogService auditLogService;
        private final TransactionEventProducer transactionEventProducer;
        private final NotificationService notificationService;
        private final BeneficiaryService beneficiaryService;
        private final FraudDetectionService fraudDetectionService;

        public TransactionService(
                        TransactionRepository transactionRepository,
                        AccountRepository accountRepository,
                        AuditLogService auditLogService,
                        TransactionEventProducer transactionEventProducer,
                        NotificationService notificationService,
                        BeneficiaryService beneficiaryService,
                        FraudDetectionService fraudDetectionService) {
                this.transactionRepository = transactionRepository;
                this.accountRepository = accountRepository;
                this.auditLogService = auditLogService;
                this.transactionEventProducer = transactionEventProducer;
                this.notificationService = notificationService;
                this.beneficiaryService = beneficiaryService;
                this.fraudDetectionService = fraudDetectionService;
        }

        @Transactional
        public Transaction createTransaction(Transaction transaction) {

                Account fromAccount = accountRepository.findByAccountNumber(
                                transaction.getFromAccountNumber())
                                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

                Account toAccount = accountRepository.findByAccountNumber(
                                transaction.getToAccountNumber())
                                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

                if ("FROZEN".equalsIgnoreCase(fromAccount.getStatus())) {
                        throw new RuntimeException("Sender account is frozen. Transactions are not allowed.");
                }

                if ("FROZEN".equalsIgnoreCase(toAccount.getStatus())) {
                        throw new RuntimeException("Receiver account is frozen. Transactions are not allowed.");
                }

                validateTransferLimits(
                                fromAccount.getAccountNumber(),
                                transaction.getAmount());

                if (fromAccount.getBalance().compareTo(transaction.getAmount()) < 0) {
                        throw new InsufficientBalanceException("Insufficient balance in sender account");
                }

                fromAccount.setBalance(
                                fromAccount.getBalance().subtract(transaction.getAmount()));

                toAccount.setBalance(
                                toAccount.getBalance().add(transaction.getAmount()));

                accountRepository.save(fromAccount);
                accountRepository.save(toAccount);

                transaction.setTransactionType("TRANSFER");
                transaction.setStatus("SUCCESS");

                Transaction savedTransaction = transactionRepository.save(transaction);
                fraudDetectionService.checkTransactionForFraud(savedTransaction);

                TransactionEvent transactionEvent = new TransactionEvent(
                                savedTransaction.getId(),
                                savedTransaction.getFromAccountNumber(),
                                savedTransaction.getToAccountNumber(),
                                savedTransaction.getAmount(),
                                savedTransaction.getTransactionTime().toString());

                transactionEventProducer.sendTransactionEvent(transactionEvent);

                auditLogService.logAction(
                                "MONEY_TRANSFER",
                                "SYSTEM",
                                "Transfer from " +
                                                savedTransaction.getFromAccountNumber() +
                                                " to " +
                                                savedTransaction.getToAccountNumber() +
                                                " Amount: " +
                                                savedTransaction.getAmount());

                if (fromAccount.getUserEmail() != null && !fromAccount.getUserEmail().isBlank()) {
                        notificationService.createNotification(
                                        fromAccount.getUserEmail(),
                                        "Money Sent",
                                        "₹" + savedTransaction.getAmount() +
                                                        " sent to " + toAccount.getAccountNumber(),
                                        "TRANSACTION");

                        notificationService.sendEmail(
                                        fromAccount.getUserEmail(),
                                        "FraudShield Money Sent",
                                        "Hello,\n\n₹" + savedTransaction.getAmount() +
                                                        " was sent from your account " + fromAccount.getAccountNumber()
                                                        +
                                                        " to account " + toAccount.getAccountNumber() +
                                                        ".\n\nTransaction ID: " + savedTransaction.getId() +
                                                        "\nStatus: SUCCESS\n\nRegards,\nFraudShield Team");
                }

                if (toAccount.getUserEmail() != null && !toAccount.getUserEmail().isBlank()) {
                        notificationService.createNotification(
                                        toAccount.getUserEmail(),
                                        "Money Received",
                                        "₹" + savedTransaction.getAmount() +
                                                        " received from " + fromAccount.getAccountNumber(),
                                        "TRANSACTION");

                        notificationService.sendEmail(
                                        toAccount.getUserEmail(),
                                        "FraudShield Money Received",
                                        "Hello,\n\n₹" + savedTransaction.getAmount() +
                                                        " was received into your account "
                                                        + toAccount.getAccountNumber() +
                                                        " from account " + fromAccount.getAccountNumber() +
                                                        ".\n\nTransaction ID: " + savedTransaction.getId() +
                                                        "\nStatus: SUCCESS\n\nRegards,\nFraudShield Team");
                }

                return savedTransaction;
        }

        @Transactional
        public Transaction createAdminAssistedTransfer(
                        String adminEmail,
                        String fromAccountNumber,
                        String toAccountNumber,
                        BigDecimal amount,
                        String reason,
                        String remarks) {

                Account fromAccount = accountRepository.findByAccountNumber(fromAccountNumber)
                                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

                Account toAccount = accountRepository.findByAccountNumber(toAccountNumber)
                                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

                if (fromAccount.getAccountNumber().equals(toAccount.getAccountNumber())) {
                        throw new RuntimeException("Sender and receiver account cannot be same");
                }

                if ("FROZEN".equalsIgnoreCase(fromAccount.getStatus())) {
                        throw new RuntimeException("Sender account is frozen. Admin transfer is not allowed.");
                }

                if ("FROZEN".equalsIgnoreCase(toAccount.getStatus())) {
                        throw new RuntimeException("Receiver account is frozen. Admin transfer is not allowed.");
                }

                if (fromAccount.getBalance().compareTo(amount) < 0) {
                        throw new InsufficientBalanceException("Insufficient balance in sender account");
                }

                fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
                toAccount.setBalance(toAccount.getBalance().add(amount));

                accountRepository.save(fromAccount);
                accountRepository.save(toAccount);

                Transaction transaction = new Transaction();
                transaction.setFromAccountNumber(fromAccount.getAccountNumber());
                transaction.setToAccountNumber(toAccount.getAccountNumber());
                transaction.setAmount(amount);
                transaction.setTransactionType("ADMIN_ASSISTED_TRANSFER");
                transaction.setStatus("SUCCESS");

                Transaction savedTransaction = transactionRepository.save(transaction);

                fraudDetectionService.checkTransactionForFraud(savedTransaction);

                TransactionEvent transactionEvent = new TransactionEvent(
                                savedTransaction.getId(),
                                savedTransaction.getFromAccountNumber(),
                                savedTransaction.getToAccountNumber(),
                                savedTransaction.getAmount(),
                                savedTransaction.getTransactionTime().toString());

                transactionEventProducer.sendTransactionEvent(transactionEvent);

                auditLogService.logAction(
                                "ADMIN_ASSISTED_TRANSFER",
                                adminEmail,
                                "Admin assisted transfer completed. From " +
                                                savedTransaction.getFromAccountNumber() +
                                                " to " +
                                                savedTransaction.getToAccountNumber() +
                                                " Amount: " +
                                                savedTransaction.getAmount() +
                                                " Reason: " +
                                                reason +
                                                " Remarks: " +
                                                (remarks == null || remarks.isBlank() ? "-" : remarks));

                if (fromAccount.getUserEmail() != null && !fromAccount.getUserEmail().isBlank()) {
                        notificationService.createNotification(
                                        fromAccount.getUserEmail(),
                                        "Admin Assisted Debit",
                                        "₹" + savedTransaction.getAmount() +
                                                        " debited from your account by bank admin. Reason: " + reason,
                                        "TRANSACTION");

                        notificationService.sendEmailSafe(
                                        fromAccount.getUserEmail(),
                                        "FraudShield Admin Assisted Debit",
                                        "Hello,\n\n₹" + savedTransaction.getAmount() +
                                                        " was debited from your account "
                                                        + fromAccount.getAccountNumber() +
                                                        " by bank admin.\n\nReason: " + reason +
                                                        "\nRemarks: "
                                                        + (remarks == null || remarks.isBlank() ? "-" : remarks) +
                                                        "\nTransaction ID: " + savedTransaction.getId() +
                                                        "\nStatus: SUCCESS\n\nRegards,\nFraudShield Team");
                }

                if (toAccount.getUserEmail() != null && !toAccount.getUserEmail().isBlank()) {
                        notificationService.createNotification(
                                        toAccount.getUserEmail(),
                                        "Admin Assisted Credit",
                                        "₹" + savedTransaction.getAmount() +
                                                        " credited to your account by bank admin. Reason: " + reason,
                                        "TRANSACTION");

                        notificationService.sendEmailSafe(
                                        toAccount.getUserEmail(),
                                        "FraudShield Admin Assisted Credit",
                                        "Hello,\n\n₹" + savedTransaction.getAmount() +
                                                        " was credited to your account " + toAccount.getAccountNumber()
                                                        +
                                                        " by bank admin.\n\nReason: " + reason +
                                                        "\nRemarks: "
                                                        + (remarks == null || remarks.isBlank() ? "-" : remarks) +
                                                        "\nTransaction ID: " + savedTransaction.getId() +
                                                        "\nStatus: SUCCESS\n\nRegards,\nFraudShield Team");
                }

                return savedTransaction;
        }

        @Transactional
        public Transaction createMyTransfer(
                        String userEmail,
                        String toAccountNumber,
                        BigDecimal amount,
                        String deviceId,
                        String location) {
                Account fromAccount = accountRepository.findByUserEmail(userEmail)
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No account found for user: " + userEmail));

                Account toAccount = accountRepository.findByAccountNumber(toAccountNumber)
                                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

                if (fromAccount.getAccountNumber().equals(toAccount.getAccountNumber())) {
                        throw new RuntimeException("You cannot transfer money to your own account");
                }

                beneficiaryService.validateActiveBeneficiary(
                                userEmail,
                                toAccount.getAccountNumber());

                Transaction transaction = new Transaction();

                transaction.setFromAccountNumber(fromAccount.getAccountNumber());
                transaction.setToAccountNumber(toAccount.getAccountNumber());
                transaction.setAmount(amount);
                transaction.setDeviceId(deviceId);
                transaction.setLocation(location);

                return createTransaction(transaction);
        }

        public List<Transaction> getAllTransactions() {
                return transactionRepository.findAll();
        }

        public List<Transaction> getTransactionsByAccount(String accountNumber) {
                return transactionRepository.findByFromAccountNumberOrToAccountNumber(
                                accountNumber,
                                accountNumber);
        }

        public List<Transaction> getMyTransactions(String userEmail) {
                List<Account> myAccounts = accountRepository.findByUserEmail(userEmail);

                List<String> myAccountNumbers = myAccounts.stream()
                                .map(Account::getAccountNumber)
                                .toList();

                if (myAccountNumbers.isEmpty()) {
                        return List.of();
                }

                return transactionRepository.findByFromAccountNumberInOrToAccountNumberIn(
                                myAccountNumbers,
                                myAccountNumbers);
        }

        private void validateTransferLimits(
                        String fromAccountNumber,
                        BigDecimal transferAmount) {
                LocalDate today = LocalDate.now();

                LocalDateTime dayStart = today.atStartOfDay();
                LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

                LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
                LocalDateTime monthEnd = today
                                .withDayOfMonth(today.lengthOfMonth())
                                .atTime(LocalTime.MAX);

                BigDecimal dailyUsed = transactionRepository.getTotalSentAmountBetween(
                                fromAccountNumber,
                                dayStart,
                                dayEnd);

                BigDecimal monthlyUsed = transactionRepository.getTotalSentAmountBetween(
                                fromAccountNumber,
                                monthStart,
                                monthEnd);

                if (dailyUsed == null) {
                        dailyUsed = BigDecimal.ZERO;
                }

                if (monthlyUsed == null) {
                        monthlyUsed = BigDecimal.ZERO;
                }

                BigDecimal dailyAfterTransfer = dailyUsed.add(transferAmount);
                BigDecimal monthlyAfterTransfer = monthlyUsed.add(transferAmount);

                if (dailyAfterTransfer.compareTo(DAILY_TRANSFER_LIMIT) > 0) {
                        throw new RuntimeException(
                                        "Daily transfer limit exceeded. Daily limit is ₹" +
                                                        DAILY_TRANSFER_LIMIT);
                }

                if (monthlyAfterTransfer.compareTo(MONTHLY_TRANSFER_LIMIT) > 0) {
                        throw new RuntimeException(
                                        "Monthly transfer limit exceeded. Monthly limit is ₹" +
                                                        MONTHLY_TRANSFER_LIMIT);
                }
        }
}