package com.codelensai.controller;

import com.codelensai.dto.review.RepositoryAnalysisRequest;
import com.codelensai.dto.review.RepositoryAnalysisResponse;
import com.codelensai.dto.review.RepositoryBranchesResponse;
import com.codelensai.service.github.GitHubRepositoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubRepositoryService repositoryService;

    public GitHubController(GitHubRepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @GetMapping("/branches")
    public ResponseEntity<RepositoryBranchesResponse> branches(@RequestParam String repoUrl) {
        return ResponseEntity.ok(repositoryService.listBranches(repoUrl));
    }

    @PostMapping("/analyze")
    public ResponseEntity<RepositoryAnalysisResponse> analyze(@Valid @RequestBody RepositoryAnalysisRequest request) {
        return ResponseEntity.ok(repositoryService.analyze(request));
    }
}
