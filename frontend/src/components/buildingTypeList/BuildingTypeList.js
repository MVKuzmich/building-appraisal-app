import React, { useState, useEffect, useMemo } from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BuildingTypeModal from '../buildingTypeModal/BuildingTypeModal';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import BuildingService from '../../services/BuildingsService';

const BuildingTypeList = ({
  buildingTypes,
  searchMeta,
  onAddToEstimation,
  editingBuilding,
  setEditingBuilding,
  commonAdjustmentsData,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [isLoadingEditType, setIsLoadingEditType] = useState(false);
  const { getBuildingTypeById } = useMemo(() => BuildingService(), []);

  const handleOpenModal = (buildingType) => {
    setSelectedBuildingType(buildingType);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBuildingType(null);
    setEditingBuilding(null);
  };

  useEffect(() => {
    if (!editingBuilding || modalOpen) {
      return undefined;
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
      } catch (loadError) {
        console.error('Не удалось загрузить тип строения для редактирования', loadError);
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
  }, [editingBuilding, modalOpen, getBuildingTypeById]);

  const renderEmptyState = () => {
    if (!searchMeta?.hasSearched) {
      return null;
    }

    if (searchMeta.isEmptyQuery) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Введите номер типа или название строения.
        </Alert>
      );
    }

    if (buildingTypes.length === 0) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Ничего не найдено. Попробуйте изменить запрос.
        </Alert>
      );
    }

    return null;
  };

  return (
    <ErrorBoundary>
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {searchMeta?.hasSearched
              ? `Результаты поиска (${buildingTypes.length})`
              : 'Результаты поиска'}
          </Typography>
        </Box>

        {isLoadingEditType && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {renderEmptyState()}

        {buildingTypes.length > 0 && (
          <List dense sx={{ maxHeight: 420, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
            {buildingTypes.map((buildingType) => (
              <ListItemButton
                key={buildingType.type}
                onClick={() => handleOpenModal(buildingType)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <ListItemText
                  primary={`${buildingType.type}. ${buildingType.name}`}
                  secondary="Нажмите, чтобы заполнить параметры"
                  primaryTypographyProps={{ noWrap: true }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ChevronRightIcon />}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenModal(buildingType);
                  }}
                >
                  Заполнить
                </Button>
              </ListItemButton>
            ))}
          </List>
        )}

        {selectedBuildingType && (
          <BuildingTypeModal
            open={modalOpen}
            onClose={handleCloseModal}
            buildingType={selectedBuildingType}
            onAddToEstimation={onAddToEstimation}
            editData={editingBuilding}
            commonAdjustmentsData={commonAdjustmentsData}
          />
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default BuildingTypeList;
