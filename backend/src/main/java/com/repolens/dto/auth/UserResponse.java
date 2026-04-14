package com.repolensai.dto.auth;

import com.repolensai.domain.AuthProvider;

public record UserResponse(Long id, String name, String email, AuthProvider provider) {
}
