package com.sekhar.payment_fraud_system.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sekhar.payment_fraud_system.entity.Notification;
import com.sekhar.payment_fraud_system.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @Value("${BREVO_SENDER_EMAIL:fraudshieldbank@gmail.com}")
    private String brevoSenderEmail;

    @Value("${BREVO_SENDER_NAME:FraudShield}")
    private String brevoSenderName;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.httpClient = HttpClient.newHttpClient();
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
            if (brevoApiKey == null || brevoApiKey.isBlank()) {
                throw new RuntimeException("BREVO_API_KEY is missing");
            }

            Map<String, Object> payload = Map.of(
                    "sender", Map.of(
                            "name", brevoSenderName,
                            "email", brevoSenderEmail
                    ),
                    "to", List.of(
                            Map.of("email", toEmail)
                    ),
                    "subject", subject,
                    "textContent", body
            );

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.out.println("Brevo email failed. Status: " + response.statusCode());
                System.out.println("Brevo response: " + response.body());
                throw new RuntimeException("Unable to send email. Please try again later.");
            }

            System.out.println("Email sent successfully using Brevo API to: " + toEmail);

        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
            throw new RuntimeException("Unable to send email. Please try again later.");
        }
    }

    public void sendEmailSafe(String toEmail, String subject, String body) {
        try {
            sendEmail(toEmail, subject, body);
        } catch (Exception e) {
            System.out.println("Non-critical email failed: " + e.getMessage());
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
        sendEmailSafe(
                userEmail,
                "FraudShield Fraud Alert",
                "Hello,\n\nA fraud alert was generated on your account.\n\nReason: " + reason +
                        "\nSeverity: " + severity +
                        "\n\nPlease review your account activity.\n\nRegards,\nFraudShield Team"
        );
    }

    public void sendFreezeEmail(String userEmail, String accountNumber) {
        sendEmailSafe(
                userEmail,
                "FraudShield Account Frozen",
                "Hello,\n\nYour account " + accountNumber + " has been frozen by admin.\n\nPlease contact bank admin for more details.\n\nRegards,\nFraudShield Team"
        );
    }

    public void sendUnfreezeEmail(String userEmail, String accountNumber) {
        sendEmailSafe(
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