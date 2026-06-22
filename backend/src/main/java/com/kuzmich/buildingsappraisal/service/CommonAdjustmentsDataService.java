package com.kuzmich.buildingsappraisal.service;

import java.io.InputStream;
import java.util.List;

import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuzmich.buildingsappraisal.dto.CommonAdjustmentItem;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommonAdjustmentsDataService {

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Getter
    private List<CommonAdjustmentItem> commonAdjustments = List.of();

    @PostConstruct
    void loadData() {
        try (InputStream inputStream = resourceLoader.getResource("classpath:common-adjustments.json").getInputStream()) {
            commonAdjustments = List.of(objectMapper.readValue(inputStream, CommonAdjustmentItem[].class));
            log.info("Loaded {} common adjustments", commonAdjustments.size());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load common adjustments", e);
        }
    }
}
