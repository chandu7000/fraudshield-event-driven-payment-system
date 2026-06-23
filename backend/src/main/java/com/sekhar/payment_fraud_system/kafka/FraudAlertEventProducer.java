package com.sekhar.payment_fraud_system.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class FraudAlertEventProducer {

    private static final String TOPIC = "fraud-alert-events";

    private final KafkaTemplate<String, FraudAlertEvent> kafkaTemplate;

    @Value("${app.kafka.enabled:true}")
    private boolean kafkaEnabled;

    public FraudAlertEventProducer(
            KafkaTemplate<String, FraudAlertEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendFraudAlertEvent(FraudAlertEvent event) {

        if (!kafkaEnabled) {
            System.out.println("Kafka disabled. Fraud alert event skipped.");
            return;
        }

        try {
            kafkaTemplate.send(TOPIC, event);
        } catch (Exception e) {
            System.out.println("Fraud alert Kafka failed: " + e.getMessage());
        }
    }
}