import React, { useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { toProperCase } from '../functions/formatValue';

const Table = (props) => {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState([...props.data]);
  const includeRowSelect = props.includeRowSelect || false
  const selectedRows = props.selectedRows; 
  const formatHeader = props.formatHeader || false;
  const onCellClicked = props.onCellClicked || null;
  const onCellEdit = props.onCellEdit || null
  const onRowSelected = props.onRowSelected || null; 
  const mode = props.mode
  const tableFieldOptions = props.tableFieldOptions || [];
  const distributeColumns = props.distributeColumns || true;
  const suppressSizeToFit = props.suppressSizeToFit || false;

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
      suppressSizeToFit: true,
      cellStyle: { textAlign: 'center' }
    };
    
    columnDefs.push(selectField)
  }
 

  if (rowData.length > 0) {

    Object.keys(rowData[0]).forEach((field) => {
      
      if (!hiddenColumns.includes(field)){

        const fieldOptions = tableFieldOptions.find(item => item.name === field);
      
        columnDefs.push({
          field: field,
          headerName: formatHeader ? toProperCase(field.replaceAll("_"," ")) : field,
          editable: true,
          sortable: true,
          filter: true,
          cellEditor: fieldOptions  ? 'agSelectCellEditor' : 'agTextCellEditor',
          cellEditorParams: fieldOptions  ? { values: fieldOptions.options } : null,
          minWidth: 25,
          flex: distributeColumns ? 1 : 0,
          suppressSizeToFit: suppressSizeToFit,
          headerClass: "ag-header-cell",
          cellStyle: { 
              textAlign: 'left', 
              color: field==="Predicted APH" && "rgb(0,150,50)",
              backgroundColor:  field==="Predicted APH" &&  "rgba(0,225,100,0.25)",
          },
          sort: fieldOptions  ?  fieldOptions.sortOrder : null
        });
      }
    });
  }


  const handleSelectionChange = (event) => {

    const source = event.source
    const updatedSelection = event.api.getSelectedNodes().map(node => node.data);
    if ((source ==="checkboxSelected" ||source ==="uiSelectAll") && JSON.stringify(updatedSelection) !== JSON.stringify(selectedRows)) {
      onRowSelected(updatedSelection);
    }
  };

  const gridOptions = {
    rowClassRules: {
      'selected-row': (params) => params.node.isSelected(),
    },
    onFirstDataRendered: (params) => {
      selectedRows && rowData.forEach((row, rowIndex) => {
        const isSelected = selectedRows.some(selectedRow => selectedRow["Employee ID"] === row["Employee ID"]);
        if (isSelected) {
          params.api.getDisplayedRowAtIndex(rowIndex).setSelected(true);
        }
      });
      params.columnApi.autoSizeAllColumns();
    },
  };

  const handleCellClick = (e) => {
    console.log(e)
    if (typeof onCellClicked === "function") {
      console.log(e.data)
      onCellClicked(e.data);
    }
  };

  useEffect(() => {
    if (gridRef.current && gridRef.current.api && selectedRows) {
      gridRef.current.api.forEachNode((node) => {
        const isSelected = selectedRows.some(selectedRow => selectedRow["id"] === node.data["id"]);
        node.setSelected(isSelected);
      });
    }
  }, [selectedRows, rowData]);


  const handleCellEdit = (params) => {
    if(typeof onCellEdit === "function"){
      onCellEdit(params)
    }
  };

  useEffect(() => {
    setRowData([...props.data])
  }, [props.data]);
  
  

  return (
    <div className={mode === "dark" ? `ag-theme-alpine-dark` : `ag-theme-alpine`} style={{ height: "100%", width: '100%' }}>
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
        checkboxSelection={true}
      />
    </div>
  );
};

export default Table;



