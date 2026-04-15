package com.repolensai.service.groq;

import com.repolensai.config.AppProperties;
import com.repolensai.dto.review.BugFinding;
import com.repolensai.dto.review.CodeReviewResponse;
import com.repolensai.dto.review.FileFinding;
import com.repolensai.exception.ExternalServiceException;
import com.repolensai.service.model.SourceFile;
import java.util.ArrayList;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
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
            return sanitizeCodeReview(objectMapper.readValue(content, CodeReviewResponse.class), code);
        } catch (Exception ex) {
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
            return sanitizeFileFindings(objectMapper.convertValue(findings, new TypeReference<List<FileFinding>>() {}), files);
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
                - Only report bugs supported by the provided code. Do not speculate about unseen files, versions, or runtime environments.
                - Return at least one bug only if a concrete issue exists in the provided code.
                - If no bugs are found, return bugs as an empty array and explain why.
                - Do not include markdown fences.
                - Keep the fixed code complete, syntactically valid, and as close to the original as possible.
                - Every bug must include non-empty explanation, fix, and severity.
                - Severity must be exactly one of: low, medium, high, critical.

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
        builder.append("- Analyze only the provided file contents. Do not assume hidden dependencies, package versions, repository history, or external configuration unless explicitly present in the file.\n");
        builder.append("- Report at most one finding per file and only if it is grounded in the visible content.\n");
        builder.append("- Keep fileName exactly as provided.\n");
        builder.append("- Do not include markdown fences.\n");
        builder.append("- If a file looks clean, return bug as \"No obvious bug found\" with a brief explanation and fix as \"None required\".\n");
        builder.append("- Limit the output to the files provided.\n");
        builder.append("- Do not invent version mismatches unless the file explicitly contains conflicting versions.\n");
        builder.append("- Every finding must include non-empty bug, explanation, fix, and severity.\n");
        builder.append("- Severity must be exactly one of: low, medium, high, critical.\n");
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
                You must identify bugs, security issues, and maintainability problems using only the provided content.
                Never fabricate context that is not visible in the input.
                Respond with valid JSON only and no markdown.
                """;
    }

    private CodeReviewResponse sanitizeCodeReview(CodeReviewResponse response, String originalCode) {
        List<BugFinding> bugs = response.bugs() == null ? List.of() : response.bugs().stream()
                .map(this::sanitizeBugFinding)
                .toList();
        String explanation = hasText(response.explanation())
                ? response.explanation().trim()
                : (bugs.isEmpty() ? "No obvious bug was found in the provided code." : "Potential issues were found in the provided code.");
        String fixedCode = hasText(response.fixedCode()) ? response.fixedCode().trim() : originalCode;
        return new CodeReviewResponse(bugs, explanation, fixedCode);
    }

    private List<FileFinding> sanitizeFileFindings(List<FileFinding> findings, List<SourceFile> files) {
        List<FileFinding> sanitized = new ArrayList<>();
        int count = Math.min(findings.size(), files.size());
        for (int index = 0; index < count; index++) {
            FileFinding finding = findings.get(index);
            SourceFile file = files.get(index);
            sanitized.add(sanitizeFileFinding(finding, file.path()));
        }
        for (int index = count; index < files.size(); index++) {
            sanitized.add(defaultCleanFinding(files.get(index).path()));
        }
        return sanitized;
    }

    private BugFinding sanitizeBugFinding(BugFinding finding) {
        String bug = hasText(finding.bug()) ? finding.bug().trim() : "No obvious bug found";
        String explanation = hasText(finding.explanation()) ? finding.explanation().trim() : defaultExplanationForBug(bug);
        String fix = hasText(finding.fix()) ? finding.fix().trim() : defaultFixForBug(bug);
        String severity = normalizeSeverity(finding.severity(), bug);
        return new BugFinding(bug, explanation, fix, severity);
    }

    private FileFinding sanitizeFileFinding(FileFinding finding, String expectedFileName) {
        String bug = hasText(finding.bug()) ? finding.bug().trim() : "No obvious bug found";
        String explanation = hasText(finding.explanation()) ? finding.explanation().trim() : defaultExplanationForBug(bug);
        String fix = hasText(finding.fix()) ? finding.fix().trim() : defaultFixForBug(bug);
        String severity = normalizeSeverity(finding.severity(), bug);
        return new FileFinding(expectedFileName, bug, explanation, fix, severity);
    }

    private FileFinding defaultCleanFinding(String fileName) {
        return new FileFinding(fileName, "No obvious bug found", "No clear bug was found in the provided file content.", "None required", "low");
    }

    private String defaultExplanationForBug(String bug) {
        return "No detailed explanation was returned, but the reported issue appears to be: " + bug + ".";
    }

    private String defaultFixForBug(String bug) {
        if ("No obvious bug found".equalsIgnoreCase(bug)) {
            return "None required";
        }
        return "Review the reported issue and apply the smallest safe code change to address it.";
    }

    private String normalizeSeverity(String severity, String bug) {
        if (hasText(severity)) {
            String normalized = severity.trim().toLowerCase();
            if (List.of("low", "medium", "high", "critical").contains(normalized)) {
                return normalized;
            }
        }
        return "No obvious bug found".equalsIgnoreCase(bug) ? "low" : "medium";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
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
