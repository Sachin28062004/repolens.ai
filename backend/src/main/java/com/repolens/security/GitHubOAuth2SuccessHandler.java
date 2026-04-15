package com.repolensai.security;

import com.repolensai.config.AppProperties;
import com.repolensai.domain.AuthProvider;
import com.repolensai.domain.UserAccount;
import com.repolensai.exception.ExternalServiceException;
import com.repolensai.repository.UserAccountRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class GitHubOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AppProperties appProperties;
    private final JwtService jwtService;
    private final UserAccountRepository userAccountRepository;

    public GitHubOAuth2SuccessHandler(AppProperties appProperties, JwtService jwtService, UserAccountRepository userAccountRepository) {
        this.appProperties = appProperties;
        this.jwtService = jwtService;
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            throw new ExternalServiceException("OAuth2 login did not return a user principal");
        }

        String email = resolveText(oauth2User, "email", null);
        String name = resolveText(oauth2User, "name", resolveText(oauth2User, "login", "GitHub User"));
        if (email == null || email.isBlank()) {
            throw new ExternalServiceException("GitHub login did not return an email");
        }

        String normalizedEmail = email.toLowerCase();
        UserAccount user = userAccountRepository.findByEmail(normalizedEmail).orElseGet(UserAccount::new);
        user.setName(name);
        user.setEmail(normalizedEmail);
        if (user.getId() == null) {
            user.setPassword(null);
            user.setProvider(AuthProvider.GITHUB);
        } else if (user.getProvider() == null) {
            user.setProvider(AuthProvider.GITHUB);
        }
        user = userAccountRepository.save(user);

        String token = jwtService.generateToken(user);
        String redirect = appProperties.getSecurity().getOauth2SuccessRedirectUri()
                + "?token=" + url(token)
                + "&email=" + url(user.getEmail())
                + "&name=" + url(user.getName());
        response.sendRedirect(redirect);
    }

    private String url(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String resolveText(OAuth2User user, String key, String fallback) {
        Object value = user.getAttributes().get(key);
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        return fallback;
    }
}
