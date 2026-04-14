package com.codelensai.util;

import com.codelensai.exception.BadRequestException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class RepoUrlParser {

    private static final Pattern HTTPS = Pattern.compile("github\\.com/([^/]+)/([^/]+?)(?:\\.git)?(?:/.*)?$");
    private static final Pattern SSH = Pattern.compile("git@github\\.com:([^/]+)/([^/]+?)(?:\\.git)?$");
    private static final Pattern PR = Pattern.compile("github\\.com/([^/]+)/([^/]+)/pull/(\\d+)");

    private RepoUrlParser() {
    }

    public static GitHubRepoRef parseRepositoryUrl(String url) {
        String normalized = normalize(url);
        Matcher httpsMatcher = HTTPS.matcher(normalized);
        if (httpsMatcher.find()) {
            return new GitHubRepoRef(clean(httpsMatcher.group(1)), clean(httpsMatcher.group(2)));
        }
        Matcher sshMatcher = SSH.matcher(normalized);
        if (sshMatcher.find()) {
            return new GitHubRepoRef(clean(sshMatcher.group(1)), clean(sshMatcher.group(2)));
        }
        throw new BadRequestException("Invalid GitHub repository URL");
    }

    public static GitHubPullRequestRef parsePullRequestUrl(String url) {
        String normalized = normalize(url);
        Matcher matcher = PR.matcher(normalized);
        if (matcher.find()) {
            return new GitHubPullRequestRef(clean(matcher.group(1)), clean(matcher.group(2)), Integer.parseInt(matcher.group(3)));
        }
        throw new BadRequestException("Invalid GitHub pull request URL");
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("GitHub URL must not be blank");
        }
        return value.trim().replaceFirst("^https?://", "");
    }

    private static String clean(String value) {
        return value.replaceAll("\\.git$", "");
    }

    public record GitHubRepoRef(String owner, String repository) {
    }

    public record GitHubPullRequestRef(String owner, String repository, int number) {
    }
}
