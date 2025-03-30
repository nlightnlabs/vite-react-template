import {useState, useEffect} from 'react'
import Table from "../../components/Table.tsx"
import * as mainApi from "../../apis/pythonServerApi.ts"
import Svg from '../../components/Svg.tsx'
// import * as styleFunctions from '../../functions/styleFunctions.ts'
import NewRecordForm from '../../components/NewRecordForm.tsx'
import FloatingPanel from '../../components/FloatingPanel.tsx'



const RecordManager = () => {

  const [tableList, setTableList] = useState<any>([])
  const [tableName, setTableName] = useState<string>("")
  const [currentCell, setCurrentCell] = useState<any>(null)
  const [currentRow, setCurrentRow] = useState<any>(null)

  const [hoveredControl, setHoveredControl] = useState<any>(null)
  const [hoveredItem, setHoveredItem] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [viewRecord, setViewRecord] = useState<any>(null)
  const [showNewRecordForm, setShowNewRecordFrom] = useState<any>(null)

  
  const [data, setData] = useState([])
  const [dataModel, setDataModel] = useState([])

  const getTableList = async ()=>{
    const list = await mainApi.getAllTables()
    // setTableList(lust)
    // setData(response[0])
    // const list = ["purchase_orders","invoices","users"]
    setTableList(list)
    getData(list[0])
  }

  const getData = async (tableName:string)=>{
    const response = await mainApi.getTable(`public.${tableName}`)
    setData(response)

    console.log(`data_models.${tableName}_data_model`)
    const response2 = await mainApi.getTable(`data_models.${tableName}_data_model`)
    setDataModel(response2)
    
  }

  useEffect(()=>{
    getTableList()
  },[])

  useEffect(()=>{
    tableName.length > 0 && getData(tableName)
  },[tableName])

  const tableFieldOptions:any = []
  const hiddenColumns:string[] = ["id","record_created", "pwd", "password"]

  const handleCellClick = (selectedCell:any)=>{
    console.log("selectedCell", selectedCell)
    setCurrentCell(selectedCell)
  }

  const handleCellEdit = (selectedCell:any)=>{
    console.log("selectedCell", selectedCell)
    const [id, value] = selectedCell
    setCurrentCell({...currentCell,...{[id]:value}})
  }

  const handleRowSelect = (selectedRow:any)=>{
    console.log("selectedRow", selectedRow)
    setCurrentRow(selectedRow)
  }

  const handleViewRecord = ()=>{
    setViewRecord(true)
  }

  const handleAddRecord = ()=>{
    setShowNewRecordFrom(true)
  }

  const handleDeleteRecords = async(selectedRecords:[])=>{
    let whereClause:any = []
    selectedRecords.map((item:any)=>{
      whereClause.push(`"id" === '${item.id}'`)
    })
    whereClause = whereClause.join(' or ');
    const response = await mainApi.deleteRecord(tableName, whereClause)
    console.log(response)
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
          
          {  /* Controls */}
          <div className="top-menu justify-end mb-3 panel">
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
        <div className="side-menu w-[200px] h-[100%]">
        {tableList.length> 0 && tableList.map((item:any, index:number)=>(
              <div 
                key={index} 
                className={selectedItem && selectedItem.id ===item.id ? "top-menu-item-selected": "top-menu-item"}
                onClick={()=>setTableName(item)}
                >
                {item}
              </div>
          ))}
        </div> 

      </div>

      {showNewRecordForm && 
      <div className="absolute top-0 left-0 w-[200vw] h-[200vh] bg-[rgba(0,0,0,0.5)]">
        <FloatingPanel displayPanel={setShowNewRecordFrom}>
          <div className="flex w-[50vw] h-[80vh] overflow-hidden p-3">
            <NewRecordForm 
              tableName={tableName} 
              dataModel={data[0]} 
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
