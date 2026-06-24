package com.kuzmich.buildingsappraisal.model;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
    private String id;
    private String message;
    private String email;
    private LocalDateTime date;
    private List<FileAttachment> attachments;
}
