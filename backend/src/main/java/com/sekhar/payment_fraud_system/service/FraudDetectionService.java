package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.entity.FraudAlert;
import com.sekhar.payment_fraud_system.entity.Transaction;
import com.sekhar.payment_fraud_system.kafka.FraudAlertEvent;
import com.sekhar.payment_fraud_system.kafka.FraudAlertEventProducer;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.FraudAlertRepository;
import com.sekhar.payment_fraud_system.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FraudDetectionService {

    private static final BigDecimal LOW_AMOUNT_ALERT_LIMIT = new BigDecimal("50000");

    private final FraudAlertRepository fraudAlertRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final FraudAlertEventProducer fraudAlertEventProducer;
    private final NotificationService notificationService;

    public FraudDetectionService(
            FraudAlertRepository fraudAlertRepository,
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            FraudAlertEventProducer fraudAlertEventProducer,
            NotificationService notificationService
    ) {
        this.fraudAlertRepository = fraudAlertRepository;
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.fraudAlertEventProducer = fraudAlertEventProducer;
        this.notificationService = notificationService;
    }

    public void checkTransactionForFraud(Transaction transaction) {

        if (transaction.getAmount().compareTo(LOW_AMOUNT_ALERT_LIMIT) > 0) {
            createAndNotifyFraudAlert(
                    transaction,
                    "Large transaction above ₹50,000 detected. Transaction allowed for monitoring.",
                    "LOW"
            );
        }

        LocalDateTime threeMinutesAgo = LocalDateTime.now().minusMinutes(3);

        List<Transaction> recentTransactions =
                transactionRepository.findRecentSuccessfulTransactions(
                        transaction.getFromAccountNumber(),
                        threeMinutesAgo
                );

        boolean repeatedTransfers = recentTransactions.size() >= 3;

        boolean differentDeviceDetected = hasDifferentDevice(transaction, recentTransactions);

        boolean differentLocationDetected = hasDifferentLocation(transaction, recentTransactions);

        if (repeatedTransfers && differentDeviceDetected && differentLocationDetected) {

            createAndNotifyFraudAlert(
                    transaction,
                    "Critical suspicious activity detected: repeated transfers from different device and location within 3 minutes. Account temporarily frozen for customer safety.",
                    "CRITICAL"
            );

            freezeAccountForCriticalRisk(transaction.getFromAccountNumber());

            return;
        }

        if (repeatedTransfers) {
            createAndNotifyFraudAlert(
                    transaction,
                    "Multiple transactions detected within 3 minutes. Admin review recommended.",
                    "HIGH"
            );
        }

        long highOrCriticalAlertCount =
                fraudAlertRepository.countByAccountNumberAndSeverityIn(
                        transaction.getFromAccountNumber(),
                        List.of("HIGH", "CRITICAL")
                );

        if (highOrCriticalAlertCount >= 3) {
            Account account = accountRepository.findByAccountNumber(
                    transaction.getFromAccountNumber()
            ).orElseThrow(() -> new RuntimeException("Account not found"));

            if (!"FROZEN".equalsIgnoreCase(account.getStatus())) {
                account.setStatus("HIGH_RISK");
                accountRepository.save(account);
            }
        }
    }

    private boolean hasDifferentDevice(
            Transaction currentTransaction,
            List<Transaction> recentTransactions
    ) {
        String currentDeviceId = currentTransaction.getDeviceId();

        if (currentDeviceId == null || currentDeviceId.isBlank()) {
            return false;
        }

        for (Transaction tx : recentTransactions) {
            if (tx.getDeviceId() != null &&
                    !tx.getDeviceId().isBlank() &&
                    !tx.getDeviceId().equalsIgnoreCase(currentDeviceId)) {
                return true;
            }
        }

        return false;
    }

    private boolean hasDifferentLocation(
            Transaction currentTransaction,
            List<Transaction> recentTransactions
    ) {
        String currentLocation = currentTransaction.getLocation();

        if (currentLocation == null || currentLocation.isBlank()) {
            return false;
        }

        for (Transaction tx : recentTransactions) {
            if (tx.getLocation() != null &&
                    !tx.getLocation().isBlank() &&
                    !tx.getLocation().equalsIgnoreCase(currentLocation)) {
                return true;
            }
        }

        return false;
    }

    private void freezeAccountForCriticalRisk(String accountNumber) {

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if ("FROZEN".equalsIgnoreCase(account.getStatus())) {
            return;
        }

        account.setStatus("FROZEN");

        Account savedAccount = accountRepository.save(account);

        if (savedAccount.getUserEmail() != null &&
                !savedAccount.getUserEmail().isBlank()) {

            notificationService.createNotification(
                    savedAccount.getUserEmail(),
                    "Account Temporarily Frozen",
                    "Your account " + savedAccount.getAccountNumber() +
                            " was temporarily frozen due to critical suspicious activity.",
                    "FRAUD"
            );

            notificationService.sendFreezeEmail(
                    savedAccount.getUserEmail(),
                    savedAccount.getAccountNumber()
            );
        }
    }

    private void createAndNotifyFraudAlert(
            Transaction transaction,
            String reason,
            String severity
    ) {
        FraudAlert fraudAlert = new FraudAlert();

        fraudAlert.setTransactionId(transaction.getId());
        fraudAlert.setAccountNumber(transaction.getFromAccountNumber());
        fraudAlert.setAlertReason(reason);
        fraudAlert.setSeverity(severity);
        fraudAlert.setStatus("OPEN");

        FraudAlert savedAlert = fraudAlertRepository.save(fraudAlert);

        publishFraudAlertEvent(savedAlert);
        notifyFraudAlertUser(savedAlert);
    }

    private void publishFraudAlertEvent(FraudAlert fraudAlert) {

        FraudAlertEvent event = new FraudAlertEvent(
                fraudAlert.getId(),
                fraudAlert.getTransactionId(),
                fraudAlert.getAccountNumber(),
                fraudAlert.getAlertReason(),
                fraudAlert.getSeverity()
        );

        fraudAlertEventProducer.sendFraudAlertEvent(event);
    }

    private void notifyFraudAlertUser(FraudAlert fraudAlert) {

        Account account = accountRepository.findByAccountNumber(
                fraudAlert.getAccountNumber()
        ).orElse(null);

        if (account == null ||
                account.getUserEmail() == null ||
                account.getUserEmail().isBlank()) {
            return;
        }

        notificationService.createNotification(
                account.getUserEmail(),
                "Fraud Alert",
                fraudAlert.getAlertReason() + " | Severity: " + fraudAlert.getSeverity(),
                "FRAUD"
        );

        notificationService.sendFraudAlertEmail(
                account.getUserEmail(),
                fraudAlert.getAlertReason(),
                fraudAlert.getSeverity()
        );
    }
}