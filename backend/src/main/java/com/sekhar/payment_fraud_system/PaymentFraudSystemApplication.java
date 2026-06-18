package com.sekhar.payment_fraud_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class PaymentFraudSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentFraudSystemApplication.class, args);
	}

}
