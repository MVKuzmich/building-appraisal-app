import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './insuranceAssessmentSheet.css';
import {
  Alert,
  Box,
  Button,
  Modal,
  IconButton,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import BuildingService from '../../services/BuildingsService';
import saveAs from 'file-saver';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import { buildAdjustmentGridColumns } from '../../utils/adjustmentColumns';
import { normalizeNormAppliance, NORM_APPLIANCE } from '../../utils/appraisalCalculations';

const COMPACT_COLUMNS = (onEditBuilding, onDeleteClick) => [
  {
    headerName: '',
    field: 'actions',
    width: 100,
    pinned: 'left',
    cellRenderer: (params) => (
      <>
        <IconButton onClick={() => onDeleteClick(params.data.orderedNumber)} size="small" color="error" aria-label="delete">
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => onEditBuilding(params.data)} size="small" color="primary" aria-label="edit">
          <EditIcon fontSize="small" />
        </IconButton>
      </>
    ),
  },
  { headerName: '№', field: 'orderedNumber', width: 70, pinned: 'left' },
  { headerName: 'Наименование', field: 'buildingName', minWidth: 180, flex: 1 },
  { headerName: 'Тип', field: 'type', width: 80 },
  { headerName: 'Износ, %', field: 'wearRate', width: 90 },
  {
    headerName: 'Страховая сумма',
    field: 'insuredValue',
    width: 140,
    valueFormatter: (params) => Number(params.value || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 }),
  },
];

const FULL_COLUMNS = (processedData, onEditBuilding, onDeleteClick) => [
  {
    headerName: '',
    field: 'actions',
    width: 120,
    cellRenderer: (params) => (
      <>
        <IconButton onClick={() => onDeleteClick(params.data.orderedNumber)} size="small" color="error" aria-label="delete">
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => onEditBuilding(params.data)} size="small" color="primary" aria-label="edit">
          <EditIcon />
        </IconButton>
      </>
    ),
  },
  { headerName: '№ п/п', field: 'orderedNumber', headerClass: 'ag-header-cell-center' },
  { headerName: 'Наименование строения', field: 'buildingName', headerClass: 'ag-header-cell-center' },
  {
    headerName: 'Материал',
    children: [
      { headerName: 'Фундамент', field: 'buildingFoundation', headerClass: 'vertical-header' },
      { headerName: 'Стены', field: 'buildingWalls', headerClass: 'vertical-header' },
      { headerName: 'Крыша', field: 'buildingRoof', headerClass: 'vertical-header' },
    ],
  },
  {
    headerName: 'Размеры',
    children: [
      { headerName: 'Длина', field: 'dimensions.length', headerClass: 'vertical-header' },
      { headerName: 'Ширина', field: 'dimensions.width', headerClass: 'vertical-header' },
      { headerName: 'Высота', field: 'dimensions.height', headerClass: 'vertical-header' },
    ],
  },
  {
    headerName: 'Площадь / Кубатура',
    field: 'dimensions.primaryMeasurement',
    headerClass: 'vertical-header',
    valueGetter: (params) => {
      const normalized = normalizeNormAppliance(params.data.normAppliance);
      return normalized === NORM_APPLIANCE.PER_SQUARE_METER
        ? params.data.dimensions.area
        : params.data.dimensions.cubic;
    },
  },
  { headerName: 'Тип', field: 'type', headerClass: 'ag-header-cell-center' },
  { headerName: 'Оценочная норма', field: 'selectedBasedCost' },
  {
    headerName: 'Надбавки',
    children: buildAdjustmentGridColumns(processedData),
  },
  { headerName: 'Оценочная норма с учетом отклонений', field: 'basedCostWithAdjustments', headerClass: 'ag-header-cell-center' },
  { headerName: 'Общие надбавки', field: 'totalCommonAdjustments.totalValue', headerClass: 'ag-header-cell-center' },
  { headerName: 'Оценка строений в базисных ценах', field: 'buildingAppraisal', headerClass: 'ag-header-cell-center' },
  { headerName: 'Процент износа', field: 'wearRate', headerClass: 'ag-header-cell-center' },
  { headerName: 'Действительная стоимость в ценах 1991г (с учетом износа)', field: 'buildingAppraisalWithWear', headerClass: 'ag-header-cell-center' },
  { headerName: 'Страховая сумма', field: 'insuredValue', headerClass: 'ag-header-cell-center' },
];

