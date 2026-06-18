package com.sekhar.payment_fraud_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String otp;

    private Boolean verified = false;

    private LocalDateTime expiryTime;

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public Boolean getVerified() {
        return verified;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }
}