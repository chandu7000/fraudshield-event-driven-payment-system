package com.sekhar.payment_fraud_system.repository;

import com.sekhar.payment_fraud_system.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

        List<Transaction> findByFromAccountNumber(String fromAccountNumber);

        List<Transaction> findByToAccountNumber(String toAccountNumber);

        List<Transaction> findByStatus(String status);

        List<Transaction> findByFromAccountNumberOrToAccountNumber(
                        String fromAccountNumber,
                        String toAccountNumber);

        List<Transaction> findByFromAccountNumberInOrToAccountNumberIn(
                        List<String> fromAccountNumbers,
                        List<String> toAccountNumbers);

        List<Transaction> findByFromAccountNumberAndTransactionTimeAfter(
                        String fromAccountNumber,
                        LocalDateTime transactionTime);

        List<Transaction> findByFromAccountNumberAndTransactionTimeBetween(
                        String fromAccountNumber,
                        LocalDateTime startTime,
                        LocalDateTime endTime);

        @Query("""
                        SELECT t
                        FROM Transaction t
                        WHERE t.fromAccountNumber = :fromAccountNumber
                        AND t.status = 'SUCCESS'
                        AND t.transactionTime >= :startTime
                        ORDER BY t.transactionTime DESC
                        """)
        List<Transaction> findRecentSuccessfulTransactions(
                        @Param("fromAccountNumber") String fromAccountNumber,
                        @Param("startTime") LocalDateTime startTime);

        @Query("""
                        SELECT COALESCE(SUM(t.amount), 0)
                        FROM Transaction t
                        WHERE t.fromAccountNumber = :fromAccountNumber
                        AND t.status = 'SUCCESS'
                        AND t.transactionTime BETWEEN :startTime AND :endTime
                        """)
        BigDecimal getTotalSentAmountBetween(
                        @Param("fromAccountNumber") String fromAccountNumber,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("""
                        SELECT t FROM Transaction t
                        WHERE (t.fromAccountNumber = :accountNumber OR t.toAccountNumber = :accountNumber)
                        AND t.transactionTime BETWEEN :startTime AND :endTime
                        ORDER BY t.transactionTime DESC
                        """)
        List<Transaction> findStatementTransactions(
                        @Param("accountNumber") String accountNumber,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("""
                        SELECT COUNT(t)
                        FROM Transaction t
                        WHERE t.status = 'SUCCESS'
                        """)
        Long countSuccessfulTransactions();

        @Query("""
                        SELECT COALESCE(SUM(t.amount), 0)
                        FROM Transaction t
                        WHERE t.status = 'SUCCESS'
                        """)
        BigDecimal getTotalSuccessfulTransferAmount();

        @Query("""
                        SELECT COUNT(t)
                        FROM Transaction t
                        WHERE t.status = 'SUCCESS'
                        AND t.transactionTime BETWEEN :startTime AND :endTime
                        """)
        Long countSuccessfulTransactionsBetween(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("""
                        SELECT COALESCE(SUM(t.amount), 0)
                        FROM Transaction t
                        WHERE t.status = 'SUCCESS'
                        AND t.transactionTime BETWEEN :startTime AND :endTime
                        """)
        BigDecimal getTotalSuccessfulTransferAmountBetween(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("""
                        SELECT FUNCTION('DATE_FORMAT', t.transactionTime, '%Y-%m'),
                               COUNT(t),
                               COALESCE(SUM(t.amount), 0)
                        FROM Transaction t
                        WHERE t.status = 'SUCCESS'
                        GROUP BY FUNCTION('DATE_FORMAT', t.transactionTime, '%Y-%m')
                        ORDER BY FUNCTION('DATE_FORMAT', t.transactionTime, '%Y-%m')
                        """)
        List<Object[]> getMonthlyTransactionTrend();
}