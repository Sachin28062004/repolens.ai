package com.codelensai.dto.auth;

import com.codelensai.domain.AuthProvider;

public record UserResponse(Long id, String name, String email, AuthProvider provider) {
}
