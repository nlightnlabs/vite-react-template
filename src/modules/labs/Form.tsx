import {useState, useEffect} from 'react'
import MultiInput from "../../components/MultiInput.tsx"
import * as mainApi from '../../apis/pythonServerApi.ts'
import Svg from '../../components/Svg.tsx'
import * as styleFunctions from '../../functions/styleFunctions.ts'

const Form = () => {


  const [edit, setEdit] = useState(false)


  const [formData, setFormData] = useState<any>([
    {name: "name", label: "Name", value: "", required: true, type: "text", list: null, reference: {tableName: "users", fieldName: "first_name"}},
    {name: "company", label: "Company", value: "", required: true, type: "text", list: null, reference: {tableName: "accounts", fieldName: "account_name"}},
    {name: "email", label: "Email", value: "", required: true, type: "text", list: null, reference: {tableName: "users", fieldName: "email"}},
    {name: "date_of_birth", label: "Date of Birth", value: "", required: false, type: "date", list: null, reference: null},
    {name: "Time", label: "Time", value: "", required: false, type: "time", list: null, reference: null},
    {name: "notes", label: "Notes", value: "", required: false, type: "textarea", list: null, reference: null}
  ])

  const handleInputChange = (e:any)=>{
    const {name, value} = e.target;
    setFormData((prev:any) => {
      const updatedData = prev.map((item:any) => {
        if (item.name === name) {
          return {...item, value};
        }
        return item;
      });
      return updatedData;
    })
  }


  const getList = async (item: any) => {
    if (item.reference) {
      const tableName = item.reference.tableName;
      const fieldName = item.reference.fieldName;
      try {
        const response = await mainApi.getList(tableName, fieldName);
        let updatedFormData = [...formData];
        updatedFormData.find((formItem: any) => formItem.name === item.name).list = response;
        setFormData(updatedFormData)
      } catch (error) {
        console.error("Error fetching list:", error)
      }
    }
  };

  useEffect(() => {
    formData.forEach((item: any) => {
      if (item.reference) {
        getList(item);
      }
    });
  }, []); 


  const handleCancel = () => {
    setFormData((prev:any) => {
      const updatedData = prev.map((item:any) => {
        return {...item, value: ""};
      });
      return updatedData;
    })
  }
  const handleSubmit = () => {
    const dataToSubmit = formData.reduce((acc:any, item:any) => {
      acc[item.name] = item.value;
      return acc;
    }, {});
    console.log("Submitting data:", dataToSubmit);
    // Here you can add your API call to submit the data  
    // For example:
    // mainApi.submitData(dataToSubmit)
  }

  const handleEdit = () => {
    setEdit(!edit)
  }
  
  return (
    <div className="page flex-col w-full p-3">

      <label className="title mt-2">Sample Form</label>

        <div className="form w-[500px]">

          <div className="flex w-full justify-end cursor-pointer">

            <div 
              className="h-[30px] w-[30px] cursor-pointer mb-5 item-center"
              onClick={handleEdit}
              >
              <Svg 
                iconName="EditIcon"
                fillColor={styleFunctions.getColor("icon")}
              />
            </div>

          </div>

          {formData.map((item:any, index:number) => {
            return (
              <MultiInput
                key={index}
                name={item.name}
                label={item.label}
                value={item.value}
                onChange={handleInputChange}
                required={item.required}
                type={item.type}
                list={item.list ? item.list : null}
                className="w-full"
                wrapperClassName="w-full"
              />
            )
          })}
      <div className="flex w-full justify-end">
        <button 
          className="secondary-button"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button 
          className="primary-button ms-2"
          onClick={handleSubmit}
          >
            Submit
          </button>
      </div>

      </div>



    </div>
  )
}

export default Form
