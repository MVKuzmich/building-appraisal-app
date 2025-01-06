package com.kuzmich.buildingsappraisal.service;

import com.kuzmich.buildingsappraisal.model.Feedback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.developer}")
    private String developerEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendFeedbackEmail(Feedback feedback) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(developerEmail);
        message.setSubject("Новое сообщение от пользователя");
        
        String emailBody = String.format(
            "Получено новое сообщение:\n\nТекст: %s\nEmail отправителя: %s\nДата: %s",
            feedback.getMessage(),
            feedback.getEmail() != null ? feedback.getEmail() : "не указан",
            feedback.getDate()
        );
        
        message.setText(emailBody);
        mailSender.send(message);
    }
} 