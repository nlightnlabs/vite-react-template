import {useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import "../i18n.ts"
import { useSelector } from 'react-redux'
import * as mainApi from '../apis/pythonServerApi.ts'
import MultiInput from './MultiInput'


const RelationalObject = () => {

const { t } = useTranslation("relational_objects")
const [tableList, setTableList] = useState<any>([])
const [primaryObject, setPrimaryObject] = useState<any>(null)
const [secondaryObject, setSecondaryObject] = useState<any>(null)

const getTableList = async()=>{
    const response = await mainApi.getAllTables()
    console.log("table list", response)
    setTableList(response)
}
useEffect(()=>{
    getTableList()
}
,[])

const lookupPrimaryObjectFields = async(primaryObject:string)=>{
    const response = await mainApi.getTable(primaryObject)
    console.log("primary object fields", response)
    setPrimaryObject(response)
}

  return (
    <div>
      <MultiInput
        label="Primary Object"
        name="primaryObject"
        value={primaryObject}
        onChange={(e:any)=>setPrimaryObject(e.target.value)}
        list={tableList}
    />
    </div>
  )
}

export default RelationalObject
