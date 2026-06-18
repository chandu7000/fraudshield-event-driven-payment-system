package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.entity.Notification;
import com.sekhar.payment_fraud_system.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/my")
    public List<Notification> getMyNotifications(Authentication authentication) {
        String userEmail = authentication.getName();
        return notificationService.getMyNotifications(userEmail);
    }

    @GetMapping("/my/unread")
    public List<Notification> getMyUnreadNotifications(Authentication authentication) {
        String userEmail = authentication.getName();
        return notificationService.getUnreadNotifications(userEmail);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }
}