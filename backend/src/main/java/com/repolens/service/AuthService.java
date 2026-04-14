package com.repolensai.service;

import com.repolensai.domain.AuthProvider;
import com.repolensai.domain.UserAccount;
import com.repolensai.dto.auth.AuthResponse;
import com.repolensai.dto.auth.LoginRequest;
import com.repolensai.dto.auth.RegisterRequest;
import com.repolensai.dto.auth.UserResponse;
import com.repolensai.exception.ConflictException;
import com.repolensai.exception.UnauthorizedException;
import com.repolensai.repository.UserAccountRepository;
import com.repolensai.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase();
        if (userAccountRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        UserAccount user = new UserAccount();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setProvider(AuthProvider.LOCAL);
        user = userAccountRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user), "Bearer", toResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new ConflictException("Please login with GitHub for this account");
        }
        if (user.getPassword() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return new AuthResponse(jwtService.generateToken(user), "Bearer", toResponse(user));
    }

    public UserResponse toResponse(UserAccount user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getProvider());
    }
}
