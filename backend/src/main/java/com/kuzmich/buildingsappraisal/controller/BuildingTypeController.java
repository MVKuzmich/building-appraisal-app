package com.kuzmich.buildingsappraisal.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kuzmich.buildingsappraisal.dto.CommonAdjustmentItem;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.service.AppraisalCalculator;
import com.kuzmich.buildingsappraisal.service.BuildingTypeService;
import com.kuzmich.buildingsappraisal.service.CommonAdjustmentsDataService;
import com.kuzmich.buildingsappraisal.service.ExcelTableCreator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
public class BuildingTypeController {

    private final BuildingTypeService buildingTypeService;
    private final ExcelTableCreator excelTableCreator;
    private final AppraisalCalculator appraisalCalculator;
    private final CommonAdjustmentsDataService commonAdjustmentsDataService;

    @GetMapping("/building-types")
    public List<BuildingType> getBuildingTypes(@RequestParam(required = false) String buildingType,
                                               @RequestParam(required = false) String buildingName) {
        return buildingTypeService.getBuildingTypes(buildingType, buildingName);
    }

    @GetMapping("/building-types/{type}")
    public BuildingType getBuildingTypeByType(@PathVariable String type) {
        return buildingTypeService.getBuildingTypeById(type);
    }

    @GetMapping("/common-adjustments")
    public List<CommonAdjustmentItem> getCommonAdjustments() {
        return commonAdjustmentsDataService.getCommonAdjustments();
    }

    @PostMapping("/export-to-xlsx")
    public ResponseEntity<byte[]> exportToXlsx(@RequestBody List<EstimationSheetDto> estimationSheetDtoList)
            throws Exception {
        List<EstimationSheetDto> validatedRows = estimationSheetDtoList.stream()
                .map(this::validateAndRecalculate)
                .collect(Collectors.toList());

        byte[] xlsxBytes = excelTableCreator.createExcelTable(validatedRows);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "InsuranceAssessmentSheet.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(xlsxBytes, headers, HttpStatus.OK);
    }

    private EstimationSheetDto validateAndRecalculate(EstimationSheetDto dto) {
        if (!appraisalCalculator.matchesClientValues(dto)) {
            log.warn("Client calculation mismatch for building type {}. Recalculating on server.", dto.getType());
        }
        return appraisalCalculator.recalculate(dto);
    }
}
