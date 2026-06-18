package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.AdminUserDTO;
import com.sekhar.payment_fraud_system.dto.ChangePasswordRequestDTO;
import com.sekhar.payment_fraud_system.dto.LoginRequestDTO;
import com.sekhar.payment_fraud_system.dto.LoginResponseDTO;
import com.sekhar.payment_fraud_system.dto.RegisterRequestDTO;
import com.sekhar.payment_fraud_system.dto.ResetPasswordRequestDTO;
import com.sekhar.payment_fraud_system.dto.SendOtpRequestDTO;
import com.sekhar.payment_fraud_system.dto.VerifyOtpRequestDTO;
import com.sekhar.payment_fraud_system.entity.User;
import com.sekhar.payment_fraud_system.service.EmailOtpService;
import com.sekhar.payment_fraud_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final EmailOtpService emailOtpService;

    public UserController(UserService userService,
                          EmailOtpService emailOtpService) {
        this.userService = userService;
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(
            @Valid @RequestBody SendOtpRequestDTO requestDTO
    ) {
        emailOtpService.sendOtp(requestDTO.getEmail());

        return Map.of(
                "message",
                "OTP sent successfully"
        );
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(
            @Valid @RequestBody VerifyOtpRequestDTO requestDTO
    ) {
        emailOtpService.verifyOtp(
                requestDTO.getEmail(),
                requestDTO.getOtp()
        );

        return Map.of(
                "message",
                "Email verified successfully"
        );
    }

    @PostMapping("/forgot-password/send-otp")
    public Map<String, String> sendForgotPasswordOtp(
            @Valid @RequestBody SendOtpRequestDTO requestDTO
    ) {
        emailOtpService.sendForgotPasswordOtp(requestDTO.getEmail());

        return Map.of(
                "message",
                "Password reset OTP sent successfully"
        );
    }

    @PostMapping("/forgot-password/verify-otp")
    public Map<String, String> verifyForgotPasswordOtp(
            @Valid @RequestBody VerifyOtpRequestDTO requestDTO
    ) {
        emailOtpService.verifyForgotPasswordOtp(
                requestDTO.getEmail(),
                requestDTO.getOtp()
        );

        return Map.of(
                "message",
                "OTP verified successfully"
        );
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO requestDTO
    ) {
        userService.resetPassword(requestDTO);

        return Map.of(
                "message",
                "Password reset successfully"
        );
    }

    @PostMapping("/register")
    public User registerUser(
            @Valid @RequestBody RegisterRequestDTO requestDTO
    ) {
        return userService.registerUser(requestDTO);
    }

    @PostMapping("/login")
    public LoginResponseDTO loginUser(
            @Valid @RequestBody LoginRequestDTO requestDTO
    ) {
        return userService.loginUser(requestDTO);
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO requestDTO
    ) {

        String email = authentication.getName();

        userService.changePassword(email, requestDTO);

        return Map.of(
                "message",
                "Password changed successfully"
        );
    }

    @GetMapping("/admin/users")
    public List<AdminUserDTO> getAllUsersForAdmin(
            Authentication authentication
    ) {
        return userService.getAllUsersForAdmin(
                authentication.getName()
        );
    }

    @PutMapping("/admin/users/{userId}/disable")
    public Map<String, String> disableUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {

        userService.disableUser(
                userId,
                authentication.getName()
        );

        return Map.of(
                "message",
                "User disabled successfully"
        );
    }

    @PutMapping("/admin/users/{userId}/enable")
    public Map<String, String> enableUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {

        userService.enableUser(
                userId,
                authentication.getName()
        );

        return Map.of(
                "message",
                "User enabled successfully"
        );
    }
}