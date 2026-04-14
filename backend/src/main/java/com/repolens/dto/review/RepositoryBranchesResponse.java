package com.repolensai.dto.review;

import java.util.List;

public record RepositoryBranchesResponse(String owner, String repository, String defaultBranch, List<String> branches) {
}
