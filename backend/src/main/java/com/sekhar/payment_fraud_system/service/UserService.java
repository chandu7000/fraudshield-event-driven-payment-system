package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.dto.AdminUserDTO;
import com.sekhar.payment_fraud_system.dto.ChangePasswordRequestDTO;
import com.sekhar.payment_fraud_system.dto.LoginRequestDTO;
import com.sekhar.payment_fraud_system.dto.LoginResponseDTO;
import com.sekhar.payment_fraud_system.dto.RegisterRequestDTO;
import com.sekhar.payment_fraud_system.dto.ResetPasswordRequestDTO;
import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.entity.User;
import com.sekhar.payment_fraud_system.exception.ResourceNotFoundException;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

        private final UserRepository userRepository;
        private final AccountRepository accountRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuditLogService auditLogService;
        private final NotificationService notificationService;
        private final EmailOtpService emailOtpService;

        public UserService(
                        UserRepository userRepository,
                        AccountRepository accountRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        AuditLogService auditLogService,
                        NotificationService notificationService,
                        EmailOtpService emailOtpService) {
                this.userRepository = userRepository;
                this.accountRepository = accountRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.auditLogService = auditLogService;
                this.notificationService = notificationService;
                this.emailOtpService = emailOtpService;
        }

        public User registerUser(RegisterRequestDTO requestDTO) {

                if (userRepository.existsByEmail(requestDTO.getEmail())) {
                        throw new RuntimeException("Email already registered");
                }

                if (!emailOtpService.isEmailVerified(requestDTO.getEmail())) {
                        throw new RuntimeException("Please verify your email with OTP before registration");
                }

                if (accountRepository.findByUserEmail(requestDTO.getEmail()).isEmpty()) {
                        throw new RuntimeException(
                                        "No bank account found with this email. Please contact bank admin.");
                }

                User user = new User();

                user.setFullName(requestDTO.getFullName());
                user.setEmail(requestDTO.getEmail());
                user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
                user.setRole("USER");
                user.setEnabled(true);

                return userRepository.save(user);
        }

        public LoginResponseDTO loginUser(LoginRequestDTO requestDTO) {

                User user = userRepository.findByEmail(requestDTO.getEmail())
                                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

                if (Boolean.FALSE.equals(user.getEnabled())) {
                        throw new RuntimeException(
                                        "Your account has been disabled. Please contact admin.");
                }

                if (!passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
                        throw new RuntimeException("Invalid email or password");
                }

                auditLogService.logAction(
                                "USER_LOGIN",
                                user.getEmail(),
                                "User logged in successfully");

                String token = jwtService.generateToken(
                                user.getEmail(),
                                user.getRole());

                return new LoginResponseDTO(
                                token,
                                user.getEmail(),
                                user.getFullName(),
                                user.getRole());
        }

        public void changePassword(
                        String email,
                        ChangePasswordRequestDTO requestDTO) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (!passwordEncoder.matches(
                                requestDTO.getCurrentPassword(),
                                user.getPassword())) {
                        throw new RuntimeException("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
                userRepository.save(user);

                auditLogService.logAction(
                                "PASSWORD_CHANGED",
                                user.getEmail(),
                                "User changed password successfully");

                notificationService.createNotification(
                                user.getEmail(),
                                "Password Changed",
                                "Your FraudShield account password was changed successfully.",
                                "SECURITY");

                notificationService.sendPasswordChangeEmail(user.getEmail());
        }

        public void resetPassword(ResetPasswordRequestDTO requestDTO) {

                if (!emailOtpService.isEmailVerified(requestDTO.getEmail())) {
                        throw new RuntimeException("Please verify OTP before resetting password");
                }

                User user = userRepository.findByEmail(requestDTO.getEmail())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
                userRepository.save(user);

                auditLogService.logAction(
                                "PASSWORD_RESET",
                                user.getEmail(),
                                "User reset password using OTP");

                notificationService.createNotification(
                                user.getEmail(),
                                "Password Reset",
                                "Your FraudShield account password was reset successfully.",
                                "SECURITY");

                notificationService.sendPasswordChangeEmail(user.getEmail());
        }

        public List<AdminUserDTO> getAllUsersForAdmin(String currentAdminEmail) {

                return userRepository.findAll()
                                .stream()
                                .map(user -> {
                                        Account account = accountRepository.findByUserEmail(user.getEmail())
                                                        .stream()
                                                        .findFirst()
                                                        .orElse(null);

                                        return new AdminUserDTO(
                                                        user.getId(),
                                                        user.getFullName(),
                                                        user.getEmail(),
                                                        user.getRole(),
                                                        user.getEnabled(),
                                                        account != null ? account.getAccountNumber() : "-",
                                                        account != null ? account.getStatus() : "NO_ACCOUNT");
                                })
                                .toList();
        }

        public void disableUser(Long userId, String currentAdminEmail) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
                        throw new RuntimeException("You cannot disable your own admin account");
                }

                user.setEnabled(false);
                userRepository.save(user);

                auditLogService.logAction(
                                "USER_DISABLED",
                                currentAdminEmail,
                                "Disabled user: " + user.getEmail());
        }

        public void enableUser(Long userId, String currentAdminEmail) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                user.setEnabled(true);
                userRepository.save(user);

                auditLogService.logAction(
                                "USER_ENABLED",
                                currentAdminEmail,
                                "Enabled user: " + user.getEmail());
        }
}