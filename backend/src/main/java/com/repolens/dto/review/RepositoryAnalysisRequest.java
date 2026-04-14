package com.codelensai.dto.review;

import jakarta.validation.constraints.NotBlank;

public record RepositoryAnalysisRequest(
        @NotBlank String repoUrl,
        String branch,
        String pullRequestUrl,
        Integer maxFiles) {
}
