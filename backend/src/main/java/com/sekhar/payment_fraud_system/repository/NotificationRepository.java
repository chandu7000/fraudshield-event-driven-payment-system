package com.sekhar.payment_fraud_system.repository;

import com.sekhar.payment_fraud_system.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<Notification> findByUserEmailAndReadStatusFalse(String userEmail);
}