import {useState, useEffect, useRef} from 'react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import {useSelector} from 'react-redux';
import {config} from '../config.ts'

const Table = (props:any) => {

  const theme:string = useSelector((state:any) => state.main.theme);
  const agGridTheme:string = config.themes.find((item:any) => item.name === theme)?.ag_grid || "ag-theme-alpine"; 

  const gridRef = useRef<any>(null);
  const selectedRows = props.selectedRows || null; 
  const onCellClicked = props.onCellClicked || null;
  const onCellEdit = props.onCellEdit || null
  const onRowSelected = props.onRowSelected || null; // New prop for row selection callback

  const [rowData, setRowData] = useState([...props.data]);
  const [dataModel, setDataModel] = useState([...props.dataModel]);

  const tableFieldOptions = props.tableFieldOptions || [];
  const hiddenColumns = props.hiddenColumns || []
  const columnDefs:any[] = [];

  useEffect(() => {
    setRowData(props.data);
    setDataModel(props.dataModel)
  }, [props.data, props.dataModel]);

  if (rowData.length > 0) {

    dataModel.forEach((field) => {
      
      if (!hiddenColumns.includes((field.field_name))){

        const fieldOptions = tableFieldOptions.find((item:any) => item.name === field.field_name);
        fieldOptions && console.log("fieldOptions", fieldOptions)

        columnDefs.push({
          field: field.field_name,
          headerName: field.label,
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
      className={`${agGridTheme} transtion duration-300`} 
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
