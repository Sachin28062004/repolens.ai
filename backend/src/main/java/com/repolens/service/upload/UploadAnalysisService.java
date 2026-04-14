package com.codelensai.service.upload;

import com.codelensai.config.AppProperties;
import com.codelensai.dto.review.FileFinding;
import com.codelensai.dto.review.UploadAnalysisResponse;
import com.codelensai.exception.BadRequestException;
import com.codelensai.service.groq.GroqService;
import com.codelensai.service.model.SourceFile;
import com.codelensai.util.FileFilterUtils;
import com.codelensai.util.SensitiveContentSanitizer;
import com.codelensai.util.ZipFileExtractor;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadAnalysisService {

    private final GroqService groqService;
    private final AppProperties appProperties;

    public UploadAnalysisService(GroqService groqService, AppProperties appProperties) {
        this.groqService = groqService;
        this.appProperties = appProperties;
    }

    public UploadAnalysisResponse analyze(MultipartFile archive, MultipartFile[] files, String context) {
        List<SourceFile> collectedFiles = new ArrayList<>();
        if (archive != null && !archive.isEmpty()) {
            collectedFiles.addAll(extractArchive(archive));
        }
        if (files != null) {
            Arrays.stream(files)
                    .filter(file -> file != null && !file.isEmpty())
                    .forEach(file -> {
                        String path = file.getOriginalFilename() == null ? file.getName() : file.getOriginalFilename();
                        if (!FileFilterUtils.isCodeFile(path)) {
                            return;
                        }
                        collectedFiles.add(new SourceFile(path, inferLanguage(path), sanitize(readFile(file))));
                    });
        }

        if (collectedFiles.isEmpty()) {
            throw new BadRequestException("No analyzable source files were provided");
        }
        int limit = appProperties.getUpload().getMaxFiles();
        List<SourceFile> sourceFiles = collectedFiles.size() > limit
                ? List.copyOf(collectedFiles.subList(0, limit))
                : List.copyOf(collectedFiles);
        if (sourceFiles.isEmpty()) {
            throw new BadRequestException("No analyzable source files were provided");
        }

        List<FileFinding> findings = groqService.reviewFiles(sourceFiles, context == null || context.isBlank()
                ? "Analyze uploaded source files"
                : context);
        return new UploadAnalysisResponse(findings, sourceFiles.size());
    }

    private List<SourceFile> extractArchive(MultipartFile archive) {
        if (archive.getSize() > appProperties.getUpload().getMaxZipBytes()) {
            throw new BadRequestException("ZIP archive exceeds the allowed size");
        }
        if (archive.getOriginalFilename() != null && !archive.getOriginalFilename().toLowerCase().endsWith(".zip")) {
            throw new BadRequestException("Only ZIP archives are supported for archive upload");
        }
        try {
            List<SourceFile> files = new ArrayList<>();
            ZipFileExtractor.extract(archive.getInputStream()).forEach(entry ->
                    files.add(new SourceFile(entry.path(), inferLanguage(entry.path()), sanitize(entry.content()))));
            return files;
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded ZIP archive");
        }
    }

    private String readFile(MultipartFile file) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded file");
        }
    }

    private String sanitize(String content) {
        return SensitiveContentSanitizer.sanitize(content);
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
