export const NORM_APPLIANCE = {
  PER_CUBIC_METER: 'на 1 куб.м.',
  PER_SQUARE_METER: 'на 1 кв.м.',
  PER_BUILDING: 'на одно строение',
};

export const INSURANCE_COEFFICIENT = 0.5;

export const normalizeNormAppliance = (value) => {
  if (!value) {
    return NORM_APPLIANCE.PER_BUILDING;
  }

  switch (value.trim()) {
    case 'на 1 куб.м.':
    case 'на 1 куб.м':
      return NORM_APPLIANCE.PER_CUBIC_METER;
    case 'на 1 кв.м.':
    case 'на 1 кв.м':
      return NORM_APPLIANCE.PER_SQUARE_METER;
    case 'на одно строение':
    case 'на одно сооружение':
      return NORM_APPLIANCE.PER_BUILDING;
    default:
      return value.trim();
  }
};

export const isNumericRange = (tier) => /^\d+(\.\d+)?$/.test(String(tier.volumeFrom))
  && /^\d+(\.\d+)?$/.test(String(tier.volumeTo));

export const findTierCost = (tiers, measurementValue) => {
  if (!tiers?.length || !measurementValue || measurementValue <= 0) {
    return null;
  }

  for (const tier of tiers) {
    if (!isNumericRange(tier)) {
      continue;
    }

    const from = Number(tier.volumeFrom);
    const to = Number(tier.volumeTo);
    if (measurementValue >= from && measurementValue < to) {
      return tier.cost;
    }
  }

  return null;
};

export const getMeasurementValue = (normAppliance, dimensions) => {
  const normalized = normalizeNormAppliance(normAppliance);
  if (normalized === NORM_APPLIANCE.PER_SQUARE_METER) {
    return dimensions.area || 0;
  }
  if (normalized === NORM_APPLIANCE.PER_CUBIC_METER) {
    return dimensions.cubic || 0;
  }
  return dimensions.cubic || dimensions.area || 0;
};

export const calculateBasedCostWithAdjustments = (selectedBasedCost, selectedAdjustments = []) => {
  if (!selectedBasedCost) {
    return 0;
  }

  let result = Number(selectedBasedCost);
  if (selectedAdjustments.length > 0) {
    result += selectedAdjustments.reduce((sum, adjustment) => sum + adjustment.adjustmentCost, 0);
  }
  return result;
};

export const calculateTotalBasedCost = (normAppliance, basedCostWithAdjustments, dimensions) => {
  const normalized = normalizeNormAppliance(normAppliance);
  if (normalized === NORM_APPLIANCE.PER_CUBIC_METER) {
    return basedCostWithAdjustments * (dimensions.cubic || 0);
  }
  if (normalized === NORM_APPLIANCE.PER_SQUARE_METER) {
    return basedCostWithAdjustments * (dimensions.area || 0);
  }
  return basedCostWithAdjustments;
};

export const calculateCommonAdjustmentsTotal = (commonAdjustmentsData, adjustmentQuantities = {}) =>
  commonAdjustmentsData.reduce((sum, adjustment) => {
    const quantity = adjustmentQuantities[adjustment.element] || 0;
    return sum + quantity * adjustment.cost;
  }, 0);

export const buildCommonAdjustmentsSummary = (commonAdjustmentsData, adjustmentQuantities = {}) => {
  const totalValue = round(calculateCommonAdjustmentsTotal(commonAdjustmentsData, adjustmentQuantities));
  const commonAdjustmentsList = Object.entries(adjustmentQuantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([element, quantity]) => ({ element, quantity }));

  return { totalValue, commonAdjustmentsList };
};

export const calculateAppraisal = ({
  normAppliance,
  selectedBasedCost,
  selectedAdjustments = [],
  dimensions,
  totalCommonAdjustments = 0,
  wearRate = 0,
}) => {
  const basedCostWithAdjustments = calculateBasedCostWithAdjustments(selectedBasedCost, selectedAdjustments);
  const totalBasedCost = calculateTotalBasedCost(normAppliance, basedCostWithAdjustments, dimensions);
  const buildingAppraisal = round(totalBasedCost + (totalCommonAdjustments || 0));
  const buildingAppraisalWithWear = round(buildingAppraisal * (1 - wearRate / 100));
  const insuredValue = round(buildingAppraisalWithWear * INSURANCE_COEFFICIENT);

  return {
    basedCostWithAdjustments,
    buildingAppraisal,
    buildingAppraisalWithWear,
    insuredValue,
  };
};

export const recalculateDimensions = (dimensions, dimension, value) => {
  const numValue = parseFloat(value) || 0;
  const newDimensions = { ...dimensions, [dimension]: numValue };

  if (dimension === 'cubic' || dimension === 'area') {
    newDimensions.length = 0;
    newDimensions.width = 0;
    newDimensions.height = 0;
  } else {
    newDimensions.cubic = round((newDimensions.length || 0) * (newDimensions.width || 0) * (newDimensions.height || 0));
    newDimensions.area = round((newDimensions.length || 0) * (newDimensions.width || 0));
  }

  return newDimensions;
};

const round = (value) => Math.round(value * 100) / 100;

export const formatTierLabel = (tier) => (
  isNumericRange(tier)
    ? `от ${tier.volumeFrom} до ${tier.volumeTo}: ${tier.cost} руб.`
    : `${tier.volumeFrom}: ${tier.cost} руб.`
);
