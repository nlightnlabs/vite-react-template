import {useState, useEffect} from 'react'
import * as mainApi from '../apis/pythonServerApi'
import FloatingPanel from './FloatingPanel'

interface propTypes {
    tableName:string, 
    dataModel:object, 
    setDisplayForm:any, 
    hiddenFields?:string[]
}

const NewRecordForm = ({tableName, dataModel, setDisplayForm, hiddenFields}:propTypes)=>{
    
    const [formData, setFormData] = useState<any>({})
    const [successMessage, setSuccessMessage] = useState<any>(null)

    useEffect(() => {
    
        let updatedFormData = formData
        Object.keys(dataModel).map((key:string)=>{
            updatedFormData = {...updatedFormData,...{[key]:""}}
        })

        if (hiddenFields && hiddenFields.length >0){
            (hiddenFields).forEach((item:string)=>{
                if(updatedFormData[item]){
                    delete updatedFormData[item]
                }
            })
        }
        setFormData(updatedFormData)
        
    }, []);

    const handleInputChange = (e:any)=>{
      const [name, value] = e.target
      setFormData({...formData,...{[name]:value}})
    }

    const handleSubmit = async ()=>{
      const response = await mainApi.addRecord(tableName,formData)
      console.log(response)
      setSuccessMessage("New record has successfully been added")
    }

    return(
      <div className="flex flex-col w-full h-auto mb-[150px] p-3">
        
        {/* Submit Button */}
        <div className="flex w-full justify-end">
          <button className="primary-button" onClick={()=>handleSubmit()}>Submit</button>
        </div>

        {formData && Object.entries(formData).map(([k,v]:any, index)=>(
          <div key={index} className="flex flex-col w-full mb-1 mt-1">
            <label>{k}</label>
            <input name={k} type="text" autoComplete="off" value={v} onChange={(e)=>handleInputChange(e)}></input>
        </div>
        ))}

        {successMessage &&
        <FloatingPanel displayPanel={setDisplayForm}>
            <div className="flex w-full justify-center items-center text-[16px]">{successMessage}</div>
        </FloatingPanel>
        }

      </div>

    )
}

export default NewRecordForm
