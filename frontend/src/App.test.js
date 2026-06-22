import { normalizeNormAppliance, NORM_APPLIANCE } from './utils/appraisalCalculations';

test('application uses normalized norm appliance constants', () => {
  expect(normalizeNormAppliance('на 1 куб.м')).toBe(NORM_APPLIANCE.PER_CUBIC_METER);
  expect(normalizeNormAppliance('на 1 кв.м')).toBe(NORM_APPLIANCE.PER_SQUARE_METER);
});
