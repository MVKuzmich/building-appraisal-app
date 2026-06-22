package com.kuzmich.buildingsappraisal.model;

import java.util.List;

import lombok.Data;

@Data
public class BuildingType {

    private String type;
    private String name;
    private String description;
    private EstimationSheetData estimationSheetData;
    private String basedCostsDependency;
    private String normAppliance;
    private List<VolumeBasedCost> volumeBasedCosts;
    private List<Adjustment> adjustments;
    private List<String> notes;
}
