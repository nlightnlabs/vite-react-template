import {useState, useEffect} from 'react'
import * as mainApi from '../apis/pythonServerApi'
import FloatingPanel from './FloatingPanel'
import MultiInput from './MultiInput'


interface propTypes {
    tableName:string, 
    data:any,
    dataModel:any, 
    setDisplayForm:any, 
    hiddenFields?:string[]
}

const NewRecordForm = ({tableName, data, dataModel, setDisplayForm, hiddenFields}:propTypes)=>{
    
    const [formData, setFormData] = useState<any>({})
    const [successMessage, setSuccessMessage] = useState<any>(null)

    useEffect(() => {

      console.log(dataModel)
    
        let updatedFormData = formData
        dataModel.map((item:any)=>{
            updatedFormData = {...updatedFormData,...{[item.field_name]: {label: item.label, value: ""}}}
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
      const {name, value} = e.target
      const updatedValue = {...formData[name],...{"value":value}}
      setFormData({...formData,...{[name]:updatedValue}})
    }

    const handleSubmit = async ()=>{
      const response = await mainApi.addRecords(tableName,formData)
      setSuccessMessage("New record has successfully been added")
    }

    return(
      <div className="flex flex-col w-full mb-[150px] p-3">
  
        <div className="w-full overflow-y-auto">
        {formData && Object.entries(formData).map(([k,v]:any, index)=>(
          <MultiInput
            key={index} 
            label={v.label}
            name={k}
            value={v.value}
            onChange={handleInputChange}
          />
        ))}
        </div>


        {/* Submit Button */}
        <div className="flex w-full justify-end mt-3">
          <button className="secondary-button m-1" onClick={()=>setDisplayForm(false)}>Cancel</button>
          <button className="primary-button m-1" onClick={()=>handleSubmit()}>Submit</button>
        </div>

        {successMessage &&
        <FloatingPanel displayPanel={setDisplayForm}>
            <div className="flex w-full justify-center items-center text-[16px]">{successMessage}</div>
        </FloatingPanel>
        }

      </div>

    )
}

export default NewRecordForm
