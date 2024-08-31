import React, { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './insuranceAssessmentSheet.css';

const InsuranceAssessmentSheet = ({ data }) => {
  
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



  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true, sortable: false }}
      />
    </div>
  );
};

export default InsuranceAssessmentSheet;