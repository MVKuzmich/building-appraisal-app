package com.kuzmich.buildingsappraisal.dto;

import java.util.List;

import com.kuzmich.buildingsappraisal.model.Adjustment;

import lombok.Value;

@Value
public class EstimationSheetDto {
  
    String normAppliance;
    int orderedNumber;
    String buildingName;
    String buildingYear;
    String buildingFoundation;
    String buildingWalls;
    String buildingRoof;
    Dimensions dimensions;
    String type;
    String selectedBasedCost;
    List<Adjustment> selectedAdjustments;
    TotalCommonAdjustments totalCommonAdjustments;
    double basedCostWithAdjustments;
    double buildingAppraisal;
    int wearRate;
    double buildingAppraisalWithWear;
    double insuredValue;

    /*
    const estimationData = {
      buildingName: buildingType.estimationSheetData.name,
      buildingYear,
      buildingFoundation: buildingType.estimationSheetData.foundation,
      buildingWalls: buildingType.estimationSheetData.walls,
      buildingRoof: buildingType.estimationSheetData.roof,     
      dimensions: buildingDimensions,
      type: buildingType.type,
      selectedBasedCost,
      selectedAdjustments,
      totalCommonAdjustments,
      basedCostWithAdjustments,
      buildingAppraisal: parseFloat(buildingAppraisal.toFixed(2)),
      wearRate,
      buildingAppraisalWithWear: parseFloat(buildingAppraisalWithWear.toFixed(2)),
      insuredValue
    };
    */
    
}
