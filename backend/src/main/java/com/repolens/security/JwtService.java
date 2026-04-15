package com.repolensai.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.repolensai.config.AppProperties;
import com.repolensai.domain.UserAccount;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final AppProperties appProperties;
    private final Algorithm algorithm;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
        this.algorithm = Algorithm.HMAC256(resolveSecret(appProperties.getJwt().getSecret()));
    }

    public String generateToken(UserAccount user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(appProperties.getJwt().getExpiration());
        return JWT.create()
                .withIssuer(appProperties.getJwt().getIssuer())
                .withAudience(appProperties.getJwt().getAudience())
                .withSubject(user.getEmail())
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .withClaim("userId", user.getId())
                .withClaim("name", user.getName())
                .withClaim("provider", user.getProvider().name())
                .sign(algorithm);
    }

    public String extractEmail(String token) {
        return JWT.require(algorithm)
                .withIssuer(appProperties.getJwt().getIssuer())
                .withAudience(appProperties.getJwt().getAudience())
                .build()
                .verify(token)
                .getSubject();
    }

    public boolean isValid(String token) {
        try {
            JWT.require(algorithm)
                    .withIssuer(appProperties.getJwt().getIssuer())
                    .withAudience(appProperties.getJwt().getAudience())
                    .build()
                    .verify(token);
            return true;
        } catch (JWTVerificationException ex) {
            return false;
        }
    }

    private byte[] resolveSecret(String secret) {
        try {
            return Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException ex) {
            return secret.getBytes(StandardCharsets.UTF_8);
        }
    }
}
