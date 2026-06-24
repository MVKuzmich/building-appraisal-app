import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Fab } from '@mui/material';
import BuildingTypeList from '../components/buildingTypeList/BuildingTypeList';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuildingTypeSearchForm from '../components/buildingTypeSearchForm/BuildingTypeSearchForm';
import InsuranceAssessmentSheet from '../components/insuranceAssessmentSheet/InsuranceAssessmentSheet';
import ErrorBoundary from '../components/errorBoundary/ErrorBoundary';
import FeedbackForm from '../components/feedbackForm/FeedbackForm';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BuildingService from '../services/BuildingsService';
import { DEFAULT_COMMON_ADJUSTMENTS } from '../data/commonAdjustments';

const EvaluationPage = () => {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [estimationList, setEstimationList] = useState([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [commonAdjustmentsData, setCommonAdjustmentsData] = useState(DEFAULT_COMMON_ADJUSTMENTS);

  const buildingService = useMemo(() => BuildingService(), []);

  useEffect(() => {
    buildingService.getCommonAdjustments()
      .then(setCommonAdjustmentsData)
      .catch(() => setCommonAdjustmentsData(DEFAULT_COMMON_ADJUSTMENTS));
  }, [buildingService]);

  const onAddToEstimation = (estimationData, editIndex = null) => {
    if (editIndex !== null) {
      setEstimationList((prevList) => {
        const newList = [...prevList];
        newList[editIndex - 1] = estimationData;
        return newList;
      });
      setEditingBuilding(null);
      return;
    }

    setEstimationList((prevList) => [...prevList, estimationData]);
  };

  const handleEditBuilding = (buildingData) => {
    setEditingBuilding(buildingData);
  };

  const handleDeleteBuilding = (orderedNumber) =>
    setEstimationList((prevList) => prevList.filter((_, index) => index + 1 !== orderedNumber));

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
                <Paper elevation={3} sx={{ height: '500px', p: 2, cursor: 'pointer' }}>
                  <ErrorBoundary>
                    <InsuranceAssessmentSheet
                      data={estimationList}
                      isExpanded={isSheetExpanded}
                      onClose={() => setIsSheetExpanded(false)}
                      onExpand={() => setIsSheetExpanded(true)}
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
                onSelectBuildingType={() => {}}
                onAddToEstimation={onAddToEstimation}
                editingBuilding={editingBuilding}
                setEditingBuilding={setEditingBuilding}
                commonAdjustmentsData={commonAdjustmentsData}
              />
            </Paper>
          </Box>
        </Box>
        <Fab
          color="primary"
          aria-label="feedback"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
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
