package com.codelensai.dto.auth;

public record OAuth2LoginResponse(String redirectUri, String token, UserResponse user) {
}
