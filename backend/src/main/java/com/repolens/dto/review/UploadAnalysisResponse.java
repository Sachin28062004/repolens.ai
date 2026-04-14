package com.repolensai.dto.review;

import java.util.List;

public record UploadAnalysisResponse(List<FileFinding> findings, int analyzedFiles) {
}
