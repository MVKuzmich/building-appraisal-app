import React, { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './insuranceAssessmentSheet.css';
import { Button, Box, Modal, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const InsuranceAssessmentSheet = ({ data, isExpanded, onClose, onExpand }) => {
  const gridRef = useRef(null);

  const processedData = data.map((item, index) => ({
    ...item,
    number: index + 1,
  }));


  const handleAdjustments = (data) => {
    if (!data || data.length === 0) {
      return [];
    }
  
    // Object to store the maximum count of each adjustment group
    const adjustmentGroupCounts = {};
  
    // First pass: count the maximum occurrences of each adjustment group
    data.forEach(item => {
      if (item.selectedAdjustments) {
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
  
    // Create column definitions based on the maximum counts
    const columns = [];
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
  
    return columns;
  };

  const columnDefs = useMemo(() => [
    { headerName: '№ п/п', field: 'number', headerClass: 'ag-header-cell-center'},
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
    { headerName: 'Тип', field: 'type', headerClass: 'ag-header-cell-center' },
    { headerName: 'Оценочная норма', field: 'selectedBasedCost' },
    {
      headerName: 'Надбавки', headerClass: '.ag-header-cell-label',
      children: handleAdjustments(processedData) || '-',  
    },
    { headerName: 'Оценочная норма с учетом отклонений', field: 'basedCostWithAdjustments', headerClass: 'ag-header-cell-center'},
    { headerName: 'Общие надбавки', field: 'totalCommonAdjustments.totalValue', headerClass: 'ag-header-cell-center'},
    { headerName: 'Оценка строений в базисных ценах', field: 'buildingAppraisal', headerClass: 'ag-header-cell-center'},
    { headerName: 'Процент износа', field: 'wearRate', headerClass: 'ag-header-cell-center' },
    { headerName: 'Действительная стоимость в ценах 1991г (с учетом износа)', field: 'buildingAppraisalWithWear', headerClass: 'ag-header-cell-center' },
    { headerName: 'Страховая сумма', field: '', headerClass: 'ag-header-cell-center'},
  ], [processedData]);

  const exportToCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv();
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
    type: 'fitCellContents'
  };

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
        defaultColDef={{ resizable: true, sortable: false, wrapHeaderText: true }}
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
              exportToCSV();
            }} 
            startIcon={<DownloadIcon />}
            variant="contained"
            sx={{ mb: 2 }}
          >
            Скачать CSV
          </Button>
          {gridComponent}
        </Box>
      </Modal>
    );
  }

  return (
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
        onClick={(e) => {
          e.stopPropagation();
          exportToCSV();
        }} 
        startIcon={<DownloadIcon />}
        variant="contained"
        sx={{ position: 'absolute', left: 8, top: 8, zIndex: 1 }}
      >
        Скачать CSV
      </Button>
      {gridComponent}
    </Box>
  );
};

export default InsuranceAssessmentSheet;