package com.codelensai.service.groq;

import com.codelensai.config.AppProperties;
import com.codelensai.dto.review.CodeReviewResponse;
import com.codelensai.dto.review.FileFinding;
import com.codelensai.exception.ExternalServiceException;
import com.codelensai.service.model.SourceFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.beans.factory.annotation.Qualifier;

@Service
public class GroqService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;

    public GroqService(@Qualifier("groqRestClient") RestClient groqRestClient, ObjectMapper objectMapper, AppProperties appProperties) {
        this.restClient = groqRestClient;
        this.objectMapper = objectMapper;
        this.appProperties = appProperties;
    }

    public CodeReviewResponse reviewCode(String code, String language, String fileName) {
        String prompt = buildCodeReviewPrompt(code, language, fileName);
        String content = extractJsonPayload(completePrompt(prompt));
        try {
            return objectMapper.readValue(content, CodeReviewResponse.class);
        } catch (JsonProcessingException ex) {
            throw new ExternalServiceException("Groq returned invalid code review JSON");
        }
    }

    public List<FileFinding> reviewFiles(List<SourceFile> files, String reviewContext) {
        String prompt = buildFilesReviewPrompt(files, reviewContext);
        String content = extractJsonPayload(completePrompt(prompt));
        try {
            JsonNode node = objectMapper.readTree(content);
            JsonNode findings = node.path("findings");
            if (!findings.isArray()) {
                throw new ExternalServiceException("Groq response missing findings");
            }
            return objectMapper.convertValue(findings, new TypeReference<List<FileFinding>>() {});
        } catch (Exception ex) {
            throw new ExternalServiceException("Groq returned invalid repository analysis JSON");
        }
    }

    private String completePrompt(String userPrompt) {
        if (appProperties.getGroq().getApiKey() == null || appProperties.getGroq().getApiKey().isBlank()) {
            throw new ExternalServiceException("Groq API key is not configured");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", appProperties.getGroq().getModel());
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemInstruction()),
                Map.of("role", "user", "content", userPrompt)));
        body.put("temperature", 0.2);
        body.put("response_format", Map.of("type", "json_object"));

        try {
            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            JsonNode choices = response.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                throw new ExternalServiceException("Groq returned no choices");
            }
            String content = choices.get(0).path("message").path("content").asText(null);
            if (content == null || content.isBlank()) {
                throw new ExternalServiceException("Groq returned an empty message");
            }
            return content.trim();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalServiceException("Groq request failed: " + ex.getMessage());
        }
    }

    private String buildCodeReviewPrompt(String code, String language, String fileName) {
        return """
                Review the following %s code and return only valid JSON with this shape:
                {
                  "bugs": [
                    {
                      "bug": "short bug summary",
                      "explanation": "why it happens",
                      "fix": "concrete fix",
                      "severity": "low|medium|high|critical"
                    }
                  ],
                  "explanation": "overall review summary",
                  "fixedCode": "full corrected code or an improved version"
                }

                Rules:
                - Return at least one bug if a real issue exists.
                - If no bugs are found, return bugs as an empty array and explain why.
                - Do not include markdown fences.
                - Keep the fixed code complete and syntactically valid.

                File name: %s
                Code:
                %s
                """.formatted(language, fileName == null ? "unknown" : fileName, code);
    }

    private String buildFilesReviewPrompt(List<SourceFile> files, String reviewContext) {
        StringBuilder builder = new StringBuilder();
        builder.append("Review each file and return only valid JSON with this shape:\n");
        builder.append("{\"findings\":[{\"fileName\":\"path\",\"bug\":\"...\",\"explanation\":\"...\",\"fix\":\"...\",\"severity\":\"low|medium|high|critical\"}]}\n");
        builder.append("Rules:\n");
        builder.append("- Analyze the most important issue for each file.\n");
        builder.append("- Keep fileName exactly as provided.\n");
        builder.append("- Do not include markdown fences.\n");
        builder.append("- If a file looks clean, still provide a concise finding saying no obvious bug was found.\n");
        builder.append("- Limit the output to the files provided.\n");
        builder.append("\nContext: ").append(reviewContext).append("\n\n");
        for (SourceFile file : files) {
            builder.append("FILE: ").append(file.path()).append("\n");
            builder.append("LANGUAGE: ").append(file.language()).append("\n");
            builder.append("CODE:\n").append(file.content()).append("\n");
            builder.append("---\n");
        }
        return builder.toString();
    }

    private String systemInstruction() {
        return """
                You are a senior software engineer and code reviewer.
                You must identify bugs, security issues, and maintainability problems.
                Respond with valid JSON only and no markdown.
                """;
    }

    private String extractJsonPayload(String content) {
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1).trim();
        }
        return content.trim();
    }
}
