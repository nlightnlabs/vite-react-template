import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css' // ✅ Make sure this line is included

const Sandbox = () => {
  const [formData, setFormData] = useState<any>({
    date: null, // ✅ Use null instead of an empty string
  })

const handleChange=(date:any)=>{
  console.log(date)
  setFormData((prevState:any) => ({
    ...prevState,
    date: date,
  }))
}



  return (
    <div className="flex w-full">
      <DatePicker
        selected={formData.date}
        onChange={handleChange}
        dateFormat="MM/dd/yyyy"
        placeholderText="Select a date"
        autoComplete="off"
        className="w-full"
        wrapperClassName="w-full"
      />
    </div>
  )
}

export default Sandbox
