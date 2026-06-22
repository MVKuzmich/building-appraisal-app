package com.kuzmich.buildingsappraisal.dto;

import lombok.Data;

@Data
public class CommonAdjustmentItem {
    private String element;
    private double cost;
    private String unit;
}
