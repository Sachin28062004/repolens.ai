package com.repolensai.dto.auth;

public record AuthResponse(String token, String tokenType, UserResponse user) {
}
