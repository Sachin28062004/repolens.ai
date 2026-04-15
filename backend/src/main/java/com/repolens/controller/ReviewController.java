package com.repolensai.controller;

import com.repolensai.dto.review.CodeReviewRequest;
import com.repolensai.dto.review.CodeReviewResponse;
import com.repolensai.service.groq.GroqService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final GroqService groqService;

    public ReviewController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping("/code")
    public ResponseEntity<CodeReviewResponse> reviewCode(@Valid @RequestBody CodeReviewRequest request) {
        return ResponseEntity.ok(groqService.reviewCode(request.code(), request.language(), request.fileName()));
    }
}
