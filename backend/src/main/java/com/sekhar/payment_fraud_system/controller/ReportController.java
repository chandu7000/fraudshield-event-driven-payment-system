package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.AccountAnalyticsReportDTO;
import com.sekhar.payment_fraud_system.dto.FraudAnalyticsReportDTO;
import com.sekhar.payment_fraud_system.dto.TransactionSummaryReportDTO;
import com.sekhar.payment_fraud_system.service.ReportService;
import org.springframework.web.bind.annotation.*;
import com.sekhar.payment_fraud_system.dto.MonthlyTransactionTrendDTO;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/transaction-summary")
    public TransactionSummaryReportDTO getTransactionSummaryReport() {
        return reportService.getTransactionSummaryReport();
    }

    @GetMapping("/fraud-analytics")
    public FraudAnalyticsReportDTO getFraudAnalyticsReport() {
        return reportService.getFraudAnalyticsReport();
    }

    @GetMapping("/account-analytics")
    public AccountAnalyticsReportDTO getAccountAnalyticsReport() {
        return reportService.getAccountAnalyticsReport();
    }

    @GetMapping("/monthly-transaction-trend")
    public List<MonthlyTransactionTrendDTO> getMonthlyTransactionTrend() {
        return reportService.getMonthlyTransactionTrend();
    }
}