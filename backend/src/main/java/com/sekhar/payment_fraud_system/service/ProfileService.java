package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.dto.ProfileResponseDTO;
import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.entity.User;
import com.sekhar.payment_fraud_system.exception.ResourceNotFoundException;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import com.sekhar.payment_fraud_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public ProfileService(UserRepository userRepository,
                          AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    public ProfileResponseDTO getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));

        List<Account> accounts = accountRepository.findByUserEmail(email);

        Account account = accounts.isEmpty() ? null : accounts.get(0);

        return new ProfileResponseDTO(
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                account != null ? account.getAccountNumber() : "Not Assigned",
                account != null ? account.getStatus() : "Not Assigned"
        );
    }
}