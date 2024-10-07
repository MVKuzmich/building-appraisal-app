package com.kuzmich.buildingsappraisal.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.service.BuildingTypeService;
import com.kuzmich.buildingsappraisal.service.ExcelTableCreator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost"})
@Slf4j
public class BuildingTypeController {

    private final BuildingTypeService buildingTypeService;
    private final ExcelTableCreator excelTableCreator;

    @GetMapping("/building-types")
    public List<BuildingType> getBuildingType(@RequestParam(required = false) String buildingType,
                                            @RequestParam (required = false) String buildingName) {
        return buildingTypeService.getBuildingTypes(buildingType, buildingName);
    }
    
    @PostMapping("/export-to-xlsx")
    public ResponseEntity<byte[]> exportToXlsx(@RequestBody List<EstimationSheetDto> estimationSheetDtoList) throws Exception {
        estimationSheetDtoList.forEach(item -> log.info(item.toString()));
        // Конвертация CSV в XLSX с помощью Aspose.Cells
        byte[] xlsxBytes = excelTableCreator.createExcelTable(estimationSheetDtoList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "InsuranceAssessmentSheet.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(xlsxBytes, headers, HttpStatus.OK);
    }
        
}
