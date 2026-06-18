package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.AccountLookupResponseDTO;
import com.sekhar.payment_fraud_system.dto.AccountRequestDTO;
import com.sekhar.payment_fraud_system.entity.Account;
import com.sekhar.payment_fraud_system.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public Account createAccount(@Valid @RequestBody AccountRequestDTO requestDTO) {

        Account account = new Account();

        account.setAccountHolderName(requestDTO.getAccountHolderName());
        account.setBalance(requestDTO.getBalance());
        account.setUserEmail(requestDTO.getUserEmail());

        return accountService.createAccount(account);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{accountNumber}/freeze")
    public Account freezeAccount(@PathVariable String accountNumber) {
        return accountService.freezeAccount(accountNumber);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{accountNumber}/unfreeze")
    public Account unfreezeAccount(@PathVariable String accountNumber) {
        return accountService.unfreezeAccount(accountNumber);
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/my")
    public List<Account> getMyAccounts(Authentication authentication) {
        String userEmail = authentication.getName();
        return accountService.getMyAccounts(userEmail);
    }

    @GetMapping("/lookup/{accountNumber}")
    public AccountLookupResponseDTO lookupAccount(@PathVariable String accountNumber) {
        Account account = accountService.getAccountByNumber(accountNumber);

        return new AccountLookupResponseDTO(
                account.getAccountNumber(),
                account.getAccountHolderName()
        );
    }

    @GetMapping("/{accountNumber}")
    public Account getAccountByNumber(@PathVariable String accountNumber) {
        return accountService.getAccountByNumber(accountNumber);
    }
}