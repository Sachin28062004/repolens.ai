package com.codelensai.dto.review;

import java.util.List;

public record CodeReviewResponse(List<BugFinding> bugs, String explanation, String fixedCode) {
}
