package com.voyago.controller;

import com.voyago.model.User;
import com.voyago.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Return safe user data (no password)
        return ResponseEntity.ok(Map.ofEntries(
            Map.entry("id", user.getId()), Map.entry("name", user.getName()),
            Map.entry("email", user.getEmail()), Map.entry("role", user.getRole()),
            Map.entry("phone", user.getPhone() != null ? user.getPhone() : ""),
            Map.entry("city", user.getCity() != null ? user.getCity() : ""),
            Map.entry("state", user.getState() != null ? user.getState() : ""),
            Map.entry("avatar", user.getAvatar() != null ? user.getAvatar() : ""),
            Map.entry("partnerBusinessName", user.getPartnerBusinessName() != null ? user.getPartnerBusinessName() : ""),
            Map.entry("partnerStatus", user.getPartnerStatus() != null ? user.getPartnerStatus() : ""),
            Map.entry("isActive", user.isActive()),
            Map.entry("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody Map<String, String> updates) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("email")) {
            String email = updates.get("email").trim().toLowerCase();
            userRepository.findByEmail(email).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new RuntimeException("That email address is already in use.");
                }
            });
            user.setEmail(email);
        }
        if (updates.containsKey("name")) user.setName(updates.get("name"));
        if (updates.containsKey("phone")) user.setPhone(updates.get("phone"));
        if (updates.containsKey("city")) user.setCity(updates.get("city"));
        if (updates.containsKey("state")) user.setState(updates.get("state"));
        if (updates.containsKey("avatar")) user.setAvatar(updates.get("avatar"));

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.ofEntries(
            Map.entry("id", saved.getId()), Map.entry("name", saved.getName()),
            Map.entry("email", saved.getEmail()), Map.entry("role", saved.getRole()),
            Map.entry("phone", saved.getPhone() != null ? saved.getPhone() : ""),
            Map.entry("city", saved.getCity() != null ? saved.getCity() : ""),
            Map.entry("state", saved.getState() != null ? saved.getState() : ""),
            Map.entry("partnerBusinessName", saved.getPartnerBusinessName() != null ? saved.getPartnerBusinessName() : ""),
            Map.entry("partnerStatus", saved.getPartnerStatus() != null ? saved.getPartnerStatus() : ""),
            Map.entry("isActive", saved.isActive())
        ));
    }
}
