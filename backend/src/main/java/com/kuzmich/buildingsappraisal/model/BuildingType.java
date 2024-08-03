package com.kuzmich.buildingsappraisal.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document(collection = "building_types")
@Data
public class BuildingType {

    @Id
    private String id;
    private String name;
    private String description;
    private List<Characteristic> characteristics;
    private List<VolumeBasedCost> volumeBasedCosts;
    private List<Adjustment> adjustments;
    
}
