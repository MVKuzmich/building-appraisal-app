package com.kuzmich.buildingsappraisal.service;

import java.util.List;

import org.springframework.stereotype.Component;

import com.kuzmich.buildingsappraisal.dto.Dimensions;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.model.Adjustment;
import com.kuzmich.buildingsappraisal.model.NormAppliance;
import com.kuzmich.buildingsappraisal.model.VolumeBasedCost;

@Component
public class AppraisalCalculator {

    public static final double INSURANCE_COEFFICIENT = 0.5;
    private static final double CALCULATION_TOLERANCE = 0.02;

    public AppraisalResult calculate(EstimationSheetDto dto) {
        double selectedBasedCost = parseSelectedBasedCost(dto.getSelectedBasedCost());
        double basedCostWithAdjustments = calculateBasedCostWithAdjustments(
                selectedBasedCost, dto.getSelectedAdjustments());
        double totalBasedCost = calculateTotalBasedCost(
                dto.getNormAppliance(), basedCostWithAdjustments, dto.getDimensions());
        double commonAdjustments = dto.getTotalCommonAdjustments() != null
                ? dto.getTotalCommonAdjustments().getTotalValue()
                : 0.0;
        double buildingAppraisal = round(totalBasedCost + commonAdjustments);
        double buildingAppraisalWithWear = round(buildingAppraisal * (1 - dto.getWearRate() / 100.0));
        double insuredValue = round(buildingAppraisalWithWear * INSURANCE_COEFFICIENT);

        return new AppraisalResult(
                round(basedCostWithAdjustments),
                buildingAppraisal,
                buildingAppraisalWithWear,
                insuredValue
        );
    }

    public boolean matchesClientValues(EstimationSheetDto dto) {
        AppraisalResult calculated = calculate(dto);
        return approximatelyEqual(dto.getBasedCostWithAdjustments(), calculated.basedCostWithAdjustments())
                && approximatelyEqual(dto.getBuildingAppraisal(), calculated.buildingAppraisal())
                && approximatelyEqual(dto.getBuildingAppraisalWithWear(), calculated.buildingAppraisalWithWear())
                && approximatelyEqual(dto.getInsuredValue(), calculated.insuredValue());
    }

    public EstimationSheetDto recalculate(EstimationSheetDto dto) {
        AppraisalResult calculated = calculate(dto);
        return new EstimationSheetDto(
                NormAppliance.normalize(dto.getNormAppliance()),
                dto.getOrderedNumber(),
                dto.getBuildingName(),
                dto.getBuildingYear(),
                dto.getBuildingFoundation(),
                dto.getBuildingWalls(),
                dto.getBuildingRoof(),
                dto.getDimensions(),
                dto.getType(),
                dto.getSelectedBasedCost(),
                dto.getSelectedAdjustments(),
                dto.getTotalCommonAdjustments(),
                calculated.basedCostWithAdjustments(),
                calculated.buildingAppraisal(),
                dto.getWearRate(),
                calculated.buildingAppraisalWithWear(),
                calculated.insuredValue()
        );
    }

    public double calculateBasedCostWithAdjustments(double selectedBasedCost, List<Adjustment> adjustments) {
        double result = selectedBasedCost;
        if (adjustments != null) {
            for (Adjustment adjustment : adjustments) {
                result += adjustment.getAdjustmentCost();
            }
        }
        return result;
    }

    public double calculateTotalBasedCost(String normAppliance, double basedCostWithAdjustments, Dimensions dimensions) {
        String normalized = NormAppliance.normalize(normAppliance);
        if (NormAppliance.PER_CUBIC_METER.equals(normalized)) {
            return basedCostWithAdjustments * dimensions.getCubic();
        }
        if (NormAppliance.PER_SQUARE_METER.equals(normalized)) {
            return basedCostWithAdjustments * dimensions.getArea();
        }
        return basedCostWithAdjustments;
    }

    public Double findTierCost(List<VolumeBasedCost> tiers, double measurementValue) {
        if (tiers == null || tiers.isEmpty() || measurementValue <= 0) {
            return null;
        }

        for (VolumeBasedCost tier : tiers) {
            if (!isNumericRange(tier)) {
                continue;
            }
            double from = parseNumeric(tier.getVolumeFrom());
            double to = parseNumeric(tier.getVolumeTo());
            if (measurementValue >= from && measurementValue < to) {
                return tier.getCost();
            }
        }
        return null;
    }

    public double getMeasurementValue(String normAppliance, Dimensions dimensions) {
        if (NormAppliance.isPerSquareMeter(normAppliance)) {
            return dimensions.getArea();
        }
        if (NormAppliance.isPerCubicMeter(normAppliance)) {
            return dimensions.getCubic();
        }
        return dimensions.getCubic() > 0 ? dimensions.getCubic() : dimensions.getArea();
    }

    private boolean isNumericRange(VolumeBasedCost tier) {
        return isNumeric(tier.getVolumeFrom()) && isNumeric(tier.getVolumeTo());
    }

    private boolean isNumeric(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        try {
            Double.parseDouble(value.trim());
            return true;
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    private double parseNumeric(String value) {
        return Double.parseDouble(value.trim());
    }

    private double parseSelectedBasedCost(String selectedBasedCost) {
        if (selectedBasedCost == null || selectedBasedCost.isBlank()) {
            return 0.0;
        }
        return Double.parseDouble(selectedBasedCost);
    }

    private boolean approximatelyEqual(double left, double right) {
        return Math.abs(left - right) <= CALCULATION_TOLERANCE;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    public record AppraisalResult(
            double basedCostWithAdjustments,
            double buildingAppraisal,
            double buildingAppraisalWithWear,
            double insuredValue
    ) {
    }
}
