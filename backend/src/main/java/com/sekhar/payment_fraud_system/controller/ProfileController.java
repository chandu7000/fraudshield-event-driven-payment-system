package com.sekhar.payment_fraud_system.controller;

import com.sekhar.payment_fraud_system.dto.ChangePasswordRequestDTO;
import com.sekhar.payment_fraud_system.dto.ProfileResponseDTO;
import com.sekhar.payment_fraud_system.service.ProfileService;
import com.sekhar.payment_fraud_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @GetMapping
    public ProfileResponseDTO getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return profileService.getMyProfile(email);
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO requestDTO) {

        String email = authentication.getName();

        userService.changePassword(email, requestDTO);

        return Map.of("message", "Password changed successfully");
    }
}