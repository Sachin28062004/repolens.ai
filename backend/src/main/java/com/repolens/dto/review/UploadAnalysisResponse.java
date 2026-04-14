package com.codelensai.dto.review;

import java.util.List;

public record UploadAnalysisResponse(List<FileFinding> findings, int analyzedFiles) {
}
