package com.repolensai.config;

import jakarta.validation.constraints.NotBlank;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Groq groq = new Groq();
    private final GitHub github = new GitHub();
    private final Upload upload = new Upload();
    private final Security security = new Security();
    private final Cors cors = new Cors();

    public Jwt getJwt() {
        return jwt;
    }

    public Groq getGroq() {
        return groq;
    }

    public GitHub getGithub() {
        return github;
    }

    public Upload getUpload() {
        return upload;
    }

    public Security getSecurity() {
        return security;
    }

    public Cors getCors() {
        return cors;
    }

    public static class Jwt {
        @NotBlank
        private String secret;
        private String issuer = "repolens-ai";
        private String audience = "repolens-ai-api";
        private Duration expiration = Duration.ofHours(24);

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getAudience() {
            return audience;
        }

        public void setAudience(String audience) {
            this.audience = audience;
        }

        public Duration getExpiration() {
            return expiration;
        }

        public void setExpiration(Duration expiration) {
            this.expiration = expiration;
        }
    }

    public static class Groq {
        private String apiKey;
        private String baseUrl = "https://api.groq.com/openai/v1";
        private String model = "moonshotai/kimi-k2-instruct-0905";
        private Duration timeout = Duration.ofSeconds(90);

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Duration getTimeout() {
            return timeout;
        }

        public void setTimeout(Duration timeout) {
            this.timeout = timeout;
        }
    }

    public static class GitHub {
        private String apiBaseUrl = "https://api.github.com";
        private String token;
        private Duration timeout = Duration.ofSeconds(30);

        public String getApiBaseUrl() {
            return apiBaseUrl;
        }

        public void setApiBaseUrl(String apiBaseUrl) {
            this.apiBaseUrl = apiBaseUrl;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public Duration getTimeout() {
            return timeout;
        }

        public void setTimeout(Duration timeout) {
            this.timeout = timeout;
        }
    }

    public static class Upload {
        private int maxFiles = 10;
        private long maxZipBytes = 15 * 1024 * 1024L;

        public int getMaxFiles() {
            return maxFiles;
        }

        public void setMaxFiles(int maxFiles) {
            this.maxFiles = maxFiles;
        }

        public long getMaxZipBytes() {
            return maxZipBytes;
        }

        public void setMaxZipBytes(long maxZipBytes) {
            this.maxZipBytes = maxZipBytes;
        }
    }

    public static class Security {
        private String oauth2SuccessRedirectUri = "http://localhost:3000/oauth2/success";
        private String[] permittedOrigins = new String[] {"http://localhost:3000"};

        public String getOauth2SuccessRedirectUri() {
            return oauth2SuccessRedirectUri;
        }

        public void setOauth2SuccessRedirectUri(String oauth2SuccessRedirectUri) {
            this.oauth2SuccessRedirectUri = oauth2SuccessRedirectUri;
        }

        public String[] getPermittedOrigins() {
            return permittedOrigins;
        }

        public void setPermittedOrigins(String[] permittedOrigins) {
            this.permittedOrigins = permittedOrigins;
        }
    }

    public static class Cors {
        private String[] allowedOrigins = new String[] {"http://localhost:3000"};
        private String[] allowedMethods = new String[] {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"};

        public String[] getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String[] allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }

        public String[] getAllowedMethods() {
            return allowedMethods;
        }

        public void setAllowedMethods(String[] allowedMethods) {
            this.allowedMethods = allowedMethods;
        }
    }
}
