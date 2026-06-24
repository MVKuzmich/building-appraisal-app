package com.kuzmich.buildingsappraisal.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kuzmich.buildingsappraisal.model.Feedback;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FeedbackFileStorageService {

    private final Path feedbackDirectory;
    private final ObjectMapper objectMapper;

    public FeedbackFileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.feedbackDirectory = Paths.get(uploadDir, "feedback");
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(feedbackDirectory);
    }

    public Feedback save(Feedback feedback) {
        if (feedback.getId() == null || feedback.getId().isBlank()) {
            feedback.setId(UUID.randomUUID().toString());
        }

        Path target = feedbackDirectory.resolve(feedback.getId() + ".json");
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(target.toFile(), feedback);
            log.info("Feedback saved to {}", target);
            return feedback;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to save feedback", e);
        }
    }
}
