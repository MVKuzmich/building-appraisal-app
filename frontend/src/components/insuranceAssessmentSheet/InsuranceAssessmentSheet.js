import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './insuranceAssessmentSheet.css';
import { Button, Box, Modal, IconButton, CircularProgress } from '@mui/material';
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

  const columnDefs = useMemo(() => [
    {
      headerName: '',
      field: 'actions',
      width: 120,
      cellRenderer: (params) => (
        <>
          <IconButton
            onClick={() => handleDeleteClick(params.data.orderedNumber)}
            size="small"
            color="error"
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            onClick={() => onEditBuilding(params.data)}
            size="small"
            color="primary"
            aria-label="edit"
          >
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
  ], [processedData, onEditBuilding]);

  const exportToXLSX = async () => {
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

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
    params.api.autoSizeAllColumns();
  }, []);

  const gridComponent = (
    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }} onClick={handleContentClick}>
      <AgGridReact
        autoSizeStrategy={{ type: 'fitCellContents', defaultMinWidth: 100, skipHeader: true }}
        headerHeight={100}
        ref={gridRef}
        rowData={processedData}
        columnDefs={columnDefs}
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
            width: '90%',
            height: '90%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            overflow: 'auto',
          }}
          onClick={handleContentClick}
        >
          <IconButton onClick={(e) => { e.stopPropagation(); onClose(); }} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
          <Button onClick={(e) => { e.stopPropagation(); exportToXLSX(); }} startIcon={<DownloadIcon />} variant="contained" sx={{ mb: 2 }}>
            Скачать XLSX
          </Button>
          <ErrorBoundary>{gridComponent}</ErrorBoundary>
          {deleteDialog}
        </Box>
      </Modal>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }} onClick={handleContentClick}>
      <IconButton onClick={(e) => { e.stopPropagation(); onExpand(); }} sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
        <FullscreenIcon />
      </IconButton>
      <Button
        onClick={exportToXLSX}
        startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
        variant="contained"
        sx={{ position: 'absolute', left: 8, top: 8, zIndex: 1 }}
        disabled={isExporting}
      >
        {isExporting ? 'Экспорт...' : 'Скачать XLSX'}
      </Button>
      {error && (
        <Box sx={{ color: 'red', position: 'absolute', left: 8, top: 48, zIndex: 1 }}>
          Ошибка: {error}
        </Box>
      )}
      <ErrorBoundary>{gridComponent}</ErrorBoundary>
      {deleteDialog}
    </Box>
  );
};

export default InsuranceAssessmentSheet;
