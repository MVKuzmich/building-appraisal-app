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

const InsuranceAssessmentSheet = ({ data, isExpanded, onClose, onExpand, onDeleteBuilding, onEditBuilding }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);


  const gridRef = useRef(null);
  const {exportToExcel, error} = BuildingService();

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


  const handleAdjustments = (data) => {
    let columns = [];
    let hasAdjustments = false;
  
    // Object to store the maximum count of each adjustment group
    const adjustmentGroupCounts = {};
  
    // First pass: count the maximum occurrences of each adjustment group
    data.forEach(item => {
      if (item.selectedAdjustments && item.selectedAdjustments.length > 0) {
        hasAdjustments = true;
        const groupCounts = {};
        item.selectedAdjustments.forEach(adj => {
          groupCounts[adj.adjustmentGroup] = (groupCounts[adj.adjustmentGroup] || 0) + 1;
          adjustmentGroupCounts[adj.adjustmentGroup] = Math.max(
            adjustmentGroupCounts[adj.adjustmentGroup] || 0,
            groupCounts[adj.adjustmentGroup]
          );
        });
      }
    });
  
    // If no adjustments were found, add a single column with a dash
    if (!hasAdjustments) {
      columns.push({
        headerName: 'Надбавки',
        field: 'noAdjustments',
        headerClass: 'vertical-header',
        valueGetter: () => '-'
      });
    } else {
      // Create column definitions based on the maximum counts
      Object.entries(adjustmentGroupCounts).forEach(([group, count]) => {
        for (let i = 0; i < count; i++) {
          columns.push({
            headerName: group,
            field: `adjustments.${group}.${i}`,
            headerClass: 'vertical-header',
            valueGetter: (params) => {
              if (params.data.selectedAdjustments) {
                const adjustments = params.data.selectedAdjustments.filter(adj => adj.adjustmentGroup === group);
                return adjustments[i] ? adjustments[i].adjustmentCost : '-';
              }
              return '-';
            }
          });
        }
      });
    }
  
    return columns;
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
    { headerName: '№ п/п', field: 'orderedNumber', headerClass: 'ag-header-cell-center'},
    { headerName: 'Наименование строения', field: 'buildingName', headerClass: 'ag-header-cell-center' },
    {
      headerName: 'Материал', headerClass: '.ag-header-cell-label',
      children: [
        { headerName: 'Фундамент', field: 'buildingFoundation', headerClass: 'vertical-header' },
        { headerName: 'Стены', field: 'buildingWalls', headerClass: 'vertical-header' },
        { headerName: 'Крыша', field: 'buildingRoof', headerClass: 'vertical-header' },
      ],
    },
    {
      headerName: 'Размеры', headerClass: '.ag-header-cell-label',
      children: [
        { headerName: 'Длина', field: 'dimensions.length', headerClass: 'vertical-header' },
        { headerName: 'Ширина', field: 'dimensions.width', headerClass: 'vertical-header' },
        { headerName: 'Высота', field: 'dimensions.height', headerClass: 'vertical-header' },
      ],
    },
    { headerName: 'Площадь основания', field: 'dimensions.area', headerClass: 'vertical-header' },
    { headerName: 'Кубатура строения', field: 'dimensions.cubic', headerClass: 'vertical-header' },
    { headerName: 'Тип', field: 'type', headerClass: 'ag-header-cell-center' },
    { headerName: 'Оценочная норма', field: 'selectedBasedCost' },
    {
      headerName: 'Надбавки', headerClass: '.ag-header-cell-label',
      children: handleAdjustments(processedData),  
    },
    { headerName: 'Оценочная норма с учетом отклонений', field: 'basedCostWithAdjustments', headerClass: 'ag-header-cell-center'},
    { headerName: 'Общие надбавки', field: 'totalCommonAdjustments.totalValue', headerClass: 'ag-header-cell-center'},
    { headerName: 'Оценка строений в базисных ценах', field: 'buildingAppraisal', headerClass: 'ag-header-cell-center'},
    { headerName: 'Процент износа', field: 'wearRate', headerClass: 'ag-header-cell-center' },
    { headerName: 'Действительная стоимость в ценах 1991г (с учетом износа)', field: 'buildingAppraisalWithWear', headerClass: 'ag-header-cell-center' },
    { headerName: 'Страховая сумма', field: 'insuredValue', headerClass: 'ag-header-cell-center'},
    
  ], [processedData]);

  // const dataAsCsv= () => {
  //   if (gridRef.current && gridRef.current.api) {
  //     return gridRef.current.api.getDataAsCsv();
  //   }
  //   return null;
  // };

  // const convertCsvToJson = (csv) => {
  //   const result = parse(csv, {
  //     header: true, // Указывает, что первая строка содержит заголовки
  //     skipEmptyLines: true // Пропускает пустые строки
  //   });
  //   return result.data;
  // };

  
  const exportToXLSX = () => {
      try {
        console.log(processedData);
        setIsExporting(true);
        exportToExcel(processedData).then(res => 
          saveAs(
            new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            'InsuranceAssessmentSheet.xlsx')
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

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleExpandClick = (e) => {
    e.stopPropagation();
    onExpand();
  };

  const autoSizeStrategy = {
    type: 'fitCellContents',
    defaultMinWidth: 100,
    skipHeader: true,
    columnLimits: [
      {
        colId: 'number',
        minWidth: 60,
        maxWidth: 80
      }
    ]
  };

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
    params.api.autoSizeAllColumns();
  }, []);

  const gridComponent = (
    <div 
      className="ag-theme-alpine" 
      style={{ height: '100%', width: '100%' }}
      onClick={handleContentClick}
    >
      <AgGridReact
        autoSizeStrategy={autoSizeStrategy}
        headerHeight={100}
        ref={gridRef}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true, sortable: false, wrapHeaderText: true, autoHeight: true, wrapText: true}}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );

  if (isExpanded) {
    return (
      <>
        <Modal
          open={isExpanded}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              onClose();
            }
          }}
          aria-labelledby="insurance-assessment-sheet"
          aria-describedby="insurance-assessment-sheet-description"
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
            <IconButton 
              onClick={handleCloseClick} 
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                exportToXLSX();
              }} 
              startIcon={<DownloadIcon />}
              variant="contained"
              sx={{ mb: 2 }}
            >
              Скачать XLSX
            </Button>
            <ErrorBoundary>
              {gridComponent}
            </ErrorBoundary>
            <Dialog
              open={deleteConfirmOpen}
              onClose={handleCancelDelete}
            >
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the building type with ordered number {buildingToDelete}? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelDelete}>Cancel</Button>
                <Button onClick={handleConfirmDelete} color="error">Delete</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Modal>
      </>      
    );
  }

  return (
    <>
      <Box 
        sx={{ height: '100%', position: 'relative' }}
        onClick={handleContentClick}
      >
        <IconButton 
          onClick={handleExpandClick} 
          sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
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
          <div style={{ color: 'red', position: 'absolute', left: 8, top: 48, zIndex: 1 }}>
            Ошибка: {error}
          </div>
        )}
        <ErrorBoundary>
          {gridComponent}
        </ErrorBoundary>
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the building type with ordered number {buildingToDelete}? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
    
  );
};

export default InsuranceAssessmentSheet;