import {useState, useEffect} from 'react'
import FileDrop from '../../components/FileDrop.tsx'

import * as mainApi from '../../apis/pythonServerApi'
import FloatingPanel from '../../components/FloatingPanel.tsx'


const SendEmail = () => {

  const [emailSuccess,setEmailSuccess] =useState<any>(null)

  const [formData, setFormData] = useState<any>({
    to_email: [],
    cc: [],
    bcc: [],
    from_email: "",
    subject: "",
    message: "",
    attachments: []
  })

  const handleInputChange = (e:any)=>{
    const {name, value} = e.target
    let valueType:string = typeof formData[name]
    if(valueType === "object"){
      let list:string[] = []
      list[0] = value
      setFormData({...formData,...{[name]:list}})
    }else{
      setFormData({...formData,...{[name]:value}})
    }
  }

  const handleAttachments = (files:any)=>{
    setFormData({...formData,...{"attachments":files}})
  }

  const convertFileToBase64 = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // includes MIME header
      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          content: reader.result, // base64 string like data:image/png;base64,...
        });
      };
      reader.onerror = reject;
    });
  };


  const handleSendEmail = async ()=>{
    let updatedFormData = formData
    Object.entries(formData).map(([k,v]:any)=>{
    if(typeof v ==="object" && k !="attachments" && v.length>0){
        let list= v[0].split(",")
        updatedFormData = {...formData,...{[k]:list}}
    }})

    const processedAttachments = await Promise.all(
      (updatedFormData.attachments).map((file:any) => convertFileToBase64(file))
    );

    updatedFormData = {...updatedFormData,...{"attachments":processedAttachments}}
    const response = await mainApi.sendEmail(updatedFormData)
    setEmailSuccess(response.status)
  }

  return (
    <div className="page flex-col overflow-y-auto items-center">
    
    <div className="form mb-[100px] mt-5 w-full max-w-1/2">
  
        <div className="flex flex-col w-full mb-1 mt-1">
          <label>To:</label>
          <input name="to_email" type="text" autoComplete="off" value={formData.to_email} onChange={(e)=>handleInputChange(e)}></input>
        </div>

        <div className="flex flex-col w-full mb-1 mt-1">
          <label>CC:</label>
          <input name="cc" type="text" autoComplete="off" value={formData.cc} onChange={(e)=>handleInputChange(e)}></input>
        </div>

        <div className="flex flex-col w-full mb-1 mt-1">
          <label>BCC:</label>
          <input name="bcc" type="text" autoComplete="off" value={formData.bcc} onChange={(e)=>handleInputChange(e)}></input>
        </div>

        <div className="flex flex-col w-full mb-1 mt-1">
          <label>Subject:</label>
          <input name="subject" type="text" autoComplete="off" value={formData.subject} onChange={(e)=>handleInputChange(e)}></input>
        </div>

        <div className="flex flex-col w-full mb-1 mt-1">
          <label>Message:</label>
          <textarea name="message" autoComplete="off" value={formData.message} onChange={(e)=>handleInputChange(e)}></textarea>
        </div>


        <FileDrop handleAttachments={handleAttachments} />

        {/* Submit Button */}
        <div className="flex w-full justify-end">
          <button className="primary-button" onClick={()=>handleSendEmail()}>Send</button>
        </div>

        {emailSuccess && 
        <FloatingPanel displayPanel={()=>setEmailSuccess(null)}>
          <div className="flex text-[var(--primary-color)] text-[20px] h-[150px] w-[300px] items-center justify-center">
            {emailSuccess}
          </div>
        </FloatingPanel>
        }
       
        
    </div>
    </div>
  )
}

export default SendEmail
