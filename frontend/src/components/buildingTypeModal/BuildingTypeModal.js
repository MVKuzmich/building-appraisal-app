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
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

const formatMoney = (value) => Number(value || 0).toLocaleString('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BuildingTypeModal = ({
  open,
  onClose,
  buildingType,
  onAddToEstimation,
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
  const [expandedPanels, setExpandedPanels] = useState({
    description: false,
    dimensions: true,
    baseCost: false,
    adjustments: false,
    commonAdjustments: false,
  });

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
    setExpandedPanels({
      description: false,
      dimensions: true,
      baseCost: false,
      adjustments: false,
      commonAdjustments: false,
    });
  }, []);

  const loadEditData = useCallback((data) => {
    setSelectedBasedCost(String(data.selectedBasedCost || ''));
    setSelectedAdjustments(data.selectedAdjustments || []);
    setWearRate(data.wearRate || 0);
    setBuildingYear(data.buildingYear || '');
    setBuildingDimensions(data.dimensions || { length: 0, width: 0, height: 0, cubic: 0, area: 0 });
    setAdjustmentQuantities(data.adjustmentQuantities || {});
    setTotalCommonAdjustments(data.totalCommonAdjustments || { totalValue: 0, commonAdjustmentsList: [] });
    setExpandedPanels({
      description: false,
      dimensions: true,
      baseCost: true,
      adjustments: Boolean(data.selectedAdjustments?.length),
      commonAdjustments: Boolean(data.totalCommonAdjustments?.totalValue),
    });
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
      setExpandedPanels((prev) => ({ ...prev, baseCost: true }));
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

  const wearRateError = wearRate < 0 || wearRate > 100;

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

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  if (!buildingType) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { maxHeight: '92vh' } }}
    >
      <ErrorBoundary>
        <DialogTitle sx={{ pb: 1 }}>
          {isEditMode ? 'Редактирование: ' : ''}{buildingType.type}. {buildingType.name}
        </DialogTitle>

        <DialogContent dividers sx={{ pb: 0 }}>
          <Accordion
            disableGutters
            elevation={0}
            expanded={expandedPanels.description}
            onChange={handleAccordionChange('description')}
            sx={{ '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Описание типа</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {buildingType.description}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanels.dimensions}
            onChange={handleAccordionChange('dimensions')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>1. Размеры и износ</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                Введите длину, ширину и высоту — объём и площадь рассчитаются автоматически.
                Либо укажите объём/площадь напрямую.
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Год постройки"
                    value={buildingYear}
                    onChange={(e) => setBuildingYear(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Процент износа"
                    type="number"
                    value={wearRate}
                    error={wearRateError}
                    helperText={wearRateError ? 'Износ должен быть от 0 до 100%' : ' '}
                    onChange={(e) => setWearRate(parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Длина, м"
                    type="number"
                    value={buildingDimensions.length || ''}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Ширина, м"
                    type="number"
                    value={buildingDimensions.width || ''}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Высота, м"
                    type="number"
                    value={buildingDimensions.height || ''}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Объём, куб.м"
                    type="number"
                    value={buildingDimensions.cubic || ''}
                    onChange={(e) => handleDimensionChange('cubic', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Площадь, кв.м"
                    type="number"
                    value={buildingDimensions.area || ''}
                    onChange={(e) => handleDimensionChange('area', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanels.baseCost}
            onChange={handleAccordionChange('baseCost')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>2. Базовая норма ({buildingType.basedCostsDependency})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component="fieldset" fullWidth>
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
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanels.adjustments}
            onChange={handleAccordionChange('adjustments')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>3. Надбавки и скидки типа</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Надбавки и скидки не установлены для данного типа строения
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanels.commonAdjustments}
            onChange={handleAccordionChange('commonAdjustments')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>4. Общие надбавки</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
              <TextField
                fullWidth
                label="Сумма общих надбавок"
                value={totalCommonAdjustments.totalValue || ''}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions
          sx={{
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 2,
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              divider={<Box sx={{ display: { xs: 'none', sm: 'block' }, width: 1, bgcolor: 'divider' }} />}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">Оценка строения</Typography>
                <Typography variant="h6">{formatMoney(appraisalResult.buildingAppraisal)} руб.</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">С учётом износа</Typography>
                <Typography variant="h6">{formatMoney(appraisalResult.buildingAppraisalWithWear)} руб.</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Страховая сумма</Typography>
                <Typography variant="h6" color="primary.main">{formatMoney(appraisalResult.insuredValue)} руб.</Typography>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleClose}>Отмена</Button>
            <Button
              onClick={handleAddToEstimation}
              variant="contained"
              disabled={!selectedBasedCost || wearRateError}
            >
              {isEditMode ? 'Сохранить изменения' : 'Добавить в лист'}
            </Button>
          </Box>
        </DialogActions>
      </ErrorBoundary>
    </Dialog>
  );
};

export default BuildingTypeModal;
