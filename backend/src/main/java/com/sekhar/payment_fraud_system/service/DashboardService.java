package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.dto.DashboardResponseDTO;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.FraudAlertRepository;
import com.sekhar.payment_fraud_system.repository.TransactionRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;

    public DashboardService(AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            FraudAlertRepository fraudAlertRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
    }

    public DashboardResponseDTO getDashboardSummary() {

        long totalAccounts = accountRepository.count();

        long totalTransactions = transactionRepository.count();

        long totalFraudAlerts = fraudAlertRepository.count();

        long highRiskAccounts = accountRepository.countByStatus("HIGH_RISK");

        return new DashboardResponseDTO(
                totalAccounts,
                totalTransactions,
                totalFraudAlerts,
                highRiskAccounts
        );
    }
}