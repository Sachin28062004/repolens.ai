package com.codelensai.service.github;

import com.codelensai.exception.BadRequestException;
import com.codelensai.exception.ExternalServiceException;
import com.codelensai.service.model.SourceFile;
import com.codelensai.util.FileFilterUtils;
import com.codelensai.util.RepoUrlParser;
import com.codelensai.util.RepoUrlParser.GitHubPullRequestRef;
import com.codelensai.util.RepoUrlParser.GitHubRepoRef;
import com.fasterxml.jackson.databind.JsonNode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriUtils;

@Component
public class GitHubApiClient {

    private final RestClient restClient;

    public GitHubApiClient(@Qualifier("githubRestClient") RestClient githubRestClient) {
        this.restClient = githubRestClient;
    }

    public record RepositoryMetadata(String owner, String repository, String defaultBranch) {
    }

    public RepositoryMetadata fetchRepositoryMetadata(String repoUrl) {
        GitHubRepoRef repoRef = RepoUrlParser.parseRepositoryUrl(repoUrl);
        JsonNode repoJson = getJson("/repos/%s/%s".formatted(repoRef.owner(), repoRef.repository()));
        String defaultBranch = repoJson.path("default_branch").asText(null);
        if (defaultBranch == null || defaultBranch.isBlank()) {
            throw new ExternalServiceException("GitHub repository did not return a default branch");
        }
        return new RepositoryMetadata(repoRef.owner(), repoRef.repository(), defaultBranch);
    }

    public List<String> listBranches(String repoUrl) {
        GitHubRepoRef repoRef = RepoUrlParser.parseRepositoryUrl(repoUrl);
        JsonNode branchesJson = getJson("/repos/%s/%s/branches?per_page=100".formatted(repoRef.owner(), repoRef.repository()));
        List<String> branches = new ArrayList<>();
        if (branchesJson.isArray()) {
            for (JsonNode branchNode : branchesJson) {
                String name = branchNode.path("name").asText(null);
                if (name != null && !name.isBlank()) {
                    branches.add(name);
                }
            }
        }
        return branches;
    }

    public String fetchPrimaryEmail(String accessToken) {
        JsonNode emails = getJsonWithToken("/user/emails", accessToken);
        if (emails == null || !emails.isArray() || emails.isEmpty()) {
            throw new ExternalServiceException("GitHub email list is empty");
        }
        for (JsonNode emailNode : emails) {
            if (emailNode.path("primary").asBoolean(false)
                    && emailNode.path("verified").asBoolean(false)) {
                String email = emailNode.path("email").asText(null);
                if (email != null && !email.isBlank()) {
                    return email;
                }
            }
        }
        String fallback = emails.get(0).path("email").asText(null);
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        throw new ExternalServiceException("Unable to resolve GitHub email");
    }

    public List<SourceFile> fetchBranchFiles(String repoUrl, String branch, int maxFiles) {
        RepositoryMetadata metadata = fetchRepositoryMetadata(repoUrl);
        String commitSha = fetchBranchCommitSha(metadata.owner(), metadata.repository(), branch);
        JsonNode treeJson = getJson("/repos/%s/%s/git/trees/%s?recursive=1"
                .formatted(metadata.owner(), metadata.repository(), commitSha));
        return extractFiles(metadata.owner(), metadata.repository(), branch, treeJson, maxFiles);
    }

    public List<SourceFile> fetchPullRequestFiles(String repoUrl, int pullRequestNumber, int maxFiles) {
        RepositoryMetadata metadata = fetchRepositoryMetadata(repoUrl);
        JsonNode pullRequestJson = getJson("/repos/%s/%s/pulls/%d".formatted(metadata.owner(), metadata.repository(), pullRequestNumber));
        String headRef = pullRequestJson.path("head").path("ref").asText(null);
        if (headRef == null || headRef.isBlank()) {
            throw new ExternalServiceException("Unable to resolve pull request head ref");
        }

        JsonNode filesJson = getJson("/repos/%s/%s/pulls/%d/files?per_page=100".formatted(metadata.owner(), metadata.repository(), pullRequestNumber));
        List<SourceFile> files = new ArrayList<>();
        if (filesJson.isArray()) {
            for (JsonNode fileNode : filesJson) {
                if (files.size() >= maxFiles) {
                    break;
                }
                String fileName = fileNode.path("filename").asText(null);
                if (fileName == null || !FileFilterUtils.isCodeFile(fileName)) {
                    continue;
                }
                String content = tryFetchFileContent(metadata.owner(), metadata.repository(), fileName, headRef);
                if (content == null || content.isBlank()) {
                    content = fileNode.path("patch").asText("");
                }
                files.add(new SourceFile(fileName, inferLanguage(fileName), content));
            }
        }
        return files;
    }

    private List<SourceFile> extractFiles(String owner, String repository, String branch, JsonNode treeJson, int maxFiles) {
        List<SourceFile> files = new ArrayList<>();
        JsonNode tree = treeJson.path("tree");
        if (!tree.isArray()) {
            return files;
        }

        for (JsonNode entry : tree) {
            if (files.size() >= maxFiles) {
                break;
            }
            String path = entry.path("path").asText(null);
            String type = entry.path("type").asText(null);
            if (path == null || !"blob".equals(type) || !FileFilterUtils.isCodeFile(path)) {
                continue;
            }
            String content = tryFetchFileContent(owner, repository, path, branch);
            if (content == null || content.isBlank()) {
                continue;
            }
            files.add(new SourceFile(path, inferLanguage(path), content));
        }
        return files;
    }

    private String tryFetchFileContent(String owner, String repository, String path, String ref) {
        try {
            String encodedPath = UriUtils.encodePath(path, StandardCharsets.UTF_8);
            String encodedRef = UriUtils.encodeQueryParam(ref, StandardCharsets.UTF_8);
            JsonNode contentJson = getJson("/repos/%s/%s/contents/%s?ref=%s"
                    .formatted(owner, repository, encodedPath, encodedRef));
            String encoded = contentJson.path("content").asText(null);
            String encoding = contentJson.path("encoding").asText(null);
            if (encoded != null && "base64".equalsIgnoreCase(encoding)) {
                return new String(Base64.getDecoder().decode(encoded.replaceAll("\\s", "")), StandardCharsets.UTF_8);
            }
        } catch (Exception ex) {
            return null;
        }
        return null;
    }

    private String fetchBranchCommitSha(String owner, String repository, String branch) {
        String encodedBranch = UriUtils.encodePathSegment(branch, StandardCharsets.UTF_8);
        JsonNode branchJson = getJson("/repos/%s/%s/branches/%s".formatted(owner, repository, encodedBranch));
        String sha = branchJson.path("commit").path("sha").asText(null);
        if (sha == null || sha.isBlank()) {
            throw new ExternalServiceException("Unable to resolve branch commit sha");
        }
        return sha;
    }

    private JsonNode getJson(String uri) {
        try {
            return restClient.get().uri(uri).retrieve().body(JsonNode.class);
        } catch (Exception ex) {
            throw new ExternalServiceException("GitHub request failed: " + ex.getMessage());
        }
    }

    private JsonNode getJsonWithToken(String uri, String token) {
        try {
            return restClient.get()
                    .uri(uri)
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (Exception ex) {
            throw new ExternalServiceException("GitHub request failed: " + ex.getMessage());
        }
    }

    private String inferLanguage(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".java")) {
            return "java";
        }
        if (lower.endsWith(".kt") || lower.endsWith(".kts")) {
            return "kotlin";
        }
        if (lower.endsWith(".js") || lower.endsWith(".jsx")) {
            return "javascript";
        }
        if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
            return "typescript";
        }
        if (lower.endsWith(".py")) {
            return "python";
        }
        if (lower.endsWith(".go")) {
            return "go";
        }
        if (lower.endsWith(".rb")) {
            return "ruby";
        }
        if (lower.endsWith(".php")) {
            return "php";
        }
        if (lower.endsWith(".cs")) {
            return "csharp";
        }
        if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".c") || lower.endsWith(".h") || lower.endsWith(".hpp")) {
            return "cpp";
        }
        if (lower.endsWith(".rs")) {
            return "rust";
        }
        return "text";
    }
}
