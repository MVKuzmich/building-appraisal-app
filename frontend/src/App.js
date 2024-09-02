import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import BuildingTypeList from './components/buildingTypeList/BuildingTypeList';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuildingTypeSearchForm from './components/buildingTypeSearchForm/BuildingTypeSearchForm';
import InsuranceAssessmentSheet from './components/insuranceAssessmentSheet/InsuranceAssessmentSheet';

function App() {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [estimationList, setEstimationList] = useState([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  const onSelectBuildingType = (buildingType) => {
    setSelectedBuildingType(buildingType);
  };

  const onAddToEstimation = (estimationData) => {
    setEstimationList([...estimationList, estimationData]);
  };

  const toggleSheetExpansion = () => {
    setIsSheetExpanded(!isSheetExpanded);
  };

  return (
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
              onClick={toggleSheetExpansion}
            >
              {estimationList.length > 0 && (
                <InsuranceAssessmentSheet 
                  data={estimationList}
                  isExpanded={isSheetExpanded}
                  onClose={() => setIsSheetExpanded(false)}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <BuildingTypeList 
              buildingTypes={buildingTypes} 
              onSelectBuildingType={onSelectBuildingType}
              onAddToEstimation={onAddToEstimation}
            />
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
