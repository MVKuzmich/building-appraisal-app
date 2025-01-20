package com.kuzmich.buildingsappraisal.service;

import com.kuzmich.buildingsappraisal.model.Feedback;
import com.kuzmich.buildingsappraisal.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final EmailService emailService;

    @Transactional
    public Feedback saveFeedback(Feedback feedback) {
        try {
            // Сначала пробуем отправить email
            emailService.sendFeedbackEmail(feedback);
            log.info("Email sent successfully");
            
            // Если email отправлен успешно, сохраняем в БД
            Feedback savedFeedback = feedbackRepository.save(feedback);
            log.info("Feedback saved to database: {}", savedFeedback.getId());
            
            return savedFeedback;
        } catch (Exception e) {
            log.error("Failed to process feedback", e);
            throw new RuntimeException("Failed to process feedback: " + e.getMessage(), e);
        }
    }
} 