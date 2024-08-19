package com.kuzmich.buildingsappraisal.model;

import lombok.Data;

@Data
public class Adjustment {

    private String adjustmentGroup;
    private String[] adjustmentElement;
    private double adjustmentCost;
    
}
