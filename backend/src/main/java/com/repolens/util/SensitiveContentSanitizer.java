package com.codelensai.util;

import java.util.regex.Pattern;

public final class SensitiveContentSanitizer {

    private static final Pattern SECRET_LINE = Pattern.compile(
            "(?im)^(\\s*(?:api[_-]?key|secret|token|password|passwd|private[_-]?key|client[_-]?secret)\\s*[:=]\\s*)(.+)$");
    private static final Pattern BEARER = Pattern.compile("(?i)bearer\\s+[A-Za-z0-9-._~+/]+=*");
    private static final Pattern AWS_KEY = Pattern.compile("AKIA[0-9A-Z]{16}");

    private SensitiveContentSanitizer() {
    }

    public static String sanitize(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }
        String sanitized = SECRET_LINE.matcher(content).replaceAll("$1[REDACTED]");
        sanitized = BEARER.matcher(sanitized).replaceAll("Bearer [REDACTED]");
        sanitized = AWS_KEY.matcher(sanitized).replaceAll("[REDACTED_AWS_KEY]");
        return sanitized;
    }
}
