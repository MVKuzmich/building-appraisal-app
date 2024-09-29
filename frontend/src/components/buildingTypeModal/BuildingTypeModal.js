import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Select,
  MenuItem,
  InputLabel,
  Box,
  Tabs,
  Tab,
  Grid,
  Checkbox
} from '@mui/material';

const BuildingTypeModal = ({ open, onClose, buildingType, onAddToEstimation, setBuildingTypes }) => {
  const [selectedBasedCost, setSelectedBasedCost] = useState(0);
  const [selectedAdjustments, setSelectedAdjustments] = useState([]);
  const [wearRate, setWearRate] = useState(0);
  const [buildingYear, setBuildingYear] = useState(0);
  const [buildingDimensions, setBuildingDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
    cubic: 0,
    area: 0
  });
  const [adjustmentQuantities, setAdjustmentQuantities] = useState({});
  const [totalCommonAdjustments, setTotalCommonAdjustments] = useState({});

  const [activeTab, setActiveTab] = useState(0);

  const inputRefs = useRef({});

  const commonAdjustmentsData = [
    { element: 'Устройство теплых полов с теплоизоляцией', cost: 28.4, unit: '1 кв.м пола' },
    { element: 'Устройство роллет оконных (дверных)', cost: 134.5, unit: '1 кв.м окна' },
    { element: 'Утепление стен или цоколя', cost: 9.0, unit: '1 кв.м стен' },
    { element: 'Утепление кровли', cost: 9.8, unit: '1 кв.м кровли' },
    { element: 'Отопление печное (один источник отопления)', cost: 594.0, unit: 'печь или очаг' },
    { element: 'Строение оборудовано камином', cost: 378.0, unit: 'камин' },
    { element: 'Отопление водяное от котла отопительного водогрейного', cost: 4.5, unit: '1 куб.м. строения' },
    { element: 'Водоснабжение и канализация', cost: 1.4, unit: '1 куб.м. строения' },
    { element: 'Строение оборудовано электрической плитой', cost: 410.0, unit: 'комплект' },
    { element: 'Строение оборудовано газовой плитой', cost: 313.0, unit: 'комплект' },
    { element: 'Строение оборудовано газовой плитой с газовым баллоном', cost: 357.0, unit: 'комплект' },
    { element: 'Строение оборудовано водонагревательным устройством', cost: 177.0, unit: 'комплект' },
  ];

  useEffect(() => {
    if (open) {
      const firstInput = Object.values(inputRefs.current)[0];
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, buildingType]);
  
  
  const getBasedCostWithAdjustments = useCallback(() => {
    console.log(`cost with adjustment`);
    if(selectedBasedCost) {
      let result = parseInt(selectedBasedCost);
      if(selectedAdjustments.length > 0) {
        const sum = selectedAdjustments.map(adj => adj.adjustmentCost).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        result += sum;
      }
      return result;
    }
    return 0;
  }, [selectedBasedCost, selectedAdjustments]);
  
  const basedCostWithAdjustments = useMemo(() => getBasedCostWithAdjustments(), [getBasedCostWithAdjustments]);
    
  const getTotalBasedCost = useCallback((normAppliance) => {
    const {cubic, area} = buildingDimensions;
    console.log(`count total based cost`);
    let totalBasedCost;
    switch (normAppliance) {
      case 'на 1 куб.м.':
        totalBasedCost = basedCostWithAdjustments * cubic;
        break;
      case 'на 1 кв.м.':
        totalBasedCost = basedCostWithAdjustments * area;
        break;
      default:
        totalBasedCost = basedCostWithAdjustments;
    }
    return totalBasedCost;
  }, [buildingDimensions, basedCostWithAdjustments]);

  const buildingAppraisal = useMemo(() => {
    return parseFloat(getTotalBasedCost(buildingType.normAppliance).toFixed(2)) + parseFloat(totalCommonAdjustments?.totalValue || 0);
  }, [getTotalBasedCost, buildingType.normAppliance, totalCommonAdjustments]);

  const buildingAppraisalWithWear = useMemo(() => {
    return parseFloat((buildingAppraisal * (1 - wearRate / 100)).toFixed(2));
  }, [buildingAppraisal, wearRate]);

  const insuredValue = useMemo(() => {
    return parseFloat((buildingAppraisalWithWear * 0.5).toFixed(2));
  }, [buildingAppraisalWithWear]);

  
  

  const resetForm = useCallback(() => {
    setSelectedBasedCost(0);
    setSelectedAdjustments([]);
    setWearRate(0);
    setBuildingYear(0);
    setBuildingDimensions({
      length: 0,
      width: 0,
      height: 0,
      cubic: 0,
      area: 0
    });
    setAdjustmentQuantities({});
    setTotalCommonAdjustments({});
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason !== 'backdropClick') {
      onClose();
      resetForm();
    }
  }, [onClose, resetForm]);



  const handleAddToEstimation = useCallback(() => {
    const estimationData = {
      normAppliance: buildingType.normAppliance,
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
      basedCostWithAdjustments,
      buildingAppraisal: parseFloat(buildingAppraisal.toFixed(2)),
      wearRate,
      buildingAppraisalWithWear: parseFloat(buildingAppraisalWithWear.toFixed(2)),
      insuredValue
    };
    onAddToEstimation(estimationData);
    handleClose();
    setBuildingTypes([]);

  }, [buildingType.estimationSheetData.name, buildingType.estimationSheetData.foundation, buildingType.estimationSheetData.walls, buildingType.estimationSheetData.roof, buildingType.type, buildingYear, buildingDimensions, selectedBasedCost, selectedAdjustments, totalCommonAdjustments, basedCostWithAdjustments, buildingAppraisal, buildingAppraisalWithWear, onAddToEstimation, handleClose]);

  const handleDimensionChange = useCallback((dimension, value) => {
    const numValue = parseFloat(value) || 0;
    setBuildingDimensions(prev => {
      const newDimensions = { ...prev, [dimension]: numValue };
      
      if (dimension === 'cubic' || dimension === 'area') {
        newDimensions.length = 0;
        newDimensions.width = 0;
        newDimensions.height = 0;
      } else {
        newDimensions.cubic = parseFloat((newDimensions.length * newDimensions.width * newDimensions.height).toFixed(2));
        newDimensions.area = parseFloat((newDimensions.length * newDimensions.width).toFixed(2));
      }
      
      return newDimensions;
    });
  }, []);
  


  const renderBaseCosts = useCallback(() => {
    if (open) {
      console.log(`render based costs ${buildingType.volumeBasedCosts}`);
      return (
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend">{`Базовая стоимость (${buildingType.basedCostsDependency})`}</FormLabel>
          <RadioGroup
            aria-label="base-cost"
            name="base-cost"
            value={selectedBasedCost}
            onChange={(e) => setSelectedBasedCost(e.target.value)}
          >
            {buildingType.volumeBasedCosts.map((basedCost, index) => {
              let label = (/^\d+$/.test(basedCost.volumeFrom))
              ? `от ${basedCost.volumeFrom} до ${basedCost.volumeTo}: ${basedCost.cost} руб.`
              : `${basedCost.volumeFrom}: ${basedCost.cost} руб.`;

              return (
              <FormControlLabel
                key={index}
                value={basedCost.cost}
                control={<Radio />}
                label={label}
              />
              )} 
            )}
          </RadioGroup>
        </FormControl>
      );
    }
    return null;
  }, [open, buildingType.basedCostsDependency, buildingType.volumeBasedCosts, selectedBasedCost]);

  const renderAdjustments = useCallback(() => {
    if(open) {
      console.log(`render adjustments ${buildingType.adjustments}`)
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel>Надбавки</InputLabel>
          {(buildingType.adjustments && buildingType.adjustments.length > 0) ? (<Select
            multiple
            value={selectedAdjustments}
            onChange={(e) => setSelectedAdjustments(e.target.value)}
            renderValue={(selected) => selected.map(adj => adj.adjustmentElement[0]).join(', ')}
          >
            {buildingType.adjustments.map((adjustment, index) => (
              <MenuItem key={index} value={adjustment}>
                {adjustment.adjustmentElement[0]}: {adjustment.adjustmentCost} руб.
              </MenuItem>
            ))}
          </Select>
          ) : (
          <Select>
            <MenuItem>Надбавки и скидки не установлены</MenuItem>
          </Select>
        )}
        </FormControl>
      );
    }
  }, [open, buildingType.adjustments, selectedAdjustments]);
      
  const handleCheckboxChange = useCallback((checked, adjustment) => {
    setAdjustmentQuantities(prev => {
      const newQuantities = { ...prev };
      if (checked) {
        newQuantities[adjustment.element] = newQuantities[adjustment.element] || 0;
      } else {
        delete newQuantities[adjustment.element];
      }
      updateTotalCommonAdjustments(newQuantities);
      return newQuantities;
    });
  }, []);
  
  const handleInputChange = useCallback((e, adjustment) => {
    const quantity = parseFloat(e.target.value) || 0;
    setAdjustmentQuantities(prevQuantities => {
      const updatedQuantities = {
        ...prevQuantities,
        [adjustment.element]: quantity
      };
  
      const total = commonAdjustmentsData.reduce((sum, adj) => {
        const qty = updatedQuantities[adj.element] || 0;
        return sum + qty * adj.cost;
      }, 0).toFixed(2);
  
      const commonAdjustmentsList = Object.entries(updatedQuantities)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => ({ element: key, quantity: value }));
  
      setTotalCommonAdjustments({
        totalValue: parseFloat(total),
        commonAdjustmentsList
      });
  
      console.log(`Сумма общих надбавок: ${total}`);
      return updatedQuantities;
    });
  }, [commonAdjustmentsData]);
  
  const updateTotalCommonAdjustments = (quantities) => {
    const total = commonAdjustmentsData.reduce((sum, adj) => {
      const qty = quantities[adj.element] || 0;
      return sum + qty * adj.cost;
    }, 0).toFixed(2);
    const adjObj = Object.entries(quantities)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => ({ element: key, quantity: value }));
  
    setTotalCommonAdjustments({
      totalValue: parseFloat(total),
      commonAdjustmentsList: adjObj
  });
}

  const renderCommonAdjustments = useCallback(() => {
    return (
      <div>
        {commonAdjustmentsData.map((adjustment) => (
          <div key={adjustment.element} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={adjustmentQuantities.hasOwnProperty(adjustment.element)}
                  onChange={(e) => handleCheckboxChange(e.target.checked, adjustment)}
                />
              }
              label={`${adjustment.element} (${adjustment.unit})`}
            />
            {adjustmentQuantities.hasOwnProperty(adjustment.element) && (
              <>
                <TextField
                  type="number"
                  value={adjustmentQuantities[adjustment.element] || ''}
                  onChange={(e) => handleInputChange(e, adjustment)}
                  style={{ marginLeft: '10px', width: '80px' }}
                  placeholder="Количество"
                />
                <TextField
                  disabled
                  type="number"
                  value={adjustment.cost}
                  style={{ marginLeft: '10px', width: '80px' }}

                />
                <TextField
                  type="number"
                  value={(adjustmentQuantities[adjustment.element] * adjustment.cost).toFixed(2)}
                  style={{ marginLeft: '10px', width: '80px' }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    );
  }, [adjustmentQuantities, handleCheckboxChange, handleInputChange]);


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{buildingType.type}. {buildingType.name}</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Основная информация" />
          <Tab label="Общие надбавки" />
        </Tabs>
        {activeTab === 0 && (
          <Box>
            <Typography variant="body1" paragraph>
              <strong>Описание:</strong> {buildingType.description}
            </Typography>
            <Grid container spacing={2} direction="row">
              <Grid item xs={6}>
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
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={2}>
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
              </Grid>
            </Grid>
            {renderBaseCosts()}
            {renderAdjustments()}
            <TextField
              fullWidth
              label="Сумма общих надбавок"
              type="number"
              value={totalCommonAdjustments.totalValue}
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Норма с учетом отклонений"
                  type="number"
                  value={basedCostWithAdjustments}
                  margin="normal"

                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  disabled
                  fullWidth
                  label="Оценка строения"
                  value={buildingAppraisal}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  disabled
                  fullWidth
                  label="Оценка с учетом износа"
                  type="number"
                  value={buildingAppraisalWithWear}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  disabled
                  fullWidth
                  label="Страховая сумма"
                  type="number"
                  value={insuredValue}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            {renderCommonAdjustments()}
            <Typography variant="body1" paragraph>
              <strong>Сумма надбавок:</strong> {totalCommonAdjustments?.totalValue || 0} руб.
            </Typography>
            <Typography variant='body1'> Примечание. Общие надбавки к оценочной стоимости строения рассчитаны с учетом
                по теплым полам: устройство теплоизоляции, прокладка электрических кабелей, устройство покрытий цементных (бетонных), установка терморегуляторов;
                по роллетам оконным (дверным): установка роллет алюминиевых и механических приводов.
            </Typography>
          </Box>
        )}
      </DialogContent>
      {activeTab === 0 && (
        <DialogActions>
          <Button onClick={handleClose}>ЗАКРЫТЬ</Button>
          <Button onClick={handleAddToEstimation} color="primary">
            ДОБАВИТЬ В ОЦЕНОЧНЫЙ ЛИСТ
          </Button>
        </DialogActions>
    )}
    </Dialog>
  );
};

export default BuildingTypeModal;