import React, { useState } from 'react';
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

const BuildingTypeList = ({ buildingTypes, setBuildingTypes, onSelectBuildingType, onAddToEstimation }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);

  const handleOpenModal = (buildingType) => {
    setSelectedBuildingType(buildingType);
    setModalOpen(true);
    onSelectBuildingType(buildingType);
  };

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
          onClose={() => setModalOpen(false)}
          buildingType={selectedBuildingType}
          onAddToEstimation={onAddToEstimation}
          setBuildingTypes={setBuildingTypes}
        />}
      </Paper>  
    </ErrorBoundary>
    
  );
};

export default BuildingTypeList;