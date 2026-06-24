import React, { useState, useEffect, useMemo } from 'react';
import {
  List,
  ListItem,
  Typography,
  Paper,
  Button,
  Box,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import BuildingTypeModal from '../buildingTypeModal/BuildingTypeModal';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import BuildingService from '../../services/BuildingsService';

const BuildingTypeList = ({
  buildingTypes,
  setBuildingTypes,
  onSelectBuildingType,
  onAddToEstimation,
  editingBuilding,
  setEditingBuilding,
  commonAdjustmentsData,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [isLoadingEditType, setIsLoadingEditType] = useState(false);
  const { getBuildingTypeById } = BuildingService();

  const handleOpenModal = (buildingType) => {
    setSelectedBuildingType(buildingType);
    setModalOpen(true);
    onSelectBuildingType(buildingType);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBuildingType(null);
    setEditingBuilding(null);
  };

  useEffect(() => {
    if (!editingBuilding || modalOpen) {
      return;
    }

    let isCancelled = false;

    const openEditModal = async () => {
      setIsLoadingEditType(true);
      try {
        const fullBuildingType = await getBuildingTypeById(editingBuilding.type);
        if (isCancelled) {
          return;
        }

        setSelectedBuildingType(fullBuildingType);
        setModalOpen(true);
        onSelectBuildingType(fullBuildingType);
      } catch (error) {
        console.error('Не удалось загрузить тип строения для редактирования', error);
      } finally {
        if (!isCancelled) {
          setIsLoadingEditType(false);
        }
      }
    };

    openEditModal();

    return () => {
      isCancelled = true;
    };
  }, [editingBuilding, modalOpen, getBuildingTypeById, onSelectBuildingType]);

  return (
    <ErrorBoundary>
      <Paper elevation={3} sx={{ maxWidth: '1200px', width: '100%', mx: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Типы строений
        </Typography>

        {isLoadingEditType && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
          {buildingTypes.map((buildingType) => (
            <ListItem key={buildingType.type} divider>
              <Box display="flex" alignItems="center" width="100%">
                <Tooltip title={`${buildingType.type}. ${buildingType.name}`} placement="top-start">
                  <Typography noWrap sx={{ flexGrow: 1, maxWidth: '900px' }}>
                    {buildingType.type}. {buildingType.name}
                  </Typography>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenModal(buildingType)}
                  sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem', minWidth: '100px' }}
                >
                  ОТКРЫТЬ ТИП
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>

        {selectedBuildingType && (
          <BuildingTypeModal
            open={modalOpen}
            onClose={handleCloseModal}
            buildingType={selectedBuildingType}
            onAddToEstimation={onAddToEstimation}
            setBuildingTypes={setBuildingTypes}
            editData={editingBuilding}
            commonAdjustmentsData={commonAdjustmentsData}
          />
        )}
      </Paper>
    </ErrorBoundary>
  );
};

export default BuildingTypeList;
