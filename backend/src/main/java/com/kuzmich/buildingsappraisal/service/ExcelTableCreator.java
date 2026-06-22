package com.kuzmich.buildingsappraisal.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import com.kuzmich.buildingsappraisal.dto.Dimensions;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.model.Adjustment;
import com.kuzmich.buildingsappraisal.model.NormAppliance;
import com.kuzmich.buildingsappraisal.util.AdjustmentColumnHelper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ExcelTableCreator {

    private static final String[] SINGLE_HEADERS = {"№ п/п", "Наименование строения"};
    private static final Map<String, String[]> GROUP_HEADERS = new LinkedHashMap<>();
    private static final String[] ADDITIONAL_HEADERS = {"Площадь строения / Кубатура строения", "Тип", "Оценочная норма"};
    private static final String[] REMAINING_HEADERS = {
            "Оценочная норма с учетом отклонений", "Общие надбавки", "Оценка строений в базисных ценах",
            "Процент износа", "Действительная стоимость в ценах 1991г (с учетом износа)", "Страховая сумма"
    };

    static {
        GROUP_HEADERS.put("Материал", new String[]{"Фундамент", "Стены", "Крыша"});
        GROUP_HEADERS.put("Размеры", new String[]{"Длина", "Ширина", "Высота"});
    }

    public byte[] createExcelTable(List<EstimationSheetDto> data) throws Exception {
        log.info("Creating Excel table for {} rows", data.size());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet worksheet = workbook.createSheet("Оценочный листок");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle subHeaderStyle = createSubHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook, dataStyle);
            CellStyle staticInfoStyle = createStaticInfoStyle(workbook);
            CellStyle footerCellStyle = createFooterCellStyle(workbook);

            configurePageSetup(worksheet);

            addStaticInfo(worksheet, staticInfoStyle);
            addHeaders(worksheet, headerStyle, subHeaderStyle, data);
            addData(worksheet, dataStyle, numberStyle, data);
            addFooter(worksheet, staticInfoStyle, footerCellStyle);

            for (int column = 0; column <= worksheet.getRow(5).getLastCellNum(); column++) {
                worksheet.autoSizeColumn(column);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void configurePageSetup(Sheet worksheet) {
        PrintSetup printSetup = worksheet.getPrintSetup();
        printSetup.setLandscape(true);
        printSetup.setPaperSize(PrintSetup.A4_PAPERSIZE);
        worksheet.setFitToPage(true);
        printSetup.setFitWidth((short) 1);
        printSetup.setFitHeight((short) 1);
    }

    private void addStaticInfo(Sheet worksheet, CellStyle staticInfoStyle) {
        addLabelAndInput(worksheet, 0, "Страховой оценочный листок №", staticInfoStyle, 1, "(номер)");
        addLabelAndInput(worksheet, 1, "Страхователь-собственник(и) строений:", staticInfoStyle, 12, "(страхователь)");
        addLabelAndInput(worksheet, 2, "Адрес строения:", staticInfoStyle, 12, "(адрес строения)");
    }

    private void addLabelAndInput(Sheet worksheet, int rowIndex, String label, CellStyle labelStyle,
                                  int inputCellCount, String placeholder) {
        Row row = worksheet.createRow(rowIndex);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        worksheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, 3));

        int mergeEndCol = 4 + Math.max(inputCellCount, 2) - 1;
        worksheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 4, mergeEndCol));

        Cell placeholderCell = row.createCell(4);
        placeholderCell.setCellValue(placeholder);
        placeholderCell.setCellStyle(labelStyle);
    }

    private void addHeaders(Sheet worksheet, CellStyle headerStyle, CellStyle subHeaderStyle,
                            List<EstimationSheetDto> data) {
        worksheet.createRow(4).setHeightInPoints(40);
        worksheet.createRow(5).setHeightInPoints(80);

        int col = 0;
        for (String header : SINGLE_HEADERS) {
            addSingleHeader(worksheet, headerStyle, header, 4, col++, true);
        }

        for (Map.Entry<String, String[]> entry : GROUP_HEADERS.entrySet()) {
            addGroupHeader(worksheet, headerStyle, subHeaderStyle, entry.getKey(), col, entry.getValue());
            col += entry.getValue().length;
        }

        for (String header : ADDITIONAL_HEADERS) {
            addSingleHeader(worksheet, subHeaderStyle, header, 4, col++, true);
        }

        addAdjustmentHeaders(worksheet, headerStyle, subHeaderStyle, data, col);
        col += AdjustmentColumnHelper.getAdjustmentColumnCount(data);

        for (String header : REMAINING_HEADERS) {
            addSingleHeader(worksheet, subHeaderStyle, header, 4, col++, true);
        }
    }

    private void addSingleHeader(Sheet worksheet, CellStyle style, String text, int row, int col, boolean mergeVertically) {
        Row headerRow = worksheet.getRow(row);
        if (headerRow == null) {
            headerRow = worksheet.createRow(row);
        }
        Cell cell = headerRow.createCell(col);
        cell.setCellValue(text);
        cell.setCellStyle(style);
        if (mergeVertically) {
            worksheet.addMergedRegion(new CellRangeAddress(row, row + 1, col, col));
        }
    }

    private void addAdjustmentHeaders(Sheet worksheet, CellStyle headerStyle, CellStyle subHeaderStyle,
                                    List<EstimationSheetDto> data, int startCol) {
        Map<String, Integer> adjustmentGroupCounts = AdjustmentColumnHelper.getAdjustmentGroupCounts(data);

        if (!adjustmentGroupCounts.isEmpty()) {
            int totalAdjustments = adjustmentGroupCounts.values().stream().mapToInt(Integer::intValue).sum();
            Row groupRow = worksheet.getRow(4);
            Cell groupCell = groupRow.createCell(startCol);
            groupCell.setCellValue("Надбавки");
            groupCell.setCellStyle(headerStyle);
            if (totalAdjustments > 1) {
                worksheet.addMergedRegion(new CellRangeAddress(4, 4, startCol, startCol + totalAdjustments - 1));
            }

            int col = startCol;
            Row subHeaderRow = worksheet.getRow(5);
            for (Map.Entry<String, Integer> entry : adjustmentGroupCounts.entrySet()) {
                for (int i = 0; i < entry.getValue(); i++) {
                    Cell subCell = subHeaderRow.createCell(col++);
                    subCell.setCellValue(entry.getKey());
                    subCell.setCellStyle(subHeaderStyle);
                }
            }
        } else {
            addSingleHeader(worksheet, headerStyle, "Надбавки", 4, startCol, true);
            Cell subCell = worksheet.getRow(5).createCell(startCol);
            subCell.setCellValue("-");
            subCell.setCellStyle(subHeaderStyle);
        }
    }

    private void addGroupHeader(Sheet worksheet, CellStyle headerStyle, CellStyle subHeaderStyle,
                                String groupName, int startCol, String[] subHeaders) {
        Row groupRow = worksheet.getRow(4);
        Cell groupCell = groupRow.createCell(startCol);
        groupCell.setCellValue(groupName);
        groupCell.setCellStyle(headerStyle);
        if (subHeaders.length > 1) {
            worksheet.addMergedRegion(new CellRangeAddress(4, 4, startCol, startCol + subHeaders.length - 1));
        }

        Row subHeaderRow = worksheet.getRow(5);
        for (int i = 0; i < subHeaders.length; i++) {
            Cell subCell = subHeaderRow.createCell(startCol + i);
            subCell.setCellValue(subHeaders[i]);
            subCell.setCellStyle(subHeaderStyle);
            worksheet.setColumnWidth(startCol + i, 15 * 256);
        }
    }

    private void addData(Sheet worksheet, CellStyle dataStyle, CellStyle numberStyle, List<EstimationSheetDto> data) {
        Map<String, Integer> adjustmentGroupCounts = AdjustmentColumnHelper.getAdjustmentGroupCounts(data);

        for (int row = 0; row < data.size(); row++) {
            EstimationSheetDto rowData = data.get(row);
            Row excelRow = worksheet.createRow(row + 6);
            int col = 0;

            setCellValue(excelRow, col++, row + 1, dataStyle);
            setCellValue(excelRow, col++, rowData.getBuildingName(), dataStyle);
            setCellValue(excelRow, col++, rowData.getBuildingFoundation(), dataStyle);
            setCellValue(excelRow, col++, rowData.getBuildingWalls(), dataStyle);
            setCellValue(excelRow, col++, rowData.getBuildingRoof(), dataStyle);

            Dimensions dimensions = rowData.getDimensions();
            setCellValue(excelRow, col++, dimensions.getLength(), numberStyle);
            setCellValue(excelRow, col++, dimensions.getWidth(), numberStyle);
            setCellValue(excelRow, col++, dimensions.getHeight(), numberStyle);

            if (NormAppliance.isPerSquareMeter(rowData.getNormAppliance())) {
                setCellValue(excelRow, col++, dimensions.getArea(), numberStyle);
            } else {
                setCellValue(excelRow, col++, dimensions.getCubic(), numberStyle);
            }

            setCellValue(excelRow, col++, rowData.getType(), dataStyle);
            setCellValue(excelRow, col++, rowData.getSelectedBasedCost(), numberStyle);

            if (!adjustmentGroupCounts.isEmpty()) {
                for (Map.Entry<String, Integer> entry : adjustmentGroupCounts.entrySet()) {
                    String group = entry.getKey();
                    int count = entry.getValue();
                    int currentCount = 0;

                    if (rowData.getSelectedAdjustments() != null) {
                        for (Adjustment adjustment : rowData.getSelectedAdjustments()) {
                            if (adjustment.getAdjustmentGroup().equals(group)) {
                                setCellValue(excelRow, col++, adjustment.getAdjustmentCost(), numberStyle);
                                currentCount++;
                            }
                        }
                    }

                    for (int i = currentCount; i < count; i++) {
                        setCellValue(excelRow, col++, "-", dataStyle);
                    }
                }
            } else {
                setCellValue(excelRow, col++, "-", dataStyle);
            }

            setCellValue(excelRow, col++, rowData.getBasedCostWithAdjustments(), numberStyle);
            setCellValue(excelRow, col++, rowData.getTotalCommonAdjustments().getTotalValue(), numberStyle);
            setCellValue(excelRow, col++, rowData.getBuildingAppraisal(), numberStyle);
            setCellValue(excelRow, col++, rowData.getWearRate(), numberStyle);
            setCellValue(excelRow, col++, rowData.getBuildingAppraisalWithWear(), numberStyle);
            setCellValue(excelRow, col++, rowData.getInsuredValue(), numberStyle);
        }
    }

    private void addFooter(Sheet worksheet, CellStyle staticInfoStyle, CellStyle footerCellStyle) {
        int lastRow = worksheet.getLastRowNum() + 2;

        Row dateRow = worksheet.createRow(lastRow);
        Cell dateCell = dateRow.createCell(0);
        dateCell.setCellValue(LocalDate.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy г.")));
        dateCell.setCellStyle(staticInfoStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow, lastRow, 0, 1));

        Row ownerSignatureRow = worksheet.createRow(lastRow + 2);
        Cell ownerSignatureCell = ownerSignatureRow.createCell(0);
        ownerSignatureCell.setCellValue("Собственник строений или уполномоченное им лицо");
        ownerSignatureCell.setCellStyle(staticInfoStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow + 2, lastRow + 2, 0, 3));

        Row ownerLineRow = worksheet.createRow(lastRow + 3);
        Cell signatureLineCell = ownerLineRow.createCell(9);
        signatureLineCell.setCellValue("(подпись)");
        signatureLineCell.setCellStyle(footerCellStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow + 3, lastRow + 3, 9, 11));

        Cell ownerNameLineCell = ownerLineRow.createCell(15);
        ownerNameLineCell.setCellValue("(Ф.И.О)");
        ownerNameLineCell.setCellStyle(footerCellStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow + 3, lastRow + 3, 15, 17));

        Row appraiserSignatureRow = worksheet.createRow(lastRow + 5);
        Cell appraiserSignatureCell = appraiserSignatureRow.createCell(0);
        appraiserSignatureCell.setCellValue("Оценку произвел (уточнил)");
        appraiserSignatureCell.setCellStyle(staticInfoStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow + 5, lastRow + 5, 0, 3));

        Row appraiserLineRow = worksheet.createRow(lastRow + 6);
        Cell appraiserSignatureLineCell = appraiserLineRow.createCell(9);
        appraiserSignatureLineCell.setCellValue("(подпись)");
        appraiserSignatureLineCell.setCellStyle(footerCellStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow + 6, lastRow + 6, 9, 11));

        Cell appraiserNameLineCell = appraiserLineRow.createCell(15);
        appraiserNameLineCell.setCellValue("(Ф.И.О.)");
        appraiserNameLineCell.setCellStyle(footerCellStyle);
        worksheet.addMergedRegion(new CellRangeAddress(lastRow + 6, lastRow + 6, 15, 17));
    }

    private void setCellValue(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value instanceof Number number) {
            cell.setCellValue(number.doubleValue());
        } else {
            cell.setCellValue(value == null ? "" : value.toString());
        }
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        applyBorders(style);
        return style;
    }

    private CellStyle createSubHeaderStyle(Workbook workbook) {
        CellStyle style = createHeaderStyle(workbook);
        style.setRotation((short) 90);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        applyBorders(style);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook, CellStyle baseStyle) {
        CellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(baseStyle);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.00"));
        return style;
    }

    private CellStyle createStaticInfoStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createFooterCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        return style;
    }

    private void applyBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setFillPattern(FillPatternType.NO_FILL);
    }
}
