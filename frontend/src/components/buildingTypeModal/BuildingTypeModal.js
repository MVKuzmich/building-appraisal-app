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
  Grid,
  Checkbox
} from '@mui/material';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';

const BuildingTypeModal = ({ open, onClose, buildingType, onAddToEstimation, setBuildingTypes, editData = null }) => {
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

  const inputRefs = useRef({});

  // Определяем, находимся ли мы в режиме редактирования
  const isEditMode = editData !== null;

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
    console.log('BuildingTypeModal useEffect - open:', open);
    console.log('BuildingTypeModal useEffect - isEditMode:', isEditMode);
    console.log('BuildingTypeModal useEffect - editData:', editData);
    console.log('BuildingTypeModal useEffect - buildingType:', buildingType);
    
    if (open) {
      if (isEditMode && editData) {
        console.log('BuildingTypeModal - загружаем данные для редактирования');
        console.log('editData.selectedBasedCost:', editData.selectedBasedCost);
        console.log('editData.selectedAdjustments:', editData.selectedAdjustments);
        
        // Загружаем данные для редактирования
        setSelectedBasedCost(editData.selectedBasedCost || 0);
        setSelectedAdjustments(editData.selectedAdjustments || []);
        setWearRate(editData.wearRate || 0);
        setBuildingYear(editData.buildingYear || 0);
        setBuildingDimensions(editData.dimensions || {
          length: 0,
          width: 0,
          height: 0,
          cubic: 0,
          area: 0
        });
        setAdjustmentQuantities(editData.adjustmentQuantities || {});
        setTotalCommonAdjustments(editData.totalCommonAdjustments || {});
      } else {
        console.log('BuildingTypeModal - сбрасываем форму');
        resetForm();
      }
    }
  }, [open, buildingType, isEditMode, editData]);

  // Дополнительный useEffect для обработки изменения editData
  useEffect(() => {
    if (isEditMode && editData && open) {
      // Обновляем данные при изменении editData
      setSelectedBasedCost(editData.selectedBasedCost || 0);
      setSelectedAdjustments(editData.selectedAdjustments || []);
      setWearRate(editData.wearRate || 0);
      setBuildingYear(editData.buildingYear || 0);
      setBuildingDimensions(editData.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        cubic: 0,
        area: 0
      });
      setAdjustmentQuantities(editData.adjustmentQuantities || {});
      setTotalCommonAdjustments(editData.totalCommonAdjustments || {});
    }
  }, [editData, isEditMode, open]);
  
  
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
      insuredValue,
      // Добавляем данные для возможности повторного редактирования
      adjustmentQuantities
    };
    
    if (isEditMode) {
      // В режиме редактирования передаем индекс объекта для обновления
      onAddToEstimation(estimationData, editData.orderedNumber);
    } else {
      // В режиме добавления просто добавляем новый объект
      onAddToEstimation(estimationData);
    }
    
    handleClose();
    setBuildingTypes([]);

  }, [buildingType.estimationSheetData.name, buildingType.estimationSheetData.foundation, buildingType.estimationSheetData.walls, buildingType.estimationSheetData.roof, buildingType.type, buildingYear, buildingDimensions, selectedBasedCost, selectedAdjustments, totalCommonAdjustments, basedCostWithAdjustments, buildingAppraisal, buildingAppraisalWithWear, onAddToEstimation, handleClose, isEditMode, editData, adjustmentQuantities]);

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
      console.log(`render adjustments - buildingType.adjustments:`, buildingType.adjustments);
      console.log(`render adjustments - selectedAdjustments:`, selectedAdjustments);
      console.log(`render adjustments - buildingType:`, buildingType);
      
      return (
        <FormControl fullWidth margin="normal">
          <FormLabel component="legend" style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            Надбавки и скидки
          </FormLabel>
          {(buildingType.adjustments && buildingType.adjustments.length > 0) ? (
            <div style={{ 
              maxHeight: '250px', 
              overflowY: 'auto', 
              border: '1px solid #e0e0e0', 
              padding: '16px', 
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}>
              {buildingType.adjustments.map((adjustment, index) => {
                const isSelected = selectedAdjustments.some(selected => 
                  selected.adjustmentElement[0] === adjustment.adjustmentElement[0] &&
                  selected.adjustmentCost === adjustment.adjustmentCost
                );
                
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Добавляем надбавку
                            setSelectedAdjustments(prev => [...prev, adjustment]);
                          } else {
                            // Удаляем надбавку
                            setSelectedAdjustments(prev => 
                              prev.filter(adj => 
                                !(adj.adjustmentElement[0] === adjustment.adjustmentElement[0] &&
                                  adj.adjustmentCost === adjustment.adjustmentCost)
                              )
                            );
                          }
                        }}
                        color="primary"
                        size="medium"
                      />
                    }
                    label={
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        width: '100%',
                        minHeight: '24px'
                      }}>
                        <span style={{ 
                          flex: 1, 
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          {adjustment.adjustmentElement[0]}
                        </span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: adjustment.adjustmentCost > 0 ? '#2e7d32' : '#d32f2f',
                          marginLeft: '12px',
                          fontSize: '14px',
                          minWidth: '60px',
                          textAlign: 'right'
                        }}>
                          {adjustment.adjustmentCost > 0 ? '+' : ''}{adjustment.adjustmentCost} руб.
                        </span>
                      </div>
                    }
                    style={{ 
                      margin: '4px 0',
                      padding: '6px 10px',
                      backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid #1976d2' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <Typography variant="body2" color="textSecondary" style={{ fontStyle: 'italic' }}>
              Надбавки и скидки не установлены для данного типа строения
            </Typography>
          )}
          {selectedAdjustments.length > 0 && (
            <Box mt={2} p={2} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #e9ecef">
              <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 'bold', color: '#1976d2' }}>
                Выбранные надбавки ({selectedAdjustments.length}):
              </Typography>
              <div style={{ marginTop: '8px' }}>
                {selectedAdjustments.map((adj, index) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    color="textSecondary"
                    style={{ 
                      margin: '4px 0',
                      padding: '4px 0',
                      borderBottom: index < selectedAdjustments.length - 1 ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    • {adj.adjustmentElement[0]}: 
                    <span style={{ 
                      fontWeight: 'bold',
                      color: adj.adjustmentCost > 0 ? '#2e7d32' : '#d32f2f',
                      marginLeft: '8px'
                    }}>
                      {adj.adjustmentCost > 0 ? '+' : ''}{adj.adjustmentCost} руб.
                    </span>
                  </Typography>
                ))}
              </div>
            </Box>
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
      <FormControl fullWidth margin="normal">
        <FormLabel component="legend" style={{ marginBottom: '12px', fontWeight: 'bold' }}>
          Общие надбавки
        </FormLabel>
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto', 
          border: '1px solid #e0e0e0', 
          padding: '16px', 
          borderRadius: '8px',
          backgroundColor: '#fafafa'
        }}>
          {commonAdjustmentsData.map((adjustment) => (
            <div key={adjustment.element} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: adjustmentQuantities.hasOwnProperty(adjustment.element) ? '#e3f2fd' : 'transparent',
              border: adjustmentQuantities.hasOwnProperty(adjustment.element) ? '1px solid #1976d2' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={adjustmentQuantities.hasOwnProperty(adjustment.element)}
                    onChange={(e) => handleCheckboxChange(e.target.checked, adjustment)}
                    color="primary"
                    size="medium"
                  />
                }
                label={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    width: '100%',
                    minHeight: '24px'
                  }}>
                    <span style={{ 
                      flex: 1, 
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {adjustment.element} ({adjustment.unit})
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#1976d2',
                      marginLeft: '12px',
                      fontSize: '14px',
                      minWidth: '60px',
                      textAlign: 'right'
                    }}>
                      {adjustment.cost} руб.
                    </span>
                  </div>
                }
                style={{ margin: 0, flex: 1 }}
              />
              {adjustmentQuantities.hasOwnProperty(adjustment.element) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TextField
                    type="number"
                    value={adjustmentQuantities[adjustment.element] || ''}
                    onChange={(e) => handleInputChange(e, adjustment)}
                    style={{ width: '80px' }}
                    placeholder="Кол-во"
                    size="small"
                  />
                  <TextField
                    disabled
                    type="number"
                    value={adjustment.cost}
                    style={{ width: '80px' }}
                    size="small"
                  />
                  <TextField
                    type="number"
                    value={(adjustmentQuantities[adjustment.element] * adjustment.cost).toFixed(2)}
                    style={{ width: '100px' }}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {Object.keys(adjustmentQuantities).length > 0 && (
          <Box mt={2} p={2} bgcolor="#f8f9fa" borderRadius={2} border="1px solid #e9ecef">
            <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 'bold', color: '#1976d2' }}>
              Выбранные общие надбавки ({Object.keys(adjustmentQuantities).length}):
            </Typography>
            <div style={{ marginTop: '8px' }}>
              {Object.entries(adjustmentQuantities).map(([element, quantity], index) => {
                const adjustment = commonAdjustmentsData.find(adj => adj.element === element);
                const totalCost = quantity * adjustment.cost;
                return (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    color="textSecondary"
                    style={{ 
                      margin: '4px 0',
                      padding: '4px 0',
                      borderBottom: index < Object.keys(adjustmentQuantities).length - 1 ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    • {element}: {quantity} × {adjustment.cost} руб. = {totalCost.toFixed(2)} руб.
                  </Typography>
                );
              })}
            </div>
          </Box>
        )}
      </FormControl>
    );
  }, [adjustmentQuantities, handleCheckboxChange, handleInputChange]);


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
            <ErrorBoundary>
              {renderBaseCosts()}
            </ErrorBoundary>
            <ErrorBoundary>
              {renderAdjustments()}  
            </ErrorBoundary>
            <ErrorBoundary>
              {renderCommonAdjustments()}
            </ErrorBoundary>
            <TextField
              fullWidth
              label="Сумма общих надбавок"
              type="number"
              value={totalCommonAdjustments.totalValue || ''}
              placeholder={totalCommonAdjustments.totalValue ? "" : "Введите сумму"}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ЗАКРЫТЬ</Button>
          <Button onClick={handleAddToEstimation} color="primary">
            {isEditMode ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : 'ДОБАВИТЬ В ОЦЕНОЧНЫЙ ЛИСТ'}
          </Button>
        </DialogActions>
      </ErrorBoundary>
      
    </Dialog>
  );
};

export default BuildingTypeModal;