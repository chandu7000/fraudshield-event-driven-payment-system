package com.sekhar.payment_fraud_system.kafka;

import com.sekhar.payment_fraud_system.entity.Transaction;
import com.sekhar.payment_fraud_system.repository.TransactionRepository;
import com.sekhar.payment_fraud_system.service.FraudDetectionService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TransactionEventConsumer {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;

    public TransactionEventConsumer(TransactionRepository transactionRepository,
                                    FraudDetectionService fraudDetectionService) {
        this.transactionRepository = transactionRepository;
        this.fraudDetectionService = fraudDetectionService;
    }

    @KafkaListener(
            topics = "transaction-events",
            groupId = "fraud-group"
    )
    public void consume(TransactionEvent event) {

        System.out.println("=================================");
        System.out.println("Transaction Event Received");
        System.out.println("Transaction ID: " + event.getTransactionId());
        System.out.println("From Account: " + event.getFromAccountNumber());
        System.out.println("To Account: " + event.getToAccountNumber());
        System.out.println("Amount: " + event.getAmount());
        System.out.println("=================================");

        Transaction transaction = transactionRepository.findById(event.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        fraudDetectionService.checkTransactionForFraud(transaction);
    }
}