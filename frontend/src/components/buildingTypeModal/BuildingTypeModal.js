import React, { useState, useEffect } from 'react';
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
  Box
} from '@mui/material';

const BuildingTypeModal = ({ open, onClose, buildingType, onAddToEstimation }) => {
  const [selectedBasedCost, setSelectedBasedCost] = useState(null);
  const [selectedAdjustments, setSelectedAdjustments] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [wearAmount, setWearAmount] = useState(0);
  const [buildingYear, setBuildingYear] = useState(0);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, buildingType]);

  const resetForm = () => {
    setSelectedBasedCost(null);
    setSelectedAdjustments([]);
    setOwnerName('');
    setAddress('');
    setWearAmount(0);
    setBuildingYear(0);
  };

  if (!buildingType) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddToEstimation = () => {
    onAddToEstimation({
      buildingType,
      selectedBasedCost,
      selectedAdjustments,
      ownerName,
      address,
      wearAmount,
      buildingYear
    });
    handleClose();
  };

  const renderBaseCosts = () => {
    if (buildingType.volumeBasedCosts && buildingType.volumeBasedCosts.length > 0) {
      return (
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend">Базовая стоимость</FormLabel>
          <RadioGroup
            aria-label="base-cost"
            name="base-cost"
            value={selectedBasedCost ? JSON.stringify(selectedBasedCost) : ''}
            onChange={(e) => setSelectedBasedCost(JSON.parse(e.target.value))}
          >
            {buildingType.volumeBasedCosts.map((cost, index) => (
              <FormControlLabel
                key={index}
                value={JSON.stringify(cost)}
                control={<Radio />}
                label={`${cost.volumeFrom}: ${cost.cost} руб.`}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    }
    return null;
  };

  const renderAdjustments = () => {
    if (buildingType.adjustments && buildingType.adjustments.length > 0) {
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel>Надбавки</InputLabel>
          <Select
            multiple
            value={selectedAdjustments}
            onChange={(e) => setSelectedAdjustments(e.target.value)}
            renderValue={(selected) => selected.map(adj => adj.adjustmentElement).join(', ')}
          >
            {buildingType.adjustments.map((adjustment, index) => (
              <MenuItem key={index} value={adjustment}>
                {adjustment.adjustmentElement}: {adjustment.adjustmentCost} руб.
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{buildingType.type}. {buildingType.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          <strong>Описание:</strong> {buildingType.description}
        </Typography>
        {renderBaseCosts()}
        {renderAdjustments()}
        <TextField
          fullWidth
          label="ФИО собственника"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Адрес строения"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Год постройки"
          value={buildingYear}
          onChange={(e) => setBuildingYear(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Сумма износа"
          type="number"
          value={wearAmount}
          onChange={(e) => setWearAmount(parseFloat(e.target.value) || 0)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>ЗАКРЫТЬ</Button>
        <Button onClick={handleAddToEstimation} color="primary">
          ДОБАВИТЬ В ОЦЕНОЧНЫЙ ЛИСТ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuildingTypeModal;