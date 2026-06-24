import {
  calculateAppraisal,
  calculateBasedCostWithAdjustments,
  findTierCost,
  normalizeNormAppliance,
  NORM_APPLIANCE,
} from './appraisalCalculations';

describe('appraisalCalculations', () => {
  test('normalizes legacy normAppliance values', () => {
    expect(normalizeNormAppliance('на 1 кв.м')).toBe(NORM_APPLIANCE.PER_SQUARE_METER);
    expect(normalizeNormAppliance('на одно сооружение')).toBe(NORM_APPLIANCE.PER_BUILDING);
  });

  test('calculates cubic meter appraisal with wear and insurance coefficient', () => {
    const result = calculateAppraisal({
      normAppliance: NORM_APPLIANCE.PER_CUBIC_METER,
      selectedBasedCost: 76,
      selectedAdjustments: [{ adjustmentCost: 2.1 }],
      dimensions: { length: 0, width: 0, height: 0, cubic: 100, area: 0 },
      totalCommonAdjustments: 0,
      wearRate: 10,
    });

    expect(calculateBasedCostWithAdjustments(76, [{ adjustmentCost: 2.1 }])).toBe(78.1);
    expect(result.buildingAppraisal).toBe(7810);
    expect(result.buildingAppraisalWithWear).toBe(7029);
    expect(result.insuredValue).toBe(3514.5);
  });

  test('finds tier by numeric range using [from, to) semantics', () => {
    const tiers = [
      { volumeFrom: 0, volumeTo: 4, cost: 1200 },
      { volumeFrom: 4, volumeTo: 5, cost: 1420 },
      { volumeFrom: 5, volumeTo: 9999, cost: 1640 },
    ];

    expect(findTierCost(tiers, 3)).toBe(1200);
    expect(findTierCost(tiers, 4)).toBe(1420);
    expect(findTierCost(tiers, 5)).toBe(1640);
  });
});
