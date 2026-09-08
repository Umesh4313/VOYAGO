package com.voyago.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;

    private String tokenType;

    private String userId;

    private String name;

    private String email;

    private String role;

    private String partnerStatus;

    private String phone;

    private String city;

    private String state;
}
