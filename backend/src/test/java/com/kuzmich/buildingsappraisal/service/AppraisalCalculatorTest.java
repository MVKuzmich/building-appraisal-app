package com.kuzmich.buildingsappraisal.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.kuzmich.buildingsappraisal.dto.Dimensions;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.dto.TotalCommonAdjustments;
import com.kuzmich.buildingsappraisal.model.Adjustment;
import com.kuzmich.buildingsappraisal.model.NormAppliance;
import com.kuzmich.buildingsappraisal.model.VolumeBasedCost;

class AppraisalCalculatorTest {

    private AppraisalCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new AppraisalCalculator();
    }

    @Test
    void calculatesCubicMeterNormWithAdjustmentsAndWear() {
        EstimationSheetDto dto = baseDto(
                NormAppliance.PER_CUBIC_METER,
                "76",
                List.of(adjustment("Кровля", 2.1)),
                new Dimensions(10, 10, 1, 100, 100),
                10,
                0
        );

        AppraisalCalculator.AppraisalResult result = calculator.calculate(dto);

        assertEquals(78.1, result.basedCostWithAdjustments());
        assertEquals(7810.0, result.buildingAppraisal());
        assertEquals(7029.0, result.buildingAppraisalWithWear());
        assertEquals(3514.5, result.insuredValue());
    }

    @Test
    void calculatesSquareMeterNorm() {
        EstimationSheetDto dto = baseDto(
                NormAppliance.PER_SQUARE_METER,
                "21",
                List.of(),
                new Dimensions(0, 0, 0, 0, 50),
                20,
                0
        );

        AppraisalCalculator.AppraisalResult result = calculator.calculate(dto);

        assertEquals(1050.0, result.buildingAppraisal());
        assertEquals(840.0, result.buildingAppraisalWithWear());
        assertEquals(420.0, result.insuredValue());
    }

    @Test
    void calculatesPerBuildingNorm() {
        EstimationSheetDto dto = baseDto(
                NormAppliance.PER_BUILDING,
                "1200",
                List.of(),
                new Dimensions(5, 4, 3, 60, 20),
                0,
                0
        );

        AppraisalCalculator.AppraisalResult result = calculator.calculate(dto);

        assertEquals(1200.0, result.buildingAppraisal());
        assertEquals(600.0, result.insuredValue());
    }

    @ParameterizedTest
    @CsvSource({
            "на 1 кв.м, на 1 кв.м.",
            "на 1 куб.м, на 1 куб.м.",
            "на одно сооружение, на одно строение"
    })
    void normalizesLegacyNormApplianceValues(String input, String expected) {
        assertEquals(expected, NormAppliance.normalize(input));
    }

    @Test
    void findsTierByMeasurementValue() {
        List<VolumeBasedCost> tiers = List.of(
                tier("0", "4", 1200),
                tier("4", "5", 1420),
                tier("5", "9999", 1640)
        );

        assertEquals(1200.0, calculator.findTierCost(tiers, 3));
        assertEquals(1420.0, calculator.findTierCost(tiers, 4));
        assertEquals(1640.0, calculator.findTierCost(tiers, 5));
    }

    @Test
    void matchesClientValuesWithinTolerance() {
        EstimationSheetDto dto = baseDto(
                NormAppliance.PER_CUBIC_METER,
                "76",
                List.of(),
                new Dimensions(0, 0, 0, 10, 0),
                0,
                0
        );
        AppraisalCalculator.AppraisalResult calculated = calculator.calculate(dto);
        EstimationSheetDto clientDto = new EstimationSheetDto(
                dto.getNormAppliance(),
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
                calculated.basedCostWithAdjustments() + 0.01,
                calculated.buildingAppraisal(),
                dto.getWearRate(),
                calculated.buildingAppraisalWithWear(),
                calculated.insuredValue()
        );

        assertTrue(calculator.matchesClientValues(clientDto));
    }

    @Test
    void detectsClientMismatch() {
        EstimationSheetDto dto = baseDto(
                NormAppliance.PER_SQUARE_METER,
                "21",
                List.of(),
                new Dimensions(0, 0, 0, 0, 50),
                0,
                999
        );

        assertFalse(calculator.matchesClientValues(dto));
    }

    private EstimationSheetDto baseDto(String normAppliance,
                                       String selectedBasedCost,
                                       List<Adjustment> adjustments,
                                       Dimensions dimensions,
                                       int wearRate,
                                       double commonAdjustments) {
        return new EstimationSheetDto(
                normAppliance,
                1,
                "Жилой дом",
                "1990",
                "бетон",
                "кирпич",
                "металл",
                dimensions,
                "1",
                selectedBasedCost,
                adjustments,
                totalCommonAdjustments(commonAdjustments),
                0,
                0,
                wearRate,
                0,
                0
        );
    }

    private TotalCommonAdjustments totalCommonAdjustments(double totalValue) {
        TotalCommonAdjustments total = new TotalCommonAdjustments();
        total.setTotalValue(totalValue);
        return total;
    }

    private Adjustment adjustment(String group, double cost) {
        Adjustment adjustment = new Adjustment();
        adjustment.setAdjustmentGroup(group);
        adjustment.setAdjustmentElement(new String[] {"Элемент", "код"});
        adjustment.setAdjustmentCost(cost);
        return adjustment;
    }

    private VolumeBasedCost tier(String from, String to, double cost) {
        VolumeBasedCost tier = new VolumeBasedCost();
        tier.setVolumeFrom(from);
        tier.setVolumeTo(to);
        tier.setCost(cost);
        return tier;
    }
}
