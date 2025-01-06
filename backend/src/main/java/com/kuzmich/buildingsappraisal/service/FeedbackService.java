package com.kuzmich.buildingsappraisal.service;

import com.kuzmich.buildingsappraisal.model.Feedback;
import com.kuzmich.buildingsappraisal.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final EmailService emailService;

    public FeedbackService(FeedbackRepository feedbackRepository, EmailService emailService) {
        this.feedbackRepository = feedbackRepository;
        this.emailService = emailService;
    }

    public Feedback saveFeedback(Feedback feedback) {
        // Сохраняем в MongoDB
        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        // Отправляем email
        emailService.sendFeedbackEmail(savedFeedback);
        
        return savedFeedback;
    }
} 