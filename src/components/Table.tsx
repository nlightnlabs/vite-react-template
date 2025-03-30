import {useState, useEffect, useRef} from 'react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { toProperCase } from '../functions/formatValue';


const Table = (props:any) => {


  const gridRef = useRef<any>(null);
  const includeRowSelect = props.includeRowSelect || false
  const selectedRows = props.selectedRows || null; 
  const onCellClicked = props.onCellClicked || null;
  const onCellEdit = props.onCellEdit || null
  const onRowSelected = props.onRowSelected || null; // New prop for row selection callback
  const formatHeader = props.formatHeader || false;

  const [rowData, setRowData] = useState([...props.data]);

  const tableFieldOptions = props.tableFieldOptions || [];
  const hiddenColumns = props.hiddenColumns || []
  const columnDefs = [];

  useEffect(() => {
    setRowData(props.data);
  }, [props.data]);


  if (includeRowSelect){
    const selectField = {
      field: "select",
      headerName: "Include",
      cellStyle: { textAlign: 'center' },
      width: 100,
      editable: true,
      cellRenderer: 'agCheckboxCellRenderer',
      resizable: false,
      suppressSizeToFit: true,
    };
    columnDefs.push(selectField)
  }

  if (rowData.length > 0) {

    Object.keys(rowData[0]).forEach((field) => {
      
      if (!hiddenColumns.includes(field)){

        const fieldOptions = tableFieldOptions.find((item:any) => item.name === field);
      
        columnDefs.push({
          field: field,
          headerName: formatHeader ? toProperCase(field.replace(/["_"]/g," ")) : field,
          editable: true,
          sortable: true,
          filter: true,
          cellEditor: fieldOptions  ? 'agSelectCellEditor' : 'agTextCellEditor',
          cellEditorParams: fieldOptions  ? { values: fieldOptions.options } : null,
          minWidth: 25,
          maxWidth: 300,
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


  const gridOptions:any = {
    rowClassRules: {
      'selected-row': (params: any) => params.node.isSelected(),
    },
    rowSelection: {
      mode: 'multiRow',        
      rowCheckboxSelection: true,  
      headerCheckboxSelection: true 
    },
    onFirstDataRendered: (params: any) => {
      selectedRows && rowData.forEach((row, rowIndex) => {
        const isSelected = selectedRows.some((selectedRow: any) => selectedRow["id"] === row["id"]);
        if (isSelected) {
          params.api.getDisplayedRowAtIndex(rowIndex)?.setSelected(true);
        }
      });
      gridRef.current?.columnApi?.autoSizeAllColumns();
    },
  };
  
  


  const handleSelectionChange = (event:any) => {
    const source = event.source
    const updatedSelection = event.api.getSelectedNodes().map((node:any) => node.data);
    if ((source ==="checkboxSelected" ||source ==="uiSelectAll") && JSON.stringify(updatedSelection) !== JSON.stringify(selectedRows)) {
      onRowSelected(updatedSelection);
    }
  };


  const handleCellClick = (e:any) => {
    if (typeof onCellClicked === "function") {
      onCellClicked(e.data);
    }
  };
  

  const handleCellEdit = (e:any) => {
    if(typeof onCellEdit === "function"){
      onCellEdit(e.data)
    }
  };

  return (
    <div
      className="transtion duration-500" 
      style={{ height: "100%", width:"100%" }}>
        <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            animateRows={true}
            onCellClicked={handleCellClick}
            onSelectionChanged={handleSelectionChange}
            onCellValueChanged={handleCellEdit}
            gridOptions = {gridOptions}
        />
    </div>
  )
}

export default Table
