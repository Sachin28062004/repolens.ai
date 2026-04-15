package com.repolensai.service.github;

import com.repolensai.config.AppProperties;
import com.repolensai.dto.review.RepositoryAnalysisRequest;
import com.repolensai.dto.review.RepositoryAnalysisResponse;
import com.repolensai.dto.review.RepositoryBranchesResponse;
import com.repolensai.dto.review.FileFinding;
import com.repolensai.exception.BadRequestException;
import com.repolensai.service.groq.GroqService;
import com.repolensai.service.model.SourceFile;
import com.repolensai.util.RepoUrlParser;
import com.repolensai.util.RepoUrlParser.GitHubPullRequestRef;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GitHubRepositoryService {

    private final GitHubApiClient gitHubApiClient;
    private final GroqService groqService;
    private final AppProperties appProperties;

    public GitHubRepositoryService(GitHubApiClient gitHubApiClient, GroqService groqService, AppProperties appProperties) {
        this.gitHubApiClient = gitHubApiClient;
        this.groqService = groqService;
        this.appProperties = appProperties;
    }

    public RepositoryBranchesResponse listBranches(String repoUrl) {
        GitHubApiClient.RepositoryMetadata metadata = gitHubApiClient.fetchRepositoryMetadata(repoUrl);
        List<String> branches = gitHubApiClient.listBranches(repoUrl);
        return new RepositoryBranchesResponse(metadata.owner(), metadata.repository(), metadata.defaultBranch(), branches);
    }

    public RepositoryAnalysisResponse analyze(RepositoryAnalysisRequest request) {
        GitHubApiClient.RepositoryMetadata metadata = gitHubApiClient.fetchRepositoryMetadata(request.repoUrl());
        String branch = hasText(request.branch()) ? request.branch() : metadata.defaultBranch();
        int maxFiles = resolveMaxFiles(request.maxFiles());
        List<SourceFile> files;
        String sourceType;

        if (hasText(request.pullRequestUrl())) {
            GitHubPullRequestRef prRef = RepoUrlParser.parsePullRequestUrl(request.pullRequestUrl());
            if (!prRef.owner().equalsIgnoreCase(metadata.owner()) || !prRef.repository().equalsIgnoreCase(metadata.repository())) {
                throw new BadRequestException("Pull request URL must match the repository URL");
            }
            files = gitHubApiClient.fetchPullRequestFiles(request.repoUrl(), prRef.number(), maxFiles);
            sourceType = "pull-request";
        } else {
            files = gitHubApiClient.fetchBranchFiles(request.repoUrl(), branch, maxFiles);
            sourceType = "branch";
        }

        if (files.isEmpty()) {
            throw new BadRequestException("No analyzable code files were found in the selected source");
        }

        List<FileFinding> findings = groqService.reviewFiles(files, "Analyze repository files from " + metadata.repository());
        return new RepositoryAnalysisResponse(metadata.owner(), metadata.repository(), branch, sourceType, findings);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private int resolveMaxFiles(Integer requested) {
        int max = requested == null || requested < 1 ? appProperties.getUpload().getMaxFiles() : requested;
        return Math.min(max, appProperties.getUpload().getMaxFiles());
    }
}
