package com.repolensai.dto.review;

import java.util.List;

public record RepositoryAnalysisResponse(
        String owner,
        String repository,
        String branch,
        String sourceType,
        List<FileFinding> findings) {
}
