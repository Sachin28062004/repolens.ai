package com.codelensai.security;

import com.codelensai.domain.AuthProvider;
import com.codelensai.domain.UserAccount;
import com.codelensai.exception.ExternalServiceException;
import com.codelensai.repository.UserAccountRepository;
import com.codelensai.service.github.GitHubApiClient;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class GitHubOAuth2UserService extends DefaultOAuth2UserService {

    private final GitHubApiClient gitHubApiClient;
    private final UserAccountRepository userAccountRepository;

    public GitHubOAuth2UserService(GitHubApiClient gitHubApiClient, UserAccountRepository userAccountRepository) {
        this.gitHubApiClient = gitHubApiClient;
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        if (!"github".equalsIgnoreCase(userRequest.getClientRegistration().getRegistrationId())) {
            return oauth2User;
        }

        Map<String, Object> attributes = new LinkedHashMap<>(oauth2User.getAttributes());
        String name = firstNonBlank((String) attributes.get("name"), (String) attributes.get("login"), "GitHub User");
        String email = resolveEmail(attributes, userRequest.getAccessToken());
        attributes.put("name", name);
        attributes.put("email", email);

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
        userAccountRepository.save(user);

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        return new DefaultOAuth2User(authorities, attributes, "id");
    }

    private String resolveEmail(Map<String, Object> attributes, OAuth2AccessToken accessToken) {
        Object email = attributes.get("email");
        if (email instanceof String value && !value.isBlank()) {
            return value;
        }
        try {
            return gitHubApiClient.fetchPrimaryEmail(accessToken.getTokenValue());
        } catch (Exception ex) {
            throw new ExternalServiceException("Failed to load GitHub email");
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "GitHub User";
    }
}
