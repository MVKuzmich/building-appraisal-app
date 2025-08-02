import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  Typography,
  Paper,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import BuildingTypeModal from '../buildingTypeModal/BuildingTypeModal';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import BuildingService from '../../services/BuildingsService';
import buildingTypesData from '../../data/data.json';

const BuildingTypeList = ({ buildingTypes, setBuildingTypes, onSelectBuildingType, onAddToEstimation, editingBuilding, setEditingBuilding }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);

  const handleOpenModal = (buildingType) => {
    setSelectedBuildingType(buildingType);
    setModalOpen(true);
    onSelectBuildingType(buildingType);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBuildingType(null);
    setEditingBuilding(null); // Сбрасываем данные редактирования
  };

  // Открываем модальное окно для редактирования, если есть данные для редактирования
  useEffect(() => {
    if (editingBuilding && !modalOpen) {
      console.log('Создаем buildingType для редактирования из данных:', editingBuilding);
      
      // Ищем полные данные типа строения в data.json
      const fullBuildingType = buildingTypesData.find(bt => bt.type === editingBuilding.type);
      console.log('Найденный полный тип строения:', fullBuildingType);
      
      if (fullBuildingType) {
        // Создаем объект buildingType с полными данными и выбранными надбавками
        const buildingType = {
          ...fullBuildingType,
          // Сохраняем выбранные надбавки из редактируемого объекта
          selectedAdjustments: editingBuilding.selectedAdjustments || []
        };
        
        console.log('Созданный buildingType для редактирования:', buildingType);
        
        setSelectedBuildingType(buildingType);
        setModalOpen(true);
        onSelectBuildingType(buildingType);
      } else {
        // Если не найден полный тип, создаем базовый объект
        const buildingType = {
          type: editingBuilding.type,
          name: editingBuilding.buildingName,
          description: `Редактирование объекта типа ${editingBuilding.type}`,
          normAppliance: editingBuilding.normAppliance,
          estimationSheetData: {
            name: editingBuilding.buildingName,
            foundation: editingBuilding.buildingFoundation,
            walls: editingBuilding.buildingWalls,
            roof: editingBuilding.buildingRoof
          },
          volumeBasedCosts: [
            {
              volumeFrom: 0,
              volumeTo: 9999,
              cost: editingBuilding.selectedBasedCost
            }
          ],
          basedCostsDependency: editingBuilding.normAppliance,
          // Создаем полный список надбавок на основе выбранных
          adjustments: editingBuilding.selectedAdjustments ? 
            editingBuilding.selectedAdjustments.map(adj => ({
              adjustmentGroup: adj.adjustmentGroup,
              adjustmentElement: [adj.adjustmentElement[0], adj.adjustmentElement[1]],
              adjustmentCost: adj.adjustmentCost
            })) : []
        };
        
        console.log('Созданный базовый buildingType для редактирования:', buildingType);
        
        setSelectedBuildingType(buildingType);
        setModalOpen(true);
        onSelectBuildingType(buildingType);
      }
    }
  }, [editingBuilding, buildingTypes, modalOpen, onSelectBuildingType]);

  return (
    <ErrorBoundary>
      <Paper elevation={3} style={{ maxWidth: '1200px', width: '100%', margin: 'auto', padding: 16 }}>
        <Typography variant="h6" gutterBottom>
          Типы строений
        </Typography>
        <List style={{ maxHeight: '600px', overflow: 'auto' }}>
          {buildingTypes.map((buildingType) => (
            <ListItem key={buildingType.type} divider>
              <Box display="flex" alignItems="center" width="100%">
                <Tooltip title={`${buildingType.type}. ${buildingType.name}`} placement="top-start">
                  <Typography noWrap style={{ flexGrow: 1, maxWidth: '900px' }}>
                    {buildingType.type}. {buildingType.name}
                  </Typography>
                </Tooltip>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleOpenModal(buildingType)}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.8rem',
                    minWidth: '100px'
                  }}
                >
                  ОТКРЫТЬ ТИП
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
        {selectedBuildingType && <BuildingTypeModal
          open={modalOpen}
          onClose={handleCloseModal}
          buildingType={selectedBuildingType}
          onAddToEstimation={onAddToEstimation}
          setBuildingTypes={setBuildingTypes}
          editData={editingBuilding}
        />}
      </Paper>  
    </ErrorBoundary>
    
  );
};

export default BuildingTypeList;