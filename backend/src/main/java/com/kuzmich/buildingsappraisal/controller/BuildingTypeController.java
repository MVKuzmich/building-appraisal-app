package com.kuzmich.buildingsappraisal.controller;

import org.springframework.web.bind.annotation.RestController;

import com.kuzmich.buildingsappraisal.dto.FormData;
import com.kuzmich.buildingsappraisal.model.BuildingType;
import com.kuzmich.buildingsappraisal.service.BuildingTypeService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
@CrossOrigin
public class BuildingTypeController {

    private final BuildingTypeService buildingTypeService;

    @GetMapping("/building-types")
    public List<BuildingType> getBuildingType(@RequestParam(required = false) String buildingType,
                                            @RequestParam (required = false) String buildingName) {
        return buildingTypeService.getBuildingTypes(buildingType, buildingName);
    }
    

    
}
