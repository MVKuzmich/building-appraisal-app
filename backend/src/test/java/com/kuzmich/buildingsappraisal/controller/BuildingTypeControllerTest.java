package com.kuzmich.buildingsappraisal.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kuzmich.buildingsappraisal.dto.Dimensions;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.dto.TotalCommonAdjustments;
import com.kuzmich.buildingsappraisal.model.NormAppliance;

@SpringBootTest
@AutoConfigureMockMvc
class BuildingTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void returnsBuildingTypeByExactType() throws Exception {
        mockMvc.perform(get("/api/building-types").param("buildingType", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("1"))
                .andExpect(jsonPath("$[0].normAppliance").value(NormAppliance.PER_CUBIC_METER));
    }

    @Test
    void returnsBuildingTypeByPathVariable() throws Exception {
        mockMvc.perform(get("/api/building-types/81"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("81"))
                .andExpect(jsonPath("$.normAppliance").value(NormAppliance.PER_SQUARE_METER));
    }

    @Test
    void returnsCommonAdjustments() throws Exception {
        mockMvc.perform(get("/api/common-adjustments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].element").exists())
                .andExpect(jsonPath("$[0].cost").exists());
    }

    @Test
    void exportsExcelFile() throws Exception {
        EstimationSheetDto dto = new EstimationSheetDto(
                NormAppliance.PER_CUBIC_METER,
                1,
                "Жилой дом",
                "1990",
                "бетон",
                "кирпич",
                "металл",
                new Dimensions(10, 10, 1, 100, 100),
                "1",
                "76",
                List.of(),
                totalCommonAdjustments(0),
                76,
                7600,
                10,
                6840,
                3420
        );

        mockMvc.perform(post("/api/export-to-xlsx")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(dto))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("InsuranceAssessmentSheet.xlsx")));
    }

    private TotalCommonAdjustments totalCommonAdjustments(double totalValue) {
        TotalCommonAdjustments total = new TotalCommonAdjustments();
        total.setTotalValue(totalValue);
        return total;
    }
}
