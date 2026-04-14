package com.codelensai.controller;

import com.codelensai.dto.review.UploadAnalysisResponse;
import com.codelensai.service.upload.UploadAnalysisService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final UploadAnalysisService uploadAnalysisService;

    public UploadController(UploadAnalysisService uploadAnalysisService) {
        this.uploadAnalysisService = uploadAnalysisService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadAnalysisResponse> analyzeUpload(
            @RequestPart(value = "archive", required = false) MultipartFile archive,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "context", required = false) String context) {
        return ResponseEntity.ok(uploadAnalysisService.analyze(archive, files, context));
    }
}
