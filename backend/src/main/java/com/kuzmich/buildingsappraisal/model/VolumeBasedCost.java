package com.kuzmich.buildingsappraisal.model;

import lombok.Data;

@Data
public class VolumeBasedCost {
    private double volumeFrom;
    private double volumeTo;
    private double cost;
    
}