const InsuranceAssessmentSheet = ({
  data,
  isExpanded,
  onClose,
  onExpand,
  onDeleteBuilding,
  onEditBuilding,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);

  const gridRef = useRef(null);
  const { exportToExcel, error } = BuildingService();

  const processedData = data.map((item, index) => ({
    ...item,
    orderedNumber: index + 1,
  }));

  const handleDeleteClick = (orderedNumber) => {
    setBuildingToDelete(orderedNumber);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (buildingToDelete) {
      onDeleteBuilding(buildingToDelete);
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setBuildingToDelete(null);
  };

  const compactColumnDefs = useMemo(
    () => COMPACT_COLUMNS(onEditBuilding, handleDeleteClick),
    [onEditBuilding]
  );

  const fullColumnDefs = useMemo(
    () => FULL_COLUMNS(processedData, onEditBuilding, handleDeleteClick),
    [processedData, onEditBuilding]
  );

  const exportToXLSX = async () => {
    if (processedData.length === 0) {
      return;
    }

    try {
      setIsExporting(true);
      const response = await exportToExcel(processedData);
      saveAs(
        new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'InsuranceAssessmentSheet.xlsx'
      );
    } catch (e) {
      console.error('Error exporting to XLSX:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const toolbar = (compact = true) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
      <Button
        onClick={exportToXLSX}
        startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
        variant="contained"
        disabled={isExporting || processedData.length === 0}
      >
        {isExporting ? 'Экспорт...' : 'Скачать XLSX'}
      </Button>
      {compact && (
        <Button onClick={onExpand} startIcon={<FullscreenIcon />} variant="outlined">
          Все колонки
        </Button>
      )}
      {error && (
        <Typography variant="body2" color="error" sx={{ alignSelf: 'center' }}>
          Ошибка: {error}
        </Typography>
      )}
    </Stack>
  );

  const deleteDialog = (
    <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
      <DialogTitle>Подтверждение удаления</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Удалить строение № {buildingToDelete}? Это действие нельзя отменить.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelDelete}>Отмена</Button>
        <Button onClick={handleConfirmDelete} color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );

  if (processedData.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {toolbar()}
        <Alert severity="info" sx={{ flex: 1, alignItems: 'center', display: 'flex' }}>
          Лист пуст. Найдите тип строения слева, заполните параметры и нажмите «Добавить в лист».
        </Alert>
      </Box>
    );
  }

  const gridComponent = (columnDefs, height = '100%') => (
    <div className="ag-theme-alpine" style={{ height, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={processedData}
        columnDefs={columnDefs}
        headerHeight={isExpanded ? 100 : 42}
        defaultColDef={{
          resizable: true,
          sortable: false,
          wrapHeaderText: true,
          autoHeight: true,
          wrapText: true,
        }}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );

  if (isExpanded) {
    return (
      <Modal
        open={isExpanded}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            onClose();
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            height: '92%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Оценочный лист — все колонки</Typography>
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          {toolbar(false)}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ErrorBoundary>{gridComponent(fullColumnDefs, '100%')}</ErrorBoundary>
          </Box>
          {deleteDialog}
        </Box>
      </Modal>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {toolbar()}
      <Box sx={{ flex: 1, minHeight: 360 }}>
        <ErrorBoundary>{gridComponent(compactColumnDefs, '100%')}</ErrorBoundary>
      </Box>
      {deleteDialog}
    </Box>
  );
};

export default InsuranceAssessmentSheet;
