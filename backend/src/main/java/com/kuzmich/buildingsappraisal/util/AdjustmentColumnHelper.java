package com.kuzmich.buildingsappraisal.util;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.kuzmich.buildingsappraisal.dto.EstimationSheetDto;
import com.kuzmich.buildingsappraisal.model.Adjustment;

public final class AdjustmentColumnHelper {

    private AdjustmentColumnHelper() {
    }

    public static Map<String, Integer> getAdjustmentGroupCounts(List<EstimationSheetDto> data) {
        Map<String, Integer> adjustmentGroupCounts = new LinkedHashMap<>();
        for (EstimationSheetDto dto : data) {
            if (dto.getSelectedAdjustments() == null) {
                continue;
            }
            Map<String, Integer> rowCounts = dto.getSelectedAdjustments().stream()
                    .map(Adjustment::getAdjustmentGroup)
                    .collect(Collectors.groupingBy(Function.identity(),
                            Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));

            for (Map.Entry<String, Integer> entry : rowCounts.entrySet()) {
                adjustmentGroupCounts.merge(entry.getKey(), entry.getValue(), Math::max);
            }
        }
        return adjustmentGroupCounts;
    }

    public static int getAdjustmentColumnCount(List<EstimationSheetDto> data) {
        int count = getAdjustmentGroupCounts(data).values().stream().mapToInt(Integer::intValue).sum();
        return count == 0 ? 1 : count;
    }
}
