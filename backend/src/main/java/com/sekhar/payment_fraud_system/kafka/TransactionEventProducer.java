package com.sekhar.payment_fraud_system.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class TransactionEventProducer {

    private static final String TOPIC = "transaction-events";

    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Value("${app.kafka.enabled:true}")
    private boolean kafkaEnabled;

    public TransactionEventProducer(KafkaTemplate<String, TransactionEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTransactionEvent(TransactionEvent transactionEvent) {

        if (!kafkaEnabled) {
            System.out.println("Kafka disabled. Transaction event skipped.");
            return;
        }

        try {
            kafkaTemplate.send(TOPIC, transactionEvent);
        } catch (Exception e) {
            System.out.println("Kafka event sending failed: " + e.getMessage());
        }
    }
}