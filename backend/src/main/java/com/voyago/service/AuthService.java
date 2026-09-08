package com.voyago.service;

import com.voyago.dto.AuthResponse;
import com.voyago.dto.ForgotPasswordRequest;
import com.voyago.dto.LoginRequest;
import com.voyago.dto.RegisterRequest;
import com.voyago.dto.ResetPasswordRequest;
import com.voyago.model.User;
import com.voyago.repository.UserRepository;
import com.voyago.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String requestedRole = request.getRole().trim().toUpperCase();
        if (!Set.of("CUSTOMER", "HOTEL_PARTNER", "VEHICLE_PARTNER").contains(requestedRole)) {
            throw new RuntimeException("Only customer, hotel partner, or vehicle partner accounts can be created here.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use. Please log in instead.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(requestedRole)
                .phone(request.getPhone())
                .city(request.getCity())
                .state(request.getState())
                .partnerBusinessName(request.getPartnerBusinessName())
                .partnerStatus(requestedRole.endsWith("_PARTNER") ? "PENDING" : null)
                .build();

        User saved = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(saved.getEmail(), saved.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .partnerStatus(saved.getPartnerStatus())
                .phone(saved.getPhone())
                .city(saved.getCity())
                .state(saved.getState())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("No account found for this email. Please sign up first."));
        if (!user.isActive()) {
            throw new RuntimeException("This account is inactive. Please contact Voyago support.");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .partnerStatus(user.getPartnerStatus())
                .phone(user.getPhone())
                .city(user.getCity())
                .state(user.getState())
                .build();
    }

    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("No account found for this email. Please sign up first."));
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        return Map.of(
                "message", "Password reset link created.",
                "resetUrl", "http://localhost:3000/?resetToken=" + token
        );
    }

    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findAll().stream()
                .filter(candidate -> request.getToken().equals(candidate.getPasswordResetToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("This reset link is invalid. Please request a new one."));
        if (user.getPasswordResetTokenExpiresAt() == null
                || user.getPasswordResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        userRepository.save(user);
        return Map.of("message", "Password updated successfully. You can now log in.");
    }
}
