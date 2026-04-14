package com.repolensai.util;

import com.repolensai.exception.BadRequestException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public final class ZipFileExtractor {

    private ZipFileExtractor() {
    }

    public static List<ExtractedSourceFile> extract(InputStream inputStream) {
        List<ExtractedSourceFile> files = new ArrayList<>();
        try (ZipInputStream zipInputStream = new ZipInputStream(inputStream, StandardCharsets.UTF_8)) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }
                String entryName = entry.getName().replace('\\', '/');
                if (!FileFilterUtils.isCodeFile(entryName)) {
                    continue;
                }
                String content = new String(zipInputStream.readAllBytes(), StandardCharsets.UTF_8);
                files.add(new ExtractedSourceFile(entryName, content));
            }
        } catch (IOException ex) {
            throw new BadRequestException("Failed to extract ZIP archive");
        }
        return files;
    }

    public record ExtractedSourceFile(String path, String content) {
    }
}
