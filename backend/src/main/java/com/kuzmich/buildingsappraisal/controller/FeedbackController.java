package com.kuzmich.buildingsappraisal.controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.kuzmich.buildingsappraisal.model.Feedback;
import com.kuzmich.buildingsappraisal.model.FileAttachment;
import com.kuzmich.buildingsappraisal.service.FeedbackService;
import com.kuzmich.buildingsappraisal.service.FileStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    private final FileStorageService fileStorageService;

    @PostMapping("/files/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Receiving file upload request: {}", file.getOriginalFilename());
            String fileName = fileStorageService.storeFile(file);
            FileAttachment attachment = new FileAttachment(
                fileName,
                file.getOriginalFilename(),
                file.getContentType(),
                "/api/files/" + fileName,
                file.getSize()
            );
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            log.error("Error uploading file: ", e);
            return ResponseEntity.internalServerError()
                .body("Error uploading file: " + e.getMessage());
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> createFeedback(@RequestBody Feedback feedback) {
        try {
            log.info("Receiving feedback submission");
            feedback.setDate(LocalDateTime.now());
            return ResponseEntity.ok(feedbackService.saveFeedback(feedback));
        } catch (Exception e) {
            log.error("Error creating feedback: ", e);
            return ResponseEntity.internalServerError()
                .body("Error creating feedback: " + e.getMessage());
        }
    }
}