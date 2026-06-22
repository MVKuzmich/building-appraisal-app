package com.kuzmich.buildingsappraisal.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

import com.kuzmich.buildingsappraisal.model.BuildingType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BuildingTypeService {

    private final BuildingTypeDataService buildingTypeDataService;

    public List<BuildingType> getBuildingTypes(String buildingType, String buildingName) {
        List<BuildingType> result = new ArrayList<>(buildingTypeDataService.getAll());

        if (buildingType != null && !buildingType.isBlank()) {
            String normalizedType = buildingType.trim();
            result = result.stream()
                    .filter(item -> item.getType().equalsIgnoreCase(normalizedType))
                    .toList();
        }

        if (buildingName != null && !buildingName.isBlank()) {
            String[] userWords = buildingName.toLowerCase().trim().split("\\s+");
            result = result.stream()
                    .filter(item -> {
                        String name = item.getName().toLowerCase();
                        for (String word : userWords) {
                            if (!name.contains(word)) {
                                return false;
                            }
                        }
                        return true;
                    })
                    .toList();
        }

        return result;
    }

    public BuildingType getBuildingTypeById(String type) {
        return buildingTypeDataService.findByType(type)
                .orElseThrow(() -> new IllegalArgumentException("Building type not found: " + type));
    }
}
