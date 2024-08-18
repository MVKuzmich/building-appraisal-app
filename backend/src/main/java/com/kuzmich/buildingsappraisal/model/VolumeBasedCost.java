package com.kuzmich.buildingsappraisal.model;

import lombok.Data;

@Data
public class VolumeBasedCost {
    private String volumeFrom;
    private String volumeTo;
    private double cost;
    
}
