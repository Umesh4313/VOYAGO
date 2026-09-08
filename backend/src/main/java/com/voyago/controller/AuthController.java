package com.voyago.controller;

import com.voyago.dto.AuthResponse;
import com.voyago.dto.ForgotPasswordRequest;
import com.voyago.dto.LoginRequest;
import com.voyago.dto.RegisterRequest;
import com.voyago.dto.ResetPasswordRequest;
import com.voyago.model.User;
import com.voyago.repository.UserRepository;
import com.voyago.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Don't expose passwordHash
        return ResponseEntity.ok(Map.ofEntries(
            Map.entry("id", user.getId()),
            Map.entry("name", user.getName()),
            Map.entry("email", user.getEmail()),
            Map.entry("role", user.getRole()),
            Map.entry("phone", user.getPhone() != null ? user.getPhone() : ""),
            Map.entry("city", user.getCity() != null ? user.getCity() : ""),
            Map.entry("state", user.getState() != null ? user.getState() : ""),
            Map.entry("partnerBusinessName", user.getPartnerBusinessName() != null ? user.getPartnerBusinessName() : ""),
            Map.entry("partnerStatus", user.getPartnerStatus() != null ? user.getPartnerStatus() : ""),
            Map.entry("isActive", user.isActive()),
            Map.entry("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
        ));
    }
}
