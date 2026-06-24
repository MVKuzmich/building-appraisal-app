export const getAdjustmentGroupCounts = (data) => {
  const adjustmentGroupCounts = {};

  data.forEach((item) => {
    if (!item.selectedAdjustments?.length) {
      return;
    }

    const groupCounts = {};
    item.selectedAdjustments.forEach((adjustment) => {
      groupCounts[adjustment.adjustmentGroup] = (groupCounts[adjustment.adjustmentGroup] || 0) + 1;
      adjustmentGroupCounts[adjustment.adjustmentGroup] = Math.max(
        adjustmentGroupCounts[adjustment.adjustmentGroup] || 0,
        groupCounts[adjustment.adjustmentGroup]
      );
    });
  });

  return adjustmentGroupCounts;
};

export const getAdjustmentColumnCount = (data) => {
  const count = Object.values(getAdjustmentGroupCounts(data))
    .reduce((sum, value) => sum + value, 0);
  return count === 0 ? 1 : count;
};

export const buildAdjustmentGridColumns = (data) => {
  const adjustmentGroupCounts = getAdjustmentGroupCounts(data);
  const hasAdjustments = Object.keys(adjustmentGroupCounts).length > 0;

  if (!hasAdjustments) {
    return [{
      headerName: 'Надбавки',
      field: 'noAdjustments',
      headerClass: 'vertical-header',
      valueGetter: () => '-',
    }];
  }

  const columns = [];
  Object.entries(adjustmentGroupCounts).forEach(([group, count]) => {
    for (let index = 0; index < count; index += 1) {
      columns.push({
        headerName: group,
        field: `adjustments.${group}.${index}`,
        headerClass: 'vertical-header',
        valueGetter: (params) => {
          const adjustments = params.data.selectedAdjustments?.filter(
            (adjustment) => adjustment.adjustmentGroup === group
          ) || [];
          return adjustments[index] ? adjustments[index].adjustmentCost : '-';
        },
      });
    }
  });

  return columns;
};
