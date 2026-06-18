package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.entity.Notification;
import com.sekhar.payment_fraud_system.repository.NotificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository,
                               JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    public Notification createNotification(String userEmail, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserEmail(userEmail);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }
    }

    public void sendPasswordChangeEmail(String userEmail) {
        sendEmail(
                userEmail,
                "FraudShield Password Changed",
                "Hello,\n\nYour FraudShield account password was changed successfully.\n\nIf this was not you, please contact admin immediately.\n\nRegards,\nFraudShield Team"
        );
    }

    public void sendFraudAlertEmail(String userEmail, String reason, String severity) {
        sendEmail(
                userEmail,
                "FraudShield Fraud Alert",
                "Hello,\n\nA fraud alert was generated on your account.\n\nReason: " + reason +
                        "\nSeverity: " + severity +
                        "\n\nPlease review your account activity.\n\nRegards,\nFraudShield Team"
        );
    }

    public void sendFreezeEmail(String userEmail, String accountNumber) {
        sendEmail(
                userEmail,
                "FraudShield Account Frozen",
                "Hello,\n\nYour account " + accountNumber + " has been frozen by admin.\n\nPlease contact bank admin for more details.\n\nRegards,\nFraudShield Team"
        );
    }

    public void sendUnfreezeEmail(String userEmail, String accountNumber) {
        sendEmail(
                userEmail,
                "FraudShield Account Unfrozen",
                "Hello,\n\nYour account " + accountNumber + " has been unfrozen and is now active.\n\nRegards,\nFraudShield Team"
        );
    }

    public List<Notification> getMyNotifications(String userEmail) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<Notification> getUnreadNotifications(String userEmail) {
        return notificationRepository.findByUserEmailAndReadStatusFalse(userEmail);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }
}