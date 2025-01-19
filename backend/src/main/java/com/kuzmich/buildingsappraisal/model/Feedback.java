package com.kuzmich.buildingsappraisal.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feedback")
public class Feedback {
    @Id
    private String id;
    private String message;
    private String email;
    private LocalDateTime date;
    private List<FileAttachment> attachments;
} 