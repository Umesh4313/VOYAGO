package com.voyago.security;

import com.voyago.model.User;
import com.voyago.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("partnerApproval")
@RequiredArgsConstructor
public class PartnerApproval {

    private final UserRepository userRepository;

    public boolean isApproved(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) return true;
        return userRepository.findByEmail(authentication.getName())
                .map(User::getPartnerStatus)
                .map("APPROVED"::equals)
                .orElse(false);
    }
}
