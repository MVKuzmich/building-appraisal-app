import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BuildingService from '../../services/BuildingsService';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';

const BuildingTypeSearchForm = ({ onSearchResults }) => {
  const [buildingType, setBuildingType] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { loading, error, getBuildingTypes } = BuildingService();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!buildingType.trim() && !buildingName.trim()) {
      onSearchResults([], { hasSearched: true, isEmptyQuery: true });
      setHasSearched(true);
      return;
    }

    try {
      const results = await getBuildingTypes({
        buildingType: buildingType.trim(),
        buildingName: buildingName.trim(),
      });
      setHasSearched(true);
      onSearchResults(results, { hasSearched: true, isEmptyQuery: false });
    } catch (searchError) {
      console.error('Error fetching building types:', searchError);
      onSearchResults([], { hasSearched: true, isEmptyQuery: false, failed: true });
    }
  };

  return (
    <ErrorBoundary>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Поиск типа строения
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Укажите номер типа, название или оба поля. Результаты появятся ниже.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        >
          <TextField
            label="Номер типа"
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Наименование"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
            sx={{ minWidth: { sm: 160 }, height: 40 }}
          >
            {loading ? 'Поиск...' : 'Найти'}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!hasSearched && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Начните с поиска — затем выберите тип и заполните параметры строения.
          </Alert>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default BuildingTypeSearchForm;
