package com.kuzmich.buildingsappraisal.service;

import java.io.InputStream;
import java.util.List;

import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.repository.BuildingTypeRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataLoader {

    private final BuildingTypeRepository repository;
    private final ResourceLoader resourceLoader;

    @PostConstruct
    @Transactional
    public void loadData() {
        try {
            long repositoryCount = repository.count();

            InputStream inputStream = resourceLoader.getResource("classpath:data.json").getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            List<BuildingType> entities = List.of(mapper.readValue(inputStream, BuildingType[].class));
            int fileCount = entities.size();

            if (fileCount != repositoryCount) {
                log.info("Mismatch detected. Updating database. File count: {}, Repository count: {}", fileCount, repositoryCount);
                repository.deleteAll();
                repository.saveAll(entities);
                log.info("Database update completed successfully.");
            } else {
                log.info("No update needed. File count and repository count match: {}", fileCount);
            }
        } catch (Exception e) {
            log.error("Error occurred during data loading", e);
            throw new RuntimeException("Failed to load data", e);
        }
    }
}