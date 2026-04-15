package com.repolensai.util;

import java.util.Set;

public final class FileFilterUtils {

    private static final Set<String> IGNORED_SEGMENTS = Set.of(
            "node_modules", ".git", ".env", "dist", "build", "target");

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".java", ".kt", ".kts", ".js", ".jsx", ".ts", ".tsx",
            ".py", ".go", ".rb", ".php", ".cs", ".c", ".cc", ".cpp", ".h", ".hpp",
            ".rs", ".scala", ".html", ".css", ".scss", ".json", ".yml", ".yaml",
            ".xml", ".sh", ".sql");

    private FileFilterUtils() {
    }

    public static boolean isCodeFile(String path) {
        String lower = path.toLowerCase();
        if (IGNORED_SEGMENTS.stream().anyMatch(lower::contains)) {
            return false;
        }
        return ALLOWED_EXTENSIONS.stream().anyMatch(lower::endsWith);
    }
}
