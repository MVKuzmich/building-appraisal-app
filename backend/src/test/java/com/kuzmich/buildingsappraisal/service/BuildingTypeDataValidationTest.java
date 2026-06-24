package com.kuzmich.buildingsappraisal.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.model.NormAppliance;
import com.kuzmich.buildingsappraisal.model.VolumeBasedCost;

class BuildingTypeDataValidationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void dataJsonHasExpectedStructureAndUniqueTypes() throws Exception {
        try (InputStream inputStream = getClass().getResourceAsStream("/data.json")) {
            BuildingType[] buildingTypes = objectMapper.readValue(inputStream, BuildingType[].class);

            assertEquals(92, buildingTypes.length);

            Set<String> uniqueTypes = new HashSet<>();
            for (BuildingType buildingType : buildingTypes) {
                assertTrue(uniqueTypes.add(buildingType.getType()), "Duplicate type: " + buildingType.getType());
                assertTrue(buildingType.getName() != null && !buildingType.getName().isBlank());
                assertTrue(buildingType.getNormAppliance() != null && !buildingType.getNormAppliance().isBlank());
                assertTrue(buildingType.getVolumeBasedCosts() != null && !buildingType.getVolumeBasedCosts().isEmpty());
                assertTrue(buildingType.getEstimationSheetData() != null);

                String normalized = NormAppliance.normalize(buildingType.getNormAppliance());
                assertTrue(
                        NormAppliance.PER_CUBIC_METER.equals(normalized)
                                || NormAppliance.PER_SQUARE_METER.equals(normalized)
                                || NormAppliance.PER_BUILDING.equals(normalized),
                        "Unexpected normAppliance: " + buildingType.getNormAppliance()
                );

                Set<Double> costs = new HashSet<>();
                for (VolumeBasedCost tier : buildingType.getVolumeBasedCosts()) {
                    assertTrue(tier.getCost() > 0);
                    assertTrue(costs.add(tier.getCost()),
                            "Duplicate tier cost in type " + buildingType.getType());
                }
            }
        }
    }

    @Test
    void commonAdjustmentsJsonIsNotEmpty() throws Exception {
        try (InputStream inputStream = getClass().getResourceAsStream("/common-adjustments.json")) {
            List<?> adjustments = objectMapper.readValue(inputStream, List.class);
            assertTrue(adjustments.size() >= 10);
        }
    }
}
