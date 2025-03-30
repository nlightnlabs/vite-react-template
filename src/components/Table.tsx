import {useState, useEffect, useRef} from 'react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { toProperCase } from '../functions/formatValue';


const Table = (props:any) => {


  const gridRef = useRef<any>(null);
  const includeRowSelect = props.includeRowSelect || false
  const selectedRows = props.selectedRows; // The updated list of selected staffing records
  const onCellClicked = props.onCellClicked || null;
  const onCellEdit = props.onCellEdit || null
  const onRowSelected = props.onRowSelected || null; // New prop for row selection callback
  const formatHeader = props.formatHeader || false;

  const [rowData, setRowData] = useState([...props.data]);

  const tableFieldOptions = props.tableFieldOptions || [];
  const hiddenColumns = props.hiddenColumns || []
  const columnDefs = [];

  useEffect(()=>{
    setRowData(props.data)
  },[props.data])


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
          headerName: formatHeader ? toProperCase(field.replace(/["_"]/g," ")) : field,
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
  

  const handleCellEdit = (params:any) => {
    if(typeof onCellEdit === "function"){
      onCellEdit(params)
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
        />
    </div>
  )
}

export default Table
