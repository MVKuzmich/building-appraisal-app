import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import BuildingTypeList from './components/buildingTypeList/BuildingTypeList';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuildingTypeSearchForm from './components/buildingTypeSearchForm/BuildingTypeSearchForm';
import InsuranceAssessmentSheet from './components/insuranceAssessmentSheet/InsuranceAssessmentSheet';
import ErrorBoundary from './components/errorBoundary/ErrorBoundary';
import DisclaimerModal from './components/disclaimerModal/DisclaimerModal';

function App() {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [estimationList, setEstimationList] = useState([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('disclaimerAccepted');
    if (accepted === 'true') {
      setShowDisclaimer(false);
      setIsDisclaimerAccepted(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setShowDisclaimer(false);
    setIsDisclaimerAccepted(true);
  };

  const onSelectBuildingType = (buildingType) => {
    setSelectedBuildingType(buildingType);
  };

  const onAddToEstimation = (estimationData) => {
    setEstimationList([...estimationList, estimationData]);
  };

  const handleSheetExpand = () => {
    setIsSheetExpanded(true);
  };

  const handleSheetClose = () => {
    setIsSheetExpanded(false);
  };

  const handleDeleteBuilding = (orderedNumber) => {
    setEstimationList(prevList => prevList.filter((_, index) => index + 1 !== orderedNumber));
  };

  return (
    <ErrorBoundary>
      <DisclaimerModal 
        open={showDisclaimer} 
        onAccept={handleDisclaimerAccept} 
      />
      {isDisclaimerAccepted && (
        <Container maxWidth="xl">
          <Box my={4}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Оценка строений
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ height: '500px', p: 2 }}>
                  <BuildingTypeSearchForm setBuildingTypes={setBuildingTypes} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: '500px', 
                    p: 2, 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  {estimationList.length > 0 && (
                    <ErrorBoundary>
                      <InsuranceAssessmentSheet 
                        data={estimationList}
                        isExpanded={isSheetExpanded}
                        onClose={handleSheetClose}
                        onExpand={handleSheetExpand}
                        onDeleteBuilding={handleDeleteBuilding}
                      />  
                    </ErrorBoundary>
                  )}
                </Paper>
              </Grid>
            </Grid>
            <Box mt={3}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <BuildingTypeList 
                  buildingTypes={buildingTypes}
                  setBuildingTypes={setBuildingTypes} 
                  onSelectBuildingType={onSelectBuildingType}
                  onAddToEstimation={onAddToEstimation}
                />
              </Paper>
            </Box>
          </Box>
        </Container>
      )}
    </ErrorBoundary>
    
  );
}

export default App;
