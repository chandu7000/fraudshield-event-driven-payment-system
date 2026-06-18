package com.sekhar.payment_fraud_system.service;

import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.exception.ResourceNotFoundException;
import com.sekhar.payment_fraud_system.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final NotificationService notificationService;

    public AccountService(AccountRepository accountRepository,
                          NotificationService notificationService) {
        this.accountRepository = accountRepository;
        this.notificationService = notificationService;
    }

    public Account createAccount(Account account) {

        if (accountRepository.existsByUserEmail(account.getUserEmail())) {
            throw new RuntimeException("Account already exists for this user email");
        }

        String generatedAccountNumber = generateAccountNumber();

        account.setAccountNumber(generatedAccountNumber);

        return accountRepository.save(account);
    }

    private String generateAccountNumber() {

        Account lastAccount = accountRepository.findTopByOrderByIdDesc();

        if (lastAccount == null) {
            return "ACC1001";
        }

        String lastAccountNumber = lastAccount.getAccountNumber();

        int lastNumber = Integer.parseInt(
                lastAccountNumber.replace("ACC", ""));

        return "ACC" + (lastNumber + 1);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Account> getMyAccounts(String userEmail) {
        return accountRepository.findByUserEmail(userEmail);
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found with number: " + accountNumber));
    }

    public Account getAccountByUserEmail(String userEmail) {

        List<Account> accounts = accountRepository.findByUserEmail(userEmail);

        if (accounts.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No account found for user: " + userEmail);
        }

        return accounts.get(0);
    }

    public Account freezeAccount(String accountNumber) {
        Account account = getAccountByNumber(accountNumber);

        if ("FROZEN".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Account is already frozen");
        }

        account.setStatus("FROZEN");

        Account savedAccount = accountRepository.save(account);

        if (savedAccount.getUserEmail() != null && !savedAccount.getUserEmail().isBlank()) {
            notificationService.createNotification(
                    savedAccount.getUserEmail(),
                    "Account Frozen",
                    "Your account " + savedAccount.getAccountNumber() + " has been frozen by admin.",
                    "ACCOUNT"
            );

            notificationService.sendFreezeEmail(
                    savedAccount.getUserEmail(),
                    savedAccount.getAccountNumber()
            );
        }

        return savedAccount;
    }

    public Account unfreezeAccount(String accountNumber) {
        Account account = getAccountByNumber(accountNumber);

        if ("ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Account is already active");
        }

        account.setStatus("ACTIVE");

        Account savedAccount = accountRepository.save(account);

        if (savedAccount.getUserEmail() != null && !savedAccount.getUserEmail().isBlank()) {
            notificationService.createNotification(
                    savedAccount.getUserEmail(),
                    "Account Unfrozen",
                    "Your account " + savedAccount.getAccountNumber() + " has been activated again.",
                    "ACCOUNT"
            );

            notificationService.sendUnfreezeEmail(
                    savedAccount.getUserEmail(),
                    savedAccount.getAccountNumber()
            );
        }

        return savedAccount;
    }
}