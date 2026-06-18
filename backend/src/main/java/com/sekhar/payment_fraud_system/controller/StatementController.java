package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.StatementResponse;
import com.sekhar.payment_fraud_system.service.StatementService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statements")
@CrossOrigin(origins = "http://localhost:5173")
public class StatementController {

    private final StatementService statementService;

    public StatementController(StatementService statementService) {
        this.statementService = statementService;
    }

    @GetMapping("/my")
    public StatementResponse getMyStatement(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return statementService.getMyStatement(authentication.getName(), from, to);
    }
}