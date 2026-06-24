import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Divider,
  Fab,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BuildingTypeList from '../components/buildingTypeList/BuildingTypeList';
import '../App.css';
import BuildingTypeSearchForm from '../components/buildingTypeSearchForm/BuildingTypeSearchForm';
import InsuranceAssessmentSheet from '../components/insuranceAssessmentSheet/InsuranceAssessmentSheet';
import ErrorBoundary from '../components/errorBoundary/ErrorBoundary';
import FeedbackForm from '../components/feedbackForm/FeedbackForm';
import AppFooter from '../components/AppFooter';
import BuildingService from '../services/BuildingsService';
import { DEFAULT_COMMON_ADJUSTMENTS } from '../data/commonAdjustments';

const EvaluationPage = () => {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [searchMeta, setSearchMeta] = useState({ hasSearched: false });
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

  const handleSearchResults = (results, meta) => {
    setBuildingTypes(results);
    setSearchMeta(meta);
  };

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

  const totalInsuredValue = estimationList.reduce((sum, item) => sum + (item.insuredValue || 0), 0);

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} lg={5}>
            <Paper elevation={2} sx={{ p: 2.5, height: '100%', minHeight: 560 }}>
              <BuildingTypeSearchForm onSearchResults={handleSearchResults} />
              <BuildingTypeList
                buildingTypes={buildingTypes}
                searchMeta={searchMeta}
                onAddToEstimation={onAddToEstimation}
                editingBuilding={editingBuilding}
                setEditingBuilding={setEditingBuilding}
                commonAdjustmentsData={commonAdjustmentsData}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: 560, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 2 }}>
                <Box>
                  <Typography variant="h6">Оценочный лист</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {estimationList.length > 0
                      ? `Строений: ${estimationList.length} · Сумма страховых: ${totalInsuredValue.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} руб.`
                      : 'Добавьте строение из результатов поиска'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ flex: 1, minHeight: 460 }}>
                <ErrorBoundary>
                  <InsuranceAssessmentSheet
                    data={estimationList}
                    isExpanded={isSheetExpanded}
                    onClose={() => setIsSheetExpanded(false)}
                    onExpand={() => setIsSheetExpanded(true)}
                    onDeleteBuilding={(orderedNumber) =>
                      setEstimationList((prevList) => prevList.filter((_, index) => index + 1 !== orderedNumber))
                    }
                    onEditBuilding={setEditingBuilding}
                  />
                </ErrorBoundary>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <AppFooter onOpenFeedback={() => setFeedbackOpen(true)} />

      <Tooltip title="Сообщить о проблеме" placement="left">
        <Fab
          color="primary"
          aria-label="feedback"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setFeedbackOpen(true)}
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>

      <FeedbackForm open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </ErrorBoundary>
  );
};

export default EvaluationPage;
