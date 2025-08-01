import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Fab } from '@mui/material';
import BuildingTypeList from '../components/buildingTypeList/BuildingTypeList';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuildingTypeSearchForm from '../components/buildingTypeSearchForm/BuildingTypeSearchForm';
import InsuranceAssessmentSheet from '../components/insuranceAssessmentSheet/InsuranceAssessmentSheet';
import ErrorBoundary from '../components/errorBoundary/ErrorBoundary';
import FeedbackForm from '../components/feedbackForm/FeedbackForm';
import FeedbackIcon from '@mui/icons-material/Feedback';

const EvaluationPage = () => {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [estimationList, setEstimationList] = useState([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // Добавляем состояние для редактирования
  const [editingBuilding, setEditingBuilding] = useState(null);

  const onSelectBuildingType = (buildingType) => setSelectedBuildingType(buildingType);

  // Обновляем функцию добавления для поддержки редактирования
  const onAddToEstimation = (estimationData, editIndex = null) => {
    if (editIndex !== null) {
      // Режим редактирования - обновляем существующий объект
      setEstimationList((prevList) => {
        const newList = [...prevList];
        newList[editIndex - 1] = estimationData; // orderedNumber начинается с 1, но индекс с 0
        return newList;
      });
    } else {
      // Режим добавления - добавляем новый объект
      setEstimationList([...estimationList, estimationData]);
    }
  };

  // Функция для обработки редактирования объекта
  const handleEditBuilding = (buildingData) => {
    setEditingBuilding(buildingData);
  };

  const handleSheetExpand = () => setIsSheetExpanded(true);

  const handleSheetClose = () => setIsSheetExpanded(false);

  const handleDeleteBuilding = (orderedNumber) =>
    setEstimationList((prevList) =>
      prevList.filter((_, index) => index + 1 !== orderedNumber)
    );

  return (
    <ErrorBoundary>
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
            {estimationList.length > 0 && (
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
                  <ErrorBoundary>
                    <InsuranceAssessmentSheet
                      data={estimationList}
                      isExpanded={isSheetExpanded}
                      onClose={handleSheetClose}
                      onExpand={handleSheetExpand}
                      onDeleteBuilding={handleDeleteBuilding}
                      onEditBuilding={handleEditBuilding}
                    />
                  </ErrorBoundary>
                </Paper>
              </Grid>
            )}
          </Grid>
          <Box mt={3}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <BuildingTypeList
                buildingTypes={buildingTypes}
                setBuildingTypes={setBuildingTypes}
                onSelectBuildingType={onSelectBuildingType}
                onAddToEstimation={onAddToEstimation}
                editingBuilding={editingBuilding}
                setEditingBuilding={setEditingBuilding}
              />
            </Paper>
          </Box>
        </Box>
        <Fab
          color="primary"
          aria-label="feedback"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setFeedbackOpen(true)}
        >
          <FeedbackIcon />
        </Fab>

        <FeedbackForm open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </Container>
    </ErrorBoundary>
  );
};

export default EvaluationPage;