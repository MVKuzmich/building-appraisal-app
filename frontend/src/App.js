import React, { useState } from 'react';
import { Container, Typography, Box, Grid2 } from '@mui/material';
import BuildingTypeList from './components/buildingTypeList/BuildingTypeList';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuildingTypeSearchForm from './components/buildingTypeSearchForm/BuildingTypeSearchForm';
import InsuranceAssessmentSheet from './components/insuranceAssessmentSheet/InsuranceAssessmentSheet';

function App() {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [estimationList, setEstimationList] = useState([]);

  const onSelectBuildingType = (buildingType) => {
    setSelectedBuildingType(buildingType);
  };

  const onAddToEstimation = (estimationData) => {
    setEstimationList([...estimationList, estimationData]);
  };
  console.log(estimationList);

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Оценка строений
        </Typography>
        <BuildingTypeSearchForm setBuildingTypes={setBuildingTypes} />
        {estimationList.length> 0 && <InsuranceAssessmentSheet data={estimationList}/>}
        <BuildingTypeList 
          buildingTypes={buildingTypes} 
          onSelectBuildingType={onSelectBuildingType}
          onAddToEstimation={onAddToEstimation}
        />
        {/* Здесь можно добавить компонент для отображения оценочного листа */}
      </Box>
    </Container>
  );
}

export default App;