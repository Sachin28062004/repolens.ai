package com.repolensai.dto.review;

import jakarta.validation.constraints.NotBlank;

public record CodeReviewRequest(
        @NotBlank String code,
        @NotBlank String language,
        String fileName) {
}
