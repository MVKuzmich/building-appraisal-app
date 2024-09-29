package com.kuzmich.buildingsappraisal.service;


import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.aspose.cells.BorderType;
import com.aspose.cells.Cell;
import com.aspose.cells.CellBorderType;
import com.aspose.cells.Color;
import com.aspose.cells.PageOrientationType;
import com.aspose.cells.PageSetup;
import com.aspose.cells.PaperSizeType;
import com.aspose.cells.SaveFormat;
import com.aspose.cells.Style;
import com.aspose.cells.TextAlignmentType;
import com.aspose.cells.Workbook;
import com.aspose.cells.Worksheet;
import com.kuzmich.buildingsappraisal.dto.Dimensions;
import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.model.Adjustment;

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
        log.info("Создание Excel таблицы");
        Workbook workbook = new Workbook();
        Worksheet worksheet = workbook.getWorksheets().get(0);
        PageSetup pageSetup = worksheet.getPageSetup();

        // Set orientation to landscape
        pageSetup.setOrientation(PageOrientationType.LANDSCAPE);

        // Set paper size to A4
        pageSetup.setPaperSize(PaperSizeType.PAPER_A_4); 
        
        pageSetup.setFitToPagesWide(1);
        pageSetup.setFitToPagesTall(1);


        Style headerStyle = createHeaderStyle(workbook);
        Style subHeaderStyle = createSubHeaderStyle(workbook);
        Style dataStyle = createDataStyle(workbook);
        Style staticInfoStyle = createStaticInfoStyle(workbook);
        Style footerCellStyle = createFooterCellStyle(workbook);

        addStaticInfo(worksheet, staticInfoStyle);
        addHeaders(worksheet, headerStyle, subHeaderStyle, data);
        addData(worksheet, dataStyle, data);
        addFooter(worksheet, staticInfoStyle, footerCellStyle);

        worksheet.autoFitColumns();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.save(outputStream, SaveFormat.XLSX);
        return outputStream.toByteArray();
    }

    private void addStaticInfo(Worksheet worksheet, Style staticInfoStyle) {
        // Добавление заголовка
        
        addLabelAndInput(worksheet, 0, "Страховой оценочный листок №", staticInfoStyle, 1, "(номер)");
        
        
        // Добавление информации о страхователе
        addLabelAndInput(worksheet, 1, "Страхователь-собственник(и) строений:", staticInfoStyle, 12, "(страхователь)");

        // Добавление адреса
        addLabelAndInput(worksheet, 2, "Адрес строения:", staticInfoStyle, 12, "(адрес строения)");
    }

    private void addLabelAndInput(Worksheet worksheet, int row, String label, Style labelStyle, int inputCellCount, String placeholder) {
        Cell labelCell = worksheet.getCells().get(row, 0);
        labelCell.setValue(label);
        labelCell.setStyle(labelStyle);
        worksheet.getCells().merge(row, 0, 1, 4);

        worksheet.getCells().merge(row, 4, 1, inputCellCount);

        Cell placeholderCell = worksheet.getCells().get(row, 4);
        placeholderCell.setValue(placeholder);
    }


    private Style createHeaderStyle(Workbook workbook) {
        Style style = workbook.createStyle();
        style.getFont().setBold(true);
        style.setHorizontalAlignment(TextAlignmentType.CENTER);
        style.setVerticalAlignment(TextAlignmentType.CENTER);
        style.setTextWrapped(true);
        style.setBorder(BorderType.TOP_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.BOTTOM_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.LEFT_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.RIGHT_BORDER, CellBorderType.THIN, Color.getBlack());
        return style;
    }

    private Style createSubHeaderStyle(Workbook workbook) {
        Style style = workbook.createStyle();
        style.getFont().setBold(true);
        style.setHorizontalAlignment(TextAlignmentType.CENTER);
        style.setVerticalAlignment(TextAlignmentType.CENTER);
        style.setRotationAngle(90);
        style.setTextWrapped(true);
        style.setBorder(BorderType.TOP_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.BOTTOM_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.LEFT_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.RIGHT_BORDER, CellBorderType.THIN, Color.getBlack());
        return style;
    }

    private Style createDataStyle(Workbook workbook) {
        Style style = workbook.createStyle();
        style.setHorizontalAlignment(TextAlignmentType.CENTER);
        style.setVerticalAlignment(TextAlignmentType.CENTER);
        style.setTextWrapped(true);
        style.setBorder(BorderType.TOP_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.BOTTOM_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.LEFT_BORDER, CellBorderType.THIN, Color.getBlack());
        style.setBorder(BorderType.RIGHT_BORDER, CellBorderType.THIN, Color.getBlack());
        return style;
    }

    private Style createStaticInfoStyle(Workbook workbook) {
        Style style = workbook.createStyle();
        style.setHorizontalAlignment(TextAlignmentType.LEFT);
        style.setVerticalAlignment(TextAlignmentType.CENTER);
        style.setTextWrapped(true);
        style.getFont().setSize(10);
        style.getFont().setBold(true);
        return style;
    }

    private Style createFooterCellStyle(Workbook workbook) {
        Style style = workbook.createStyle();
        style.setBorder(BorderType.TOP_BORDER, CellBorderType.THIN, Color.getBlack());
        return style;
    }

    private void addHeaders(Worksheet worksheet, Style headerStyle, Style subHeaderStyle, List<EstimationSheetDto> data) {
        // Устанавливаем высоту строк заголовка
        worksheet.getCells().setRowHeight(4, 40); // Первая строка заголовка
        worksheet.getCells().setRowHeight(5, 80); // Вторая строка заголовка (подзаголовки)

        int col = 0;

        // Добавляем заголовки
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

        // Добавляем надбавки (если есть)
        addAdjustmentHeaders(worksheet, headerStyle, subHeaderStyle, data, col);
        col += getAdjustmentColumnCount(data);

        for (String header : REMAINING_HEADERS) {
            addSingleHeader(worksheet, subHeaderStyle, header, 4, col++, true);
        }

        // Настраиваем перенос текста для всех ячеек заголовка
        for (int i = 0; i < worksheet.getCells().getMaxColumn(); i++) {
            worksheet.getCells().get(4, i).getStyle().setTextWrapped(true);
            worksheet.getCells().get(5, i).getStyle().setTextWrapped(true);
        }
    }


    private void addSingleHeader(Worksheet worksheet, Style style, String text, int row, int col, boolean mergeVertically) {
        Cell cell = worksheet.getCells().get(row, col);
        cell.setValue(text);
        cell.setStyle(style);
        if (mergeVertically) {
            worksheet.getCells().merge(row, col, 2, 1); // Объединяем две строки по вертикали
        }
    }

    private void addAdjustmentHeaders(Worksheet worksheet, Style headerStyle, Style subHeaderStyle, List<EstimationSheetDto> data, int startCol) {
        Map<String, Integer> adjustmentGroupCounts = getAdjustmentGroupCounts(data);
    
        if (!adjustmentGroupCounts.isEmpty()) {
            int totalAdjustments = adjustmentGroupCounts.values().stream().mapToInt(Integer::intValue).sum();
            Cell groupCell = worksheet.getCells().get(4, startCol);
            groupCell.setValue("Надбавки");
            groupCell.setStyle(headerStyle);
            worksheet.getCells().merge(4, startCol, 1, totalAdjustments);
    
            int col = startCol;
            for (Map.Entry<String, Integer> entry : adjustmentGroupCounts.entrySet()) {
                String group = entry.getKey();
                int count = entry.getValue();
                for (int i = 0; i < count; i++) {
                    Cell subCell = worksheet.getCells().get(5, col);
                    subCell.setValue(group);
                    subCell.setStyle(subHeaderStyle);
                    col++;
                }
            }
        } else {
            addSingleHeader(worksheet, headerStyle, "Надбавки", 4, startCol, true);
            Cell subCell = worksheet.getCells().get(5, startCol);
            subCell.setValue("-");
            subCell.setStyle(subHeaderStyle);
        }
    }
    
    private Map<String, Integer> getAdjustmentGroupCounts(List<EstimationSheetDto> data) {
        Map<String, Integer> adjustmentGroupCounts = new LinkedHashMap<>();
        for (EstimationSheetDto dto : data) {
            if (dto.getSelectedAdjustments() != null) {
                List<Adjustment> adjustments = dto.getSelectedAdjustments();
                Map<String, Integer> adjustmentsToMap = 
                        adjustments.stream()
                            .map(Adjustment::getAdjustmentGroup)
                            .collect(Collectors.groupingBy(Function.identity(), Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
                for (Map.Entry<String, Integer> adj : adjustmentsToMap.entrySet()) {
                    if(adjustmentGroupCounts.containsKey(adj.getKey())) {
                        Integer adjCount = adjustmentGroupCounts.get(adj.getKey());
                        if(adj.getValue() > adjCount) {
                            adjustmentGroupCounts.put(adj.getKey(), adj.getValue());
                        }
                    } else {
                        adjustmentGroupCounts.put(adj.getKey(), adj.getValue());
                    } 
                    
                }
            }
        }
        return adjustmentGroupCounts;
    }
    
    private int getAdjustmentColumnCount(List<EstimationSheetDto> data) {
        return getAdjustmentGroupCounts(data).values().stream().mapToInt(Integer::intValue).sum();
    }
    
    private void addGroupHeader(Worksheet worksheet, Style headerStyle, Style subHeaderStyle, String groupName, int startCol, String[] subHeaders) {
        Cell groupCell = worksheet.getCells().get(4, startCol);
        groupCell.setValue(groupName);
        groupCell.setStyle(headerStyle);
        worksheet.getCells().merge(4, startCol, 1, subHeaders.length);
    
        for (int i = 0; i < subHeaders.length; i++) {
            Cell subCell = worksheet.getCells().get(5, startCol + i);
            subCell.setValue(subHeaders[i]);
            subCell.setStyle(subHeaderStyle);
            worksheet.getCells().setColumnWidth(startCol + i, 15); // Устанавливаем ширину столбца
        }
    }

    private void addData(Worksheet worksheet, Style dataStyle, List<EstimationSheetDto> data) {
        Map<String, Integer> adjustmentGroupCounts = getAdjustmentGroupCounts(data);

        Style numberStyle = worksheet.getWorkbook().createStyle();
        numberStyle.copy(dataStyle);
        numberStyle.setNumber(2); // Устанавливаем 2 десятичных знака

        for (int row = 0; row < data.size(); row++) {
            EstimationSheetDto rowData = data.get(row);
            int col = 0;

            setCellValue(worksheet, row + 6, col++, row + 1, dataStyle); // № п/п
            setCellValue(worksheet, row + 6, col++, rowData.getBuildingName(), dataStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getBuildingFoundation(), dataStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getBuildingWalls(), dataStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getBuildingRoof(), dataStyle);

            Dimensions dimensions = rowData.getDimensions();
            setCellValue(worksheet, row + 6, col++, dimensions.getLength(), numberStyle);
            setCellValue(worksheet, row + 6, col++, dimensions.getWidth(), numberStyle);
            setCellValue(worksheet, row + 6, col++, dimensions.getHeight(), numberStyle);

            if (rowData.getNormAppliance().equals("на 1 кв.м.")) {
                setCellValue(worksheet, row + 6, col++, dimensions.getArea(), numberStyle);
            } else {
                setCellValue(worksheet, row + 6, col++, dimensions.getCubic(), numberStyle);
            }

            setCellValue(worksheet, row + 6, col++, rowData.getType(), dataStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getSelectedBasedCost(), numberStyle);

            // Надбавки
            if (!adjustmentGroupCounts.isEmpty()) {
                for (Map.Entry<String, Integer> entry : adjustmentGroupCounts.entrySet()) {
                    String group = entry.getKey();
                    int count = entry.getValue();
                    int currentCount = 0;

                    if (rowData.getSelectedAdjustments() != null) {
                        for (Adjustment adjustment : rowData.getSelectedAdjustments()) {
                            if (adjustment.getAdjustmentGroup().equals(group)) {
                                setCellValue(worksheet, row + 6, col++, adjustment.getAdjustmentCost(), numberStyle);
                                currentCount++;
                            }
                        }
                    }

                    // Добавляем прочерки, если надбавок меньше, чем максимальное количество
                    for (int i = currentCount; i < count; i++) {
                        setCellValue(worksheet, row + 6, col++, "-", dataStyle);
                    }
                }
            } else {
                setCellValue(worksheet, row + 6, col++, "-", dataStyle);
            }

            setCellValue(worksheet, row + 6, col++, rowData.getBasedCostWithAdjustments(), numberStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getTotalCommonAdjustments().getTotalValue(), numberStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getBuildingAppraisal(), numberStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getWearRate(), numberStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getBuildingAppraisalWithWear(), numberStyle);
            setCellValue(worksheet, row + 6, col++, rowData.getInsuredValue(), numberStyle);
        }
    }

    private void setCellValue(Worksheet worksheet, int row, int col, Object value, Style style) {
        Cell cell = worksheet.getCells().get(row, col);
        cell.setValue(value);
        cell.setStyle(style);
    }

    private void addFooter(Worksheet worksheet, Style staticInfoStyle, Style footerCellStyle) {
        int lastRow = worksheet.getCells().getMaxDataRow() + 2;

        // Добавление даты
        Cell dateCell = worksheet.getCells().get(lastRow, 0);
        dateCell.setValue(LocalDate.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy г.")));
        dateCell.setStyle(staticInfoStyle);
        worksheet.getCells().merge(lastRow, 0, 1, 2);

        // Добавление подписи собственника
        Cell ownerSignatureCell = worksheet.getCells().get(lastRow + 2, 0);
        ownerSignatureCell.setValue("Собственник строений или уполномоченное им лицо");
        ownerSignatureCell.setStyle(staticInfoStyle);
        worksheet.getCells().merge(lastRow + 2, 0, 1, 4);

        Cell signatureLineCell = worksheet.getCells().get(lastRow + 3, 9);
        signatureLineCell.setValue("(подпись)");
        signatureLineCell.setStyle(staticInfoStyle);
        signatureLineCell.setStyle(footerCellStyle);
        worksheet.getCells().merge(lastRow + 3, 9, 1, 3);

        Cell ownerNameLineCell = worksheet.getCells().get(lastRow + 3, 15);
        ownerNameLineCell.setValue("(Ф.И.О)");
        ownerNameLineCell.setStyle(staticInfoStyle);
        ownerNameLineCell.setStyle(footerCellStyle);
        worksheet.getCells().merge(lastRow + 3, 15, 1, 3);
            

        // Добавление подписи оценщика
        Cell appraiserSignatureCell = worksheet.getCells().get(lastRow + 5, 0);
        appraiserSignatureCell.setValue("Оценку произвел (уточнил)");
        appraiserSignatureCell.setStyle(staticInfoStyle);
        worksheet.getCells().merge(lastRow + 5, 0, 1, 4);

        Cell appraiserSignatureLineCell = worksheet.getCells().get(lastRow + 6, 9);
        appraiserSignatureLineCell.setValue("(подпись)");
        appraiserSignatureLineCell.setStyle(staticInfoStyle);
        appraiserSignatureLineCell.setStyle(footerCellStyle);
        worksheet.getCells().merge(lastRow + 6, 9, 1, 3);

        Cell appraiserNameLineCell = worksheet.getCells().get(lastRow + 6, 15);
        appraiserNameLineCell.setValue("(Ф.И.О.)");
        appraiserNameLineCell.setStyle(staticInfoStyle);
        appraiserNameLineCell.setStyle(footerCellStyle);
        worksheet.getCells().merge(lastRow + 6, 15, 1, 3);
    }



    
}