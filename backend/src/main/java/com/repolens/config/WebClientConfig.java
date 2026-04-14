package com.codelensai.config;

import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class WebClientConfig {

    @Bean
    public RestClient groqRestClient(AppProperties appProperties) {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(appProperties.getGroq().getBaseUrl())
                .defaultHeader("Content-Type", "application/json")
                .requestFactory(timeoutFactory(appProperties.getGroq().getTimeout()));
        if (appProperties.getGroq().getApiKey() != null && !appProperties.getGroq().getApiKey().isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + appProperties.getGroq().getApiKey());
        }
        return builder.build();
    }

    @Bean
    public RestClient githubRestClient(AppProperties appProperties) {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(appProperties.getGithub().getApiBaseUrl())
                .defaultHeader("Accept", "application/vnd.github+json")
                .requestFactory(timeoutFactory(appProperties.getGithub().getTimeout()));
        if (appProperties.getGithub().getToken() != null && !appProperties.getGithub().getToken().isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + appProperties.getGithub().getToken());
        }
        return builder.build();
    }

    private SimpleClientHttpRequestFactory timeoutFactory(Duration timeout) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        int millis = Math.toIntExact(timeout.toMillis());
        factory.setConnectTimeout(millis);
        factory.setReadTimeout(millis);
        return factory;
    }
}
