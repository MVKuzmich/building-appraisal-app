import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Box,
  Grid,
  Checkbox
} from '@mui/material';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import { DEFAULT_COMMON_ADJUSTMENTS } from '../../data/commonAdjustments';
import {
  calculateAppraisal,
  buildCommonAdjustmentsSummary,
  findTierCost,
  formatTierLabel,
  getMeasurementValue,
  normalizeNormAppliance,
  recalculateDimensions,
} from '../../utils/appraisalCalculations';

const BuildingTypeModal = ({
  open,
  onClose,
  buildingType,
  onAddToEstimation,
  setBuildingTypes,
  editData = null,
  commonAdjustmentsData = DEFAULT_COMMON_ADJUSTMENTS,
}) => {
  const [selectedBasedCost, setSelectedBasedCost] = useState('');
  const [selectedAdjustments, setSelectedAdjustments] = useState([]);
  const [wearRate, setWearRate] = useState(0);
  const [buildingYear, setBuildingYear] = useState('');
  const [buildingDimensions, setBuildingDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
    cubic: 0,
    area: 0,
  });
  const [adjustmentQuantities, setAdjustmentQuantities] = useState({});
  const [totalCommonAdjustments, setTotalCommonAdjustments] = useState({ totalValue: 0, commonAdjustmentsList: [] });

  const isEditMode = editData !== null;
  const normalizedNormAppliance = normalizeNormAppliance(buildingType?.normAppliance);

  const resetForm = useCallback(() => {
    setSelectedBasedCost('');
    setSelectedAdjustments([]);
    setWearRate(0);
    setBuildingYear('');
    setBuildingDimensions({ length: 0, width: 0, height: 0, cubic: 0, area: 0 });
    setAdjustmentQuantities({});
    setTotalCommonAdjustments({ totalValue: 0, commonAdjustmentsList: [] });
  }, []);

  const loadEditData = useCallback((data) => {
    setSelectedBasedCost(String(data.selectedBasedCost || ''));
    setSelectedAdjustments(data.selectedAdjustments || []);
    setWearRate(data.wearRate || 0);
    setBuildingYear(data.buildingYear || '');
    setBuildingDimensions(data.dimensions || { length: 0, width: 0, height: 0, cubic: 0, area: 0 });
    setAdjustmentQuantities(data.adjustmentQuantities || {});
    setTotalCommonAdjustments(data.totalCommonAdjustments || { totalValue: 0, commonAdjustmentsList: [] });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && editData) {
      loadEditData(editData);
      return;
    }

    resetForm();
  }, [open, buildingType, isEditMode, editData, loadEditData, resetForm]);

  useEffect(() => {
    if (!open || !buildingType?.volumeBasedCosts || isEditMode) {
      return;
    }

    const measurementValue = getMeasurementValue(normalizedNormAppliance, buildingDimensions);
    const tierCost = findTierCost(buildingType.volumeBasedCosts, measurementValue);
    if (tierCost != null) {
      setSelectedBasedCost(String(tierCost));
    }
  }, [open, buildingType, buildingDimensions, normalizedNormAppliance, isEditMode]);

  const appraisalResult = useMemo(() => calculateAppraisal({
    normAppliance: normalizedNormAppliance,
    selectedBasedCost,
    selectedAdjustments,
    dimensions: buildingDimensions,
    totalCommonAdjustments: totalCommonAdjustments.totalValue || 0,
    wearRate,
  }), [
    normalizedNormAppliance,
    selectedBasedCost,
    selectedAdjustments,
    buildingDimensions,
    totalCommonAdjustments.totalValue,
    wearRate,
  ]);

  const handleClose = useCallback((event, reason) => {
    if (reason !== 'backdropClick') {
      onClose();
      resetForm();
    }
  }, [onClose, resetForm]);

  const handleAddToEstimation = useCallback(() => {
    const estimationData = {
      normAppliance: normalizedNormAppliance,
      buildingName: buildingType.estimationSheetData.name,
      buildingYear,
      buildingFoundation: buildingType.estimationSheetData.foundation,
      buildingWalls: buildingType.estimationSheetData.walls,
      buildingRoof: buildingType.estimationSheetData.roof,
      dimensions: buildingDimensions,
      type: buildingType.type,
      selectedBasedCost,
      selectedAdjustments,
      totalCommonAdjustments,
      basedCostWithAdjustments: appraisalResult.basedCostWithAdjustments,
      buildingAppraisal: appraisalResult.buildingAppraisal,
      wearRate,
      buildingAppraisalWithWear: appraisalResult.buildingAppraisalWithWear,
      insuredValue: appraisalResult.insuredValue,
      adjustmentQuantities,
    };

    onAddToEstimation(estimationData, isEditMode ? editData.orderedNumber : null);
    handleClose();
    setBuildingTypes([]);
  }, [
    normalizedNormAppliance,
    buildingType,
    buildingYear,
    buildingDimensions,
    selectedBasedCost,
    selectedAdjustments,
    totalCommonAdjustments,
    appraisalResult,
    wearRate,
    adjustmentQuantities,
    onAddToEstimation,
    handleClose,
    isEditMode,
    editData,
    setBuildingTypes,
  ]);

  const handleDimensionChange = useCallback((dimension, value) => {
    setBuildingDimensions((prev) => recalculateDimensions(prev, dimension, value));
  }, []);

  const updateCommonAdjustments = useCallback((quantities) => {
    setTotalCommonAdjustments(buildCommonAdjustmentsSummary(commonAdjustmentsData, quantities));
  }, [commonAdjustmentsData]);

  const handleCheckboxChange = useCallback((checked, adjustment) => {
    setAdjustmentQuantities((prev) => {
      const next = { ...prev };
      if (checked) {
        next[adjustment.element] = next[adjustment.element] || 0;
      } else {
        delete next[adjustment.element];
      }
      updateCommonAdjustments(next);
      return next;
    });
  }, [updateCommonAdjustments]);

  const handleCommonAdjustmentInputChange = useCallback((event, adjustment) => {
    const quantity = parseFloat(event.target.value) || 0;
    setAdjustmentQuantities((prev) => {
      const updated = { ...prev, [adjustment.element]: quantity };
      updateCommonAdjustments(updated);
      return updated;
    });
  }, [updateCommonAdjustments]);

  const toggleAdjustment = useCallback((adjustment, checked) => {
    setSelectedAdjustments((prev) => {
      if (checked) {
        return [...prev, adjustment];
      }
      return prev.filter((item) => !(
        item.adjustmentElement[0] === adjustment.adjustmentElement[0]
        && item.adjustmentCost === adjustment.adjustmentCost
      ));
    });
  }, []);

  if (!buildingType) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <ErrorBoundary>
        <DialogTitle>
          {isEditMode ? 'Редактирование: ' : ''}{buildingType.type}. {buildingType.name}
        </DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="body1" paragraph>
              <strong>Описание:</strong> {buildingType.description}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Год постройки"
                  value={buildingYear}
                  onChange={(e) => setBuildingYear(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Процент износа"
                  type="number"
                  value={wearRate}
                  onChange={(e) => setWearRate(parseFloat(e.target.value) || 0)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Длина строения"
                  type="number"
                  value={buildingDimensions.length || ''}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Ширина строения"
                  type="number"
                  value={buildingDimensions.width || ''}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Высота строения"
                  type="number"
                  value={buildingDimensions.height || ''}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Объем строения"
                  type="number"
                  value={buildingDimensions.cubic || ''}
                  onChange={(e) => handleDimensionChange('cubic', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Площадь строения"
                  type="number"
                  value={buildingDimensions.area || ''}
                  onChange={(e) => handleDimensionChange('area', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <FormControl component="fieldset" fullWidth margin="normal">
              <FormLabel component="legend">{`Базовая стоимость (${buildingType.basedCostsDependency})`}</FormLabel>
              <RadioGroup
                value={selectedBasedCost}
                onChange={(e) => setSelectedBasedCost(e.target.value)}
              >
                {buildingType.volumeBasedCosts.map((basedCost, index) => (
                  <FormControlLabel
                    key={`${basedCost.volumeFrom}-${basedCost.cost}-${index}`}
                    value={String(basedCost.cost)}
                    control={<Radio />}
                    label={formatTierLabel(basedCost)}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                Надбавки и скидки
              </FormLabel>
              {buildingType.adjustments?.length ? (
                buildingType.adjustments.map((adjustment, index) => {
                  const isSelected = selectedAdjustments.some((item) => (
                    item.adjustmentElement[0] === adjustment.adjustmentElement[0]
                    && item.adjustmentCost === adjustment.adjustmentCost
                  ));

                  return (
                    <FormControlLabel
                      key={`${adjustment.adjustmentElement[0]}-${index}`}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => toggleAdjustment(adjustment, e.target.checked)}
                        />
                      }
                      label={`${adjustment.adjustmentElement[0]} (${adjustment.adjustmentCost > 0 ? '+' : ''}${adjustment.adjustmentCost} руб.)`}
                    />
                  );
                })
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  Надбавки и скидки не установлены для данного типа строения
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                Общие надбавки
              </FormLabel>
              {commonAdjustmentsData.map((adjustment) => (
                <Box key={adjustment.element} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Object.prototype.hasOwnProperty.call(adjustmentQuantities, adjustment.element)}
                        onChange={(e) => handleCheckboxChange(e.target.checked, adjustment)}
                      />
                    }
                    label={`${adjustment.element} (${adjustment.unit}) — ${adjustment.cost} руб.`}
                    sx={{ flex: 1 }}
                  />
                  {Object.prototype.hasOwnProperty.call(adjustmentQuantities, adjustment.element) && (
                    <TextField
                      type="number"
                      value={adjustmentQuantities[adjustment.element] || ''}
                      onChange={(e) => handleCommonAdjustmentInputChange(e, adjustment)}
                      placeholder="Кол-во"
                      size="small"
                      sx={{ width: 100 }}
                    />
                  )}
                </Box>
              ))}
            </FormControl>

            <TextField
              fullWidth
              label="Сумма общих надбавок"
              type="number"
              value={totalCommonAdjustments.totalValue || ''}
              margin="normal"
              InputProps={{ readOnly: true }}
            />

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Норма с учетом отклонений"
                  value={appraisalResult.basedCostWithAdjustments}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Оценка строения"
                  value={appraisalResult.buildingAppraisal}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Оценка с учетом износа"
                  value={appraisalResult.buildingAppraisalWithWear}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Страховая сумма"
                  value={appraisalResult.insuredValue}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ЗАКРЫТЬ</Button>
          <Button onClick={handleAddToEstimation} color="primary" disabled={!selectedBasedCost}>
            {isEditMode ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : 'ДОБАВИТЬ В ОЦЕНОЧНЫЙ ЛИСТ'}
          </Button>
        </DialogActions>
      </ErrorBoundary>
    </Dialog>
  );
};

export default BuildingTypeModal;
