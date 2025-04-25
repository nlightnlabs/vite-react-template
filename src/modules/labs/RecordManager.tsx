import {useState, useEffect} from 'react'
import Table from "../../components/Table.tsx"
import * as mainApi from "../../apis/pythonServerApi.ts"
import Svg from '../../components/Svg.tsx'
// import * as styleFunctions from '../../functions/styleFunctions.ts'
import NewRecordForm from '../../components/NewRecordForm.tsx'
import FloatingPanel from '../../components/FloatingPanel.tsx'
import { toProperCase } from '../../functions/formatValue.ts'




const RecordManager = () => {

  const [tableList, setTableList] = useState<any>([])
  const [tableName, setTableName] = useState<string>("")
  const [currentCell, setCurrentCell] = useState<any>(null)
  const [currentRow, setCurrentRow] = useState<any>(null)

  const [hoveredControl, setHoveredControl] = useState<any>(null)
  const [hoveredItem, setHoveredItem] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any>(null)
  const [viewRecord, setViewRecord] = useState<any>(null)
  const [showNewRecordForm, setShowNewRecordFrom] = useState<any>(null)

  
  const [data, setData] = useState([])
  const [dataModel, setDataModel] = useState([])

  const getTableList = async ()=>{
    const list:string[] = await mainApi.getAllTables()
    setTableName(list[0])

    setTableList([
      ...tableList,
      ...list.map((item,index)=>(
        {
          id: index, 
          name: item, 
          label: toProperCase(item.replace(/["_"]/g," "))
        }
      ))])

    getData(list[0])
  }

  const getData = async (tableName:string)=>{
    const response = await mainApi.getTable(tableName)
    setData(response)
    const response2 = await mainApi.getTable(`${tableName}_data_model`, "data_models")
    setDataModel(response2)
    
  }

  useEffect(()=>{
    getTableList()
  },[])

  useEffect(()=>{
    tableName.length > 0 && getData(tableName)
  },[tableName])

  const tableFieldOptions:any = [
    {id:1, name: "status", options: ["Active", "Closed"]}
  ]

  const hiddenColumns:string[] = ["id","record_created", "pwd", "password"]

  const handleCellClick = (selectedCell:any)=>{
    console.log(selectedCell)
    setCurrentCell(selectedCell)
  }


  const handleCellEdit = async (selectedRow:any)=>{
    
    console.log("selectedRow", selectedRow)
    setCurrentRow(selectedRow)

    const response = await mainApi.updateRecords(tableName,[selectedRow],[{id:selectedRow.id}], dataModel)
    console.log(response)
  }

  const handleRowSelect = (selectedRows:any)=>{
    console.log("selectedRow", selectedRows)
    setSelectedItems(selectedRows)
  }

  const handleViewRecord = ()=>{
    setViewRecord(true)
  }

  const handleAddRecord = ()=>{
    setShowNewRecordFrom(true)
  }

  const handleDeleteRecords = async()=>{
    let whereClause:any = []
    console.log(selectedItems)
    selectedItems.map((item:any)=>{
      whereClause.push({id: item.id})
    })
    const response = await mainApi.deleteRecords(tableName, selectedItems, whereClause)
    console.log(response)
    if(response.status=="OK"){
      getData(tableName)
    }
  }

  const controlsMenu = [
    {id: 1, iconName: "ViewIcon", iconColor:"gray", action: handleViewRecord},
    {id: 2, iconName: "AddIcon", iconColor: "green", action: handleAddRecord},
    {id: 3, iconName: "TrashIcon", iconColor: "red", action: handleDeleteRecords}
  ]

  return (
    <div className="flex flex-col w-full h-[100%] overflow-y-auto p-3">

      <div className="flex w-full h-[100%] justify-between">
    
        <div className="flex flex-col w-full p-3">
          <div className="flex w-full flex-col transition duration-500">
            {/* <h2 className="text-[var(--color)]">{toProperCase(tableName.replace(/["_"]/g," "))}</h2>
            <p className="text-[var(--secondary-color)]">{data.length} Records, {Object.keys(data[0]).length} Columns</p> */}
          </div>

          {  /* Controls */}
          <div className="top-menu justify-end mb-3 panel mt-3">
          {controlsMenu.length>0 && controlsMenu.map((item:any)=>(
            <div 
            className="flex items-center justify-center h-[30px] w-[30px] m-1 transition duration-500 cursor-pointer"
            key={item.id}
            onClick={item.action}
            onMouseOver={()=>setHoveredControl(item)}
            onMouseLeave={()=>setHoveredControl(null)}
            style={
              hoveredControl && hoveredControl.id === item.id ? 
              {...{transform:"scale(1.2)"}} : 
              {...{transform:"scale(1)"}} }
            >
              <Svg
                iconName={item.iconName}
                fillColor={item.iconColor}
              />
          </div>
          ))
            
          }
          </div>
        
          {/* Table */}
          <div className="flex w-full h-[80%] overflow-hidden p-3 panel">
            {data.length>0 ?
              <Table
                data = {data}
                dataModel = {dataModel}
                includeRowSelect = {true}
                selectedRows = {null}
                formatHeader = {true}
                onCellClicked = {handleCellClick}
                onCellEdit = {handleCellEdit}
                onRowSelected = {handleRowSelect}
                tableFieldOptions = {tableFieldOptions}
                distributeColumns = {true}
                suppressSizeToFit = {true}
                hiddenColumns = {hiddenColumns}
            />
            :
            <div className="flex w-full justify-center items-center">
              <h2>No data available</h2>
            </div>
            }
          </div>
        </div>

        {/* List of Tables */}
        <div className="flex flex-col w-[200px] h-[100%]">
        {tableList.length> 0 && 
          tableList.map((item:any)=>(
              <div 
                key={item.id} 
                className={selectedItem && selectedItem.id ===item.id ? "top-menu-item-selected": "top-menu-item"}
                onClick={()=>{setSelectedItem(item); setTableName(item.name); }}
                >
                {item.label}
              </div>
          ))}
        </div> 

      </div>

      {showNewRecordForm && 
      <div className="absolute top-0 left-0 w-[200vw] h-[200vh] bg-[rgba(0,0,0,0.5)]">
        <FloatingPanel title={`Add New ${tableName}`} displayPanel={setShowNewRecordFrom}>
          <div className="flex w-[50vw] h-[80vh] overflow-hidden p-3">
            <NewRecordForm 
              tableName={tableName}
              data = {data[0]}
              dataModel={dataModel} 
              setDisplayForm={setShowNewRecordFrom}
              hiddenFields={hiddenColumns}
            />
          </div>
        </FloatingPanel>
      </div>
      }
      </div>
      
    
  )
}

export default RecordManager
