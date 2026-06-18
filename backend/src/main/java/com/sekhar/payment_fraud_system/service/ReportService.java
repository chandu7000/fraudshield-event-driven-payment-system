package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.dto.AccountAnalyticsReportDTO;
import com.sekhar.payment_fraud_system.dto.FraudAnalyticsReportDTO;
import com.sekhar.payment_fraud_system.dto.TransactionSummaryReportDTO;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.FraudAlertRepository;
import com.sekhar.payment_fraud_system.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import com.sekhar.payment_fraud_system.dto.MonthlyTransactionTrendDTO;
import java.util.ArrayList;
import java.util.List;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class ReportService {

        private final TransactionRepository transactionRepository;
        private final FraudAlertRepository fraudAlertRepository;
        private final AccountRepository accountRepository;

        public ReportService(
                        TransactionRepository transactionRepository,
                        FraudAlertRepository fraudAlertRepository,
                        AccountRepository accountRepository) {
                this.transactionRepository = transactionRepository;
                this.fraudAlertRepository = fraudAlertRepository;
                this.accountRepository = accountRepository;
        }

        public TransactionSummaryReportDTO getTransactionSummaryReport() {

                LocalDate today = LocalDate.now();

                LocalDateTime todayStart = today.atStartOfDay();
                LocalDateTime todayEnd = today.atTime(LocalTime.MAX);

                LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
                LocalDateTime monthEnd = today
                                .withDayOfMonth(today.lengthOfMonth())
                                .atTime(LocalTime.MAX);

                Long totalTransactions = transactionRepository.countSuccessfulTransactions();

                BigDecimal totalTransferAmount = transactionRepository.getTotalSuccessfulTransferAmount();

                Long todayTransactions = transactionRepository.countSuccessfulTransactionsBetween(todayStart, todayEnd);

                BigDecimal todayTransferAmount = transactionRepository
                                .getTotalSuccessfulTransferAmountBetween(todayStart, todayEnd);

                Long monthTransactions = transactionRepository.countSuccessfulTransactionsBetween(monthStart, monthEnd);

                BigDecimal monthTransferAmount = transactionRepository
                                .getTotalSuccessfulTransferAmountBetween(monthStart, monthEnd);

                return new TransactionSummaryReportDTO(
                                totalTransactions,
                                totalTransferAmount,
                                todayTransactions,
                                todayTransferAmount,
                                monthTransactions,
                                monthTransferAmount);
        }

        public FraudAnalyticsReportDTO getFraudAnalyticsReport() {

                Long totalFraudAlerts = fraudAlertRepository.count();
                Long highSeverityAlerts = fraudAlertRepository.countBySeverity("HIGH");
                Long mediumSeverityAlerts = fraudAlertRepository.countBySeverity("MEDIUM");
                Long openAlerts = fraudAlertRepository.countByStatus("OPEN");
                Long resolvedAlerts = fraudAlertRepository.countByStatus("RESOLVED");

                return new FraudAnalyticsReportDTO(
                                totalFraudAlerts,
                                highSeverityAlerts,
                                mediumSeverityAlerts,
                                openAlerts,
                                resolvedAlerts);
        }

        public AccountAnalyticsReportDTO getAccountAnalyticsReport() {

                Long totalAccounts = accountRepository.count();

                Long activeAccounts = accountRepository.countByStatus("ACTIVE");

                Long frozenAccounts = accountRepository.countByStatus("FROZEN");

                Long highRiskAccounts = accountRepository.countByStatus("HIGH_RISK");

                return new AccountAnalyticsReportDTO(
                                totalAccounts,
                                activeAccounts,
                                frozenAccounts,
                                highRiskAccounts);
        }

        public List<MonthlyTransactionTrendDTO> getMonthlyTransactionTrend() {

                List<Object[]> results = transactionRepository.getMonthlyTransactionTrend();

                List<MonthlyTransactionTrendDTO> trendList = new ArrayList<>();

                for (Object[] row : results) {
                        String month = row[0].toString();
                        Long transactionCount = (Long) row[1];
                        BigDecimal totalAmount = (BigDecimal) row[2];

                        trendList.add(
                                        new MonthlyTransactionTrendDTO(
                                                        month,
                                                        transactionCount,
                                                        totalAmount));
                }

                return trendList;
        }
}