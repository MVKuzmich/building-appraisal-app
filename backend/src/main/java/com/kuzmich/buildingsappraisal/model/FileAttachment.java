package com.kuzmich.buildingsappraisal.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileAttachment {
    private String fileName;
    private String originalName;
    private String fileType;
    private String fileUrl;
    private Long size;
} 