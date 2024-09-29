package com.kuzmich.buildingsappraisal.dto;

import java.util.List;

import lombok.Data;


@Data
public class TotalCommonAdjustments {

    private double totalValue;
    private List<CommonAdjustment> commonAdjustmentsList;
    
}
