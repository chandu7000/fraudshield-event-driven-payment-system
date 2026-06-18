package com.sekhar.payment_fraud_system.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class FraudAlertEventProducer {

    private static final String TOPIC = "fraud-alert-events";

    private final KafkaTemplate<String, FraudAlertEvent> kafkaTemplate;

    public FraudAlertEventProducer(KafkaTemplate<String, FraudAlertEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendFraudAlertEvent(FraudAlertEvent event) {
        kafkaTemplate.send(TOPIC, event);
    }
}