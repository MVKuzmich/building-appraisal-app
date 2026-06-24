package com.kuzmich.buildingsappraisal.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import com.kuzmich.buildingsappraisal.dto.Dimensions;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.dto.TotalCommonAdjustments;
import com.kuzmich.buildingsappraisal.model.Adjustment;
import com.kuzmich.buildingsappraisal.model.NormAppliance;

class ExcelTableCreatorTest {

    private final ExcelTableCreator excelTableCreator = new ExcelTableCreator();

    @Test
    void writesCalculatedValuesIntoWorksheet() throws Exception {
        Adjustment adjustment = new Adjustment();
        adjustment.setAdjustmentGroup("Кровля");
        adjustment.setAdjustmentElement(new String[] {"Черепица", "код"});
        adjustment.setAdjustmentCost(2.1);

        EstimationSheetDto dto = new EstimationSheetDto(
                NormAppliance.PER_CUBIC_METER,
                1,
                "Жилой дом 3 эт.",
                "1990",
                "бетон",
                "кирпич",
                "металл",
                new Dimensions(10, 10, 1, 100, 100),
                "1",
                "76",
                List.of(adjustment),
                totalCommonAdjustments(0),
                78.1,
                7810,
                10,
                7029,
                3514.5
        );

        byte[] workbookBytes = excelTableCreator.createExcelTable(List.of(dto));

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(workbookBytes))) {
            Sheet sheet = workbook.getSheetAt(0);
            Row dataRow = sheet.getRow(6);

            assertEquals("Жилой дом 3 эт.", dataRow.getCell(1).getStringCellValue());
            assertEquals(100.0, dataRow.getCell(8).getNumericCellValue(), 0.01);
            assertEquals(78.1, dataRow.getCell(12).getNumericCellValue(), 0.01);
            assertEquals(3514.5, dataRow.getCell(17).getNumericCellValue(), 0.01);
            assertTrue(sheet.getSheetName().contains("Оценочный"));
        }
    }

    private TotalCommonAdjustments totalCommonAdjustments(double totalValue) {
        TotalCommonAdjustments total = new TotalCommonAdjustments();
        total.setTotalValue(totalValue);
        return total;
    }
}
