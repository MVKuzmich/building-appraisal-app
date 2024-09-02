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

  const firstItem = processedData[0];
  /*

  const estimationData = {
        buildingName: buildingType.estimationSheetData.name,
        buildingYear,
        buildingFoundation: buildingType.estimationData.foundation,
        buildingWalls: buildingType.estimationData.walls,
        buildingRoof: buildingType.estimationData.roof,     
        dimensions: buildingDimensions,
        type: buildingType.type,
        selectedBasedCost,
        selectedAdjustments,
        commonAdjustments,
        basedCostWithAdjustments,
        buildingAppraisal,
        wearRate,
        buildingAppraisalWithWear
      };
  */
    const handleAdjustments = (item) => {
      if (!item || !Array.isArray(item.selectedAdjustments)) {
        return [];
      }
      return item.selectedAdjustments.map((adj, index) => {
        console.log(`функция handleAdj ${adj.adjustmentGroup}: ${adj.adjustmentCost}`);
        return {
          headerName: adj.adjustmentGroup,
          field: `selectedAdjustments[${index}].adjustmentCost`,
          valueGetter: (params) => {
            return params.data.selectedAdjustments[index]?.adjustmentCost;
          }
        };
      });
    };

  const columnDefs = useMemo(() => [
    { headerName: '№ п/п', field: 'number' },
    { headerName: 'Наименование строения', field: 'buildingName' },
    {
      headerName: 'Материал',
      children: [
        { headerName: 'Фундамент', field: 'buildingFoundation', headerClass: 'vertical-header', suppressSizeToFit: true },
        { headerName: 'Стены', field: 'buildingWalls', headerClass: 'vertical-header', suppressSizeToFit: true },
        { headerName: 'Крыша', field: 'buildingRoof', headerClass: 'vertical-header', suppressSizeToFit: true },
      ],
    },
    {
      headerName: 'Размеры',
      children: [
        { headerName: 'Длина', field: 'dimensions.length', headerClass: 'vertical-header', suppressSizeToFit: true },
        { headerName: 'Ширина', field: 'dimensions.width', headerClass: 'vertical-header', suppressSizeToFit: true },
        { headerName: 'Высота', field: 'dimensions.height', headerClass: 'vertical-header', suppressSizeToFit: true },
      ],
    },
    { headerName: 'Тип', field: 'type' },
    { headerName: 'Оценочная норма', field: 'selectedBasedCost' },
    {
      headerName: 'Надбавки',
      children: handleAdjustments(firstItem),  
    },
    { headerName: 'Оценочная норма с учетом отклонений', field: 'basedCostWithAdjustments' },
    { headerName: 'Процент износа', field: 'wearRate' },
    { headerName: 'Страховая стоимость', field: 'buildingAppraisalWithWear'},
  ], []);



  const exportToCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv();
    }
  };

  const gridComponent = (
    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true, sortable: false }}
      />
    </div>
  );

  if (isExpanded) {
    return (
      <Modal
        open={isExpanded}
        onClose={onClose}
        aria-labelledby="insurance-assessment-sheet"
        aria-describedby="insurance-assessment-sheet-description"
      >
        <Box sx={{
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
        }}>
          <IconButton 
            onClick={onClose} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Button 
            onClick={exportToCSV} 
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
    <Box sx={{ height: '100%', position: 'relative' }}>
      <IconButton 
        onClick={onExpand} 
        sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
      >
        <FullscreenIcon />
      </IconButton>
      <Button 
        onClick={exportToCSV} 
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
