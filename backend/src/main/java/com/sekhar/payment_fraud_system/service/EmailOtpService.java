package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.entity.EmailOtp;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.EmailOtpRepository;
import com.sekhar.payment_fraud_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public EmailOtpService(
            EmailOtpRepository emailOtpRepository,
            NotificationService notificationService,
            UserRepository userRepository,
            AccountRepository accountRepository
    ) {
        this.emailOtpRepository = emailOtpRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    public void sendOtp(String email) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered. Please login.");
        }

        if (accountRepository.findByUserEmail(email).isEmpty()) {
            throw new RuntimeException(
                    "No bank account found with this email. Please contact bank admin."
            );
        }

        saveAndSendOtp(
                email,
                "FraudShield Email Verification OTP",
                "Your FraudShield email verification OTP is: "
        );
    }

    public void verifyOtp(String email, String otp) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered. Please login.");
        }

        if (accountRepository.findByUserEmail(email).isEmpty()) {
            throw new RuntimeException(
                    "No bank account found with this email. Please contact bank admin."
            );
        }

        verifyOtpOnly(email, otp);
    }

    public void sendForgotPasswordOtp(String email) {

        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("No login account found with this email.");
        }

        saveAndSendOtp(
                email,
                "FraudShield Password Reset OTP",
                "Your FraudShield password reset OTP is: "
        );
    }

    public void verifyForgotPasswordOtp(String email, String otp) {

        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("No login account found with this email.");
        }

        verifyOtpOnly(email, otp);
    }

    public boolean isEmailVerified(String email) {

        return emailOtpRepository.findTopByEmailOrderByIdDesc(email)
                .map(otp -> Boolean.TRUE.equals(otp.getVerified())
                        && otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    private void saveAndSendOtp(String email, String subject, String messagePrefix) {

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setVerified(false);
        emailOtp.setExpiryTime(LocalDateTime.now().plusMinutes(10));

        emailOtpRepository.save(emailOtp);

        notificationService.sendEmail(
                email,
                subject,
                "Hello,\n\n" + messagePrefix + otp +
                        "\n\nThis OTP is valid for 10 minutes." +
                        "\n\nRegards,\nFraudShield Team"
        );
    }

    private void verifyOtpOnly(String email, String otp) {

        EmailOtp emailOtp = emailOtpRepository.findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request OTP again."));

        if (Boolean.TRUE.equals(emailOtp.getVerified())) {
            throw new RuntimeException("Email already verified");
        }

        if (emailOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new OTP.");
        }

        if (!emailOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        emailOtp.setVerified(true);
        emailOtpRepository.save(emailOtp);
    }
}