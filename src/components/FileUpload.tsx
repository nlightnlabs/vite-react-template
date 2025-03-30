import { useState } from "react";
import * as mainApi from "../apis/pythonServerApi.js"
import { useSelector } from "react-redux";

const DragAndDropUploader = () => {
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState("");

  const user:any = useSelector((state:any)=>state.main.currentUser)

  const handleSubmmit = async ()=>{
     // Upload file to S3

     const bucketName = "oomnielabs"
     const folder=`images/users/${user.id}_${user.first_name}_${user.last_name}`
     console.log(uploadedFiles)

    try{
        const response = await mainApi.uploadFiles(bucketName, folder, uploadedFiles)
        console.log(response)
        setMessage("File uploaded successfully!");
    } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("File upload failed.");
    }
  }


  const handleFileChange = (event: any) => {
    const attachments:any = Array.from(event.target.files);
    console.log(attachments)
    setUploadedFiles(attachments);
  };


  return (
    <div className="flex flex-col w-[500px] h-auto p-3 items-center overflow-hidden bg-gray-200">
 
        <div className="flex flex-col w-full h-[100%] justify-start">
          <input
            className="bg-[rgba(0,0,0,0)] border-[rgba(0,0,0,0)]"
            type="file"
            onChange={handleFileChange}
            multiple
          />
          {uploadedFiles.length>0 &&
            <div className="flex w-full flex-col h-[200px] justify-start overflow-y-auto">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                {uploadedFiles.map((file:any, index) => (
                  <tr key={index}>
                    <td>{file.name}</td>
                    <td>{file.type}</td>
                    <td>{file.size}</td>
                  </tr>
                ))}
                </tbody>
              </table>
              {message && <p>{message}</p>}
            </div>
          }
        </div>

    <button className="primary-button mt-3" onClick={()=>handleSubmmit()}>Upload</button>

    </div>
  );
};

export default DragAndDropUploader;
