import { useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { toProperCase } from '../functions/formatValue';
import { useSelector } from 'react-redux';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const Table = (props:any) => {

  const theme = useSelector((state:any)=>state.main.theme)

  const gridRef = useRef<any>(null);
  const [rowData, setRowData] = useState([...props.data]);
  const includeRowSelect = props.includeRowSelect || false
  const selectedRows = props.selectedRows; // The updated list of selected staffing records
  const formatHeader = props.formatHeader || false;
  const onCellClicked = props.onCellClicked || null;
  const onCellEdit = props.onCellEdit || null
  const onRowSelected = props.onRowSelected || null; // New prop for row selection callback
  
  const tableFieldOptions = props.tableFieldOptions || [];

  const hiddenColumns = props.hiddenColumns || []

  const columnDefs = [];

  if (includeRowSelect){

    const selectField = {
      field: "select",
      headerName: "Include",
      cellStyle: { textAlign: 'center' },
      width: 50,
      filter: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      resizable: false,
      suppressSizeToFit: true
    };
    
    columnDefs.push(selectField)
  }
 

  if (rowData.length > 0) {

    Object.keys(rowData[0]).forEach((field) => {
      
      if (!hiddenColumns.includes(field)){

        const fieldOptions = tableFieldOptions.find((item:any) => item.name === field);
      
        columnDefs.push({
          field: field,
          headerName: formatHeader ? toProperCase(field.replace(/"_"/g," ")) : field,
          editable: true,
          sortable: true,
          filter: true,
          cellEditor: fieldOptions  ? 'agSelectCellEditor' : 'agTextCellEditor',
          cellEditorParams: fieldOptions  ? { values: fieldOptions.options } : null,
          minWidth: 25,
          maxWidth: 150,
          flex: 0,
          headerClass: "ag-header-cell",
          cellStyle: { 
              textAlign: 'center', 
              color: "black",
              backgroundColor:  "white",
          },
          sort: fieldOptions  ?  fieldOptions.sortOrder : null
        });
      }
    });
  }


  const handleSelectionChange = (event:any) => {
    
    console.log(event)
    console.log(event.source)

    const source = event.source
    const updatedSelection = event.api.getSelectedNodes().map((node:any) => node.data);
    if ((source ==="checkboxSelected" ||source ==="uiSelectAll") && JSON.stringify(updatedSelection) !== JSON.stringify(selectedRows)) {
      onRowSelected(updatedSelection);
    }
  };

  const gridOptions = {
    rowClassRules: {
      'selected-row': (params:any) => params.node.isSelected(),
    },
    onFirstDataRendered: (params:any) => {
      selectedRows && rowData.forEach((row, rowIndex) => {
        const isSelected = selectedRows.some((selectedRow:any) => selectedRow["Employee ID"] === row["Employee ID"]);
        if (isSelected) {
          params.api.getDisplayedRowAtIndex(rowIndex).setSelected(true);
        }
      });
    },
  };

  const handleCellClick = (e:any) => {
    if (typeof onCellClicked === "function") {
      onCellClicked(e.data);
    }
  };

  useEffect(() => {
    if (gridRef.current && gridRef.current.api && selectedRows) {
      gridRef.current.api.forEachNode((node:any) => {
        const isSelected = selectedRows.some((selectedRow:any) => selectedRow["id"] === node.data["id"]);
        node.setSelected(isSelected);
      });
    }
  }, [selectedRows, rowData]);


  const handleCellEdit = (params:any) => {
    if(typeof onCellEdit === "function"){
      onCellEdit(params)
    }
  };

  useEffect(() => {
    setRowData([...props.data])
  }, [props.data]);
  
  

  return (
    <div 
      className={theme === "dark" ? `ag-theme-alpine-dark` : `ag-theme-alpine`} 
      style={{ height: "100%", width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        animateRows={true}
        onCellClicked={handleCellClick}
        onSelectionChanged={handleSelectionChange}
        onCellValueChanged={handleCellEdit}
        gridOptions={gridOptions}
        rowSelection="multiple"
        // checkboxSelection={true}
      />
    </div>
  );
};

export default Table;


