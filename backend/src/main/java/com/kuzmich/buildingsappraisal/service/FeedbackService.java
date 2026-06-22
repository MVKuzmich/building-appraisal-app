package com.kuzmich.buildingsappraisal.service;

import com.kuzmich.buildingsappraisal.model.Feedback;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackFileStorageService feedbackFileStorageService;
    private final EmailService emailService;

    public Feedback saveFeedback(Feedback feedback) {
        try {
            emailService.sendFeedbackEmail(feedback);
            log.info("Email sent successfully");

            Feedback savedFeedback = feedbackFileStorageService.save(feedback);
            log.info("Feedback saved to file storage: {}", savedFeedback.getId());

            return savedFeedback;
        } catch (Exception e) {
            log.error("Failed to process feedback", e);
            throw new RuntimeException("Failed to process feedback: " + e.getMessage(), e);
        }
    }
}
