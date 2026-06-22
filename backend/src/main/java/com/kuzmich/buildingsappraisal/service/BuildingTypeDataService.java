package com.kuzmich.buildingsappraisal.service;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.model.NormAppliance;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BuildingTypeDataService {

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Getter
    private List<BuildingType> buildingTypes = List.of();

    @PostConstruct
    void loadData() {
        try (InputStream inputStream = resourceLoader.getResource("classpath:data.json").getInputStream()) {
            BuildingType[] loaded = objectMapper.readValue(inputStream, BuildingType[].class);
            for (BuildingType buildingType : loaded) {
                buildingType.setNormAppliance(NormAppliance.normalize(buildingType.getNormAppliance()));
            }
            buildingTypes = List.of(loaded);
            log.info("Loaded {} building types from data.json", buildingTypes.size());
        } catch (Exception e) {
            log.error("Failed to load building types", e);
            throw new IllegalStateException("Failed to load building types", e);
        }
    }

    public List<BuildingType> getAll() {
        return buildingTypes;
    }

    public Optional<BuildingType> findByType(String type) {
        if (type == null || type.isBlank()) {
            return Optional.empty();
        }
        return buildingTypes.stream()
                .filter(item -> item.getType().equalsIgnoreCase(type.trim()))
                .findFirst();
    }

    public List<BuildingType> getUnmodifiableList() {
        return Collections.unmodifiableList(buildingTypes);
    }
}
