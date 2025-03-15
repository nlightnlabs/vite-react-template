import axios from "axios";

import * as formatValue from '../functions/formatValue.ts'

export const baseURL = process.env.NODE_ENV==="production" ? "https://nlightnlabs.net/dealprep" : "http://localhost:8001"

// export const baseURL = "https://oomnielabs.com/node"
export const serverConnection = axios.create({
  baseURL,
})

const dbName = "main"
export const s3Bucket = "nlightnlabs01"
export const images = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/icons/images"
export const icons = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/icons/icons"
export const s3url = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/mysalesteam"
export const s3RootFolder = "pitchPrep"

// Run python app
export const pythonApp = async (app_name:string, main_function:string, parameters:Object) =>{

  console.log(app_name)
  console.log(main_function)
  console.log(parameters)

    try {
      const response = await serverConnection.post('/runApp', { app_name, main_function, parameters });
      console.log(response); 
      return response.data;
    } catch (error) {
      console.error('Error calling the Python app:', error);
      throw error;  // Optionally rethrow the error for further handling
  }
  }

//General Query
export const getData = async (query:string)=>{
  try{
    const result = await serverConnection.post("/db/query",{query, dbName})
    //console.log(result)
    const data = await result.data
    return (data)
  }catch(error){
    console.log(error)
  }
}


//Get Table
export const getTable = async (tableName:string)=>{
    
    try{
      const response = await serverConnection.post(`/db/query`,{tableName, dbName})
      // console.log(response)
      return (response.data)
    }catch(error){
      console.log(error)
    }
  }


//Get List
export const getList = async (tableName:string, fieldName:string)=>{
  
  try{
    const response = await serverConnection.post(`/db/list`,{tableName, fieldName, dbName})
    return (response.data)
  }catch(error){
    console.log(error)
  }
}

//Create New Record
export const addRecord = async (tableName:string, columnValues:Object)=>{
  
  if(tableName.length > 0 && Object.entries(columnValues).length>0){
    try{
      const result = await serverConnection.post("/db/insert",{tableName, columnValues})
      console.log(result)
      const data = await result.data
      return (data)
    }catch(error){
      console.log(error)
    }
  }else{
    alert("Please provide information for the new record")
  }
}

//Update Record
export const updateRecord = async (tableName:string, columnValues:Object, conditions:Object)=>{
    try{
      const result = await serverConnection.post("/db/update",{tableName, columnValues, conditions})
      return result.data
    }catch(error){
      console.log(error)
    }
}

//Delete Record
export const deleteRecord = async (tableName:string,condition:Object)=>{

  try{
    const result = await serverConnection.post("/db/delete",{tableName,condition})
    //console.log(result)
    const data = await result.data
    return (data)
  }catch(error){
    //console.log(error)
  }
}


//Get list of all tables in database:
export const getAllTables = async()=>{
  const query= `SELECT table_name FROM information_schema.tables where table_schema = 'public';`
  try{
    const result = await serverConnection.post("/db/query",{query})
    return result.data
  }catch(error){
    console.log(error)
  }
}

// show columsn
export const getColumnData = async(tableName:string)=>{

  const query= `SELECT column_name as name, data_type FROM information_schema.COLUMNS where TABLE_NAME = N'${tableName}';`
  try{
    const result:any = await serverConnection.post("/db/query",{query})
    const data:any = result.data

    let fieldList:string[] = [] 
      data.map((item:any)=>{
        fieldList.push(item.name)
      })
    return ({data: data, fieldList:fieldList})
  }catch(error){
    console.log(error)
  }
}



//Authenticate User
export const authenticateUser = async (params:Object)=>{

  // console.log(params)

  const body = {...params,...{"dbName":dbName}}

  try{
    const submitLoggin = await serverConnection.post("/db/authenticateUser",body)
    const userValidated = submitLoggin.data
    return userValidated
  }catch(error){
      console.log(error)
  }
}

//Get User Info
export const getUserInfo = async (username:string)=>{
  // console.log(username)
  try{
    const getUserQuery = await serverConnection.post("/db/userRecord",{username})
    // console.log(getUserQuery)
    const getUserQueryResonse = await getUserQuery.data;
    return getUserQueryResonse
  }catch(error){
    console.log(error)
  }
}

//Reset User Password
export const addUser = async (params:Object)=>{

  try{
    const result = await serverConnection.post("/db/addUser",{params})
    //console.log(result)
    const data = await result.data
    return (data)
  }catch(error){
    //console.log(error)
  }
}


//Reset User Password
export const resetPassword = async (req:any)=>{

  const params = {
    tableName: req.tableName,
    idField: req.idField,
    recordId: req.recordId,
    formData: req.formData
  }

  try{
    const result = await serverConnection.post("/db/updateRecord",{params})
    //console.log(result)
    const data = await result.data
    return (data)
  }catch(error){
    //console.log(error)
  }
}


//Send Email
export const sendEmail = async (to:string, subject:string, message:string, htmlPage:string)=>{
    
  try{
    const result = await serverConnection.post("/sendEmail",{to, subject, message, htmlPage})
    // console.log(result)
    const data = await result.data
    return (data)
  }catch(error){
    // console.log(error)
  }
}

//Ask GPT
//Ask GPT
export const askGPT = async (userInput:string, data:any, llm:string)=>{

  const llmUrl = llm === "oomniellm" ? "/oomniellm": "openai/chatgpt";
  let chunk = ""

  try{
    const response:any = await fetch(`${baseURL}/${llmUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: userInput, data: data }),
    });

    const reader:any = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunk += decoder.decode(value);
      return chunk
    }

  }catch(error){
    console.log(error)
  }
}

//Generate Image
export const generateImage = async (prompt:string)=>{

  try{
    const result = await serverConnection.post("/openai/dalle/image",{prompt})
    // console.log(result)
    return (result.data[0].url)
  }catch(error){
    // console.log(error)
  }
}


//Scan Document
export const scanInvoice = async (documentText:string, record:Object)=>{
  
  const prompt = `The following is an invoice received from a supplier: ${documentText}. Fill in the values in this javascript object: ${JSON.stringify(record)} based on the information in the invoice. Leave a value blank if it can not be determined based on the invoice document received. Return response as javascript object. Be sure to return a properly structured json object with closed brackets and array sub elements if needed.`

  try{
    const result = await serverConnection.post("/openai/chatgpt",{prompt})
    return (JSON.parse(result.data))
  }catch(error){
    // console.log(error)
  }
}




export const convertAudioToText = async (audioBlob:any) => {

  console.log('audioBlob:', audioBlob); // Log audioBlob to check its content

// Create a new FormData object
const formData = new FormData();
// Append data to the formData object
formData.append('file', audioBlob, 'audio.wav');

  try {
    const response = await serverConnection.post('/openai/whisper', formData)
    return response.data.text
  } catch (error) {
    console.error('Error sending data to backend:', error);
  }
 
};




//Upload files to AWS S3
export const uploadFiles = async (bucketName:string=s3Bucket,folder:string=s3RootFolder, attachments:any[])=>{
  
  let updatedAttachments:Object[] = []

  if (attachments){
  
    try {
      await Promise.all(attachments.map(async (file) => {

        const fileName = file.name
        const getUrl = await serverConnection.post(`/aws/getS3FolderUrl`, {bucketName, folder, fileName});
        const url = await getUrl.data;
        console.log(url)
        const fileUrl = await url.split("?")[0];

        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file.data
        });

        let updatedFile = {...file, ...{["url"]: fileUrl}};
        delete updatedFile.data
        updatedAttachments.push(updatedFile)
      }));

      return updatedAttachments

    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }else{
    console.log("No attachments provided")
  }


}


export const getFiles = async (bucket:string, folderPath:string)=>{

  const params = {
    bucketName: bucket || s3Bucket,
    path: folderPath || s3RootFolder
  }

  try {
      const response = await serverConnection.post(`/aws/getFiles`, params);
      const data = await response.data;
      let files:Object[] = []
      data.forEach((item:any) => {
        const key = item.file.Key
        const fileName = key.split('/').pop(); // Get the file name
        const fileType = fileName.split('.').pop(); // Get the file type
        if (fileName.length>0){
            files.push({
            name: fileName, 
            type: fileType, 
            size: formatValue.formatFileSize(item.file.Size), 
            last_modified: formatValue.UTCToLocalDateTime(item.file.LastModified), 
            owner: item.file.Owner.DisplayName, 
            url: item.url.split("?")[0],
            key: key, 
            file_data: item.file_data,
            meta_data: item.meta_data
          })
        }
      });

      return files
  } catch (error) {
      console.error("Error uploading file:", error);
  }
}



export const deleteFiles = async (bucket:string, files:any[])=>{

  let status = "OK"
  try{
    await Promise.all(files.map(async (item) => {
      const params = {
        Bucket: bucket || s3Bucket,
        Key: item.key,
      }
        const response = await serverConnection.post('/aws/deleteFile', params);
        if(response.statusText !="OK"){
          status = response.statusText
        }
    }));
    return status
  }catch(error){
    console.error("Error deleting file:", error);
    return error
  }
   
}


export const generateDocx = async (generatedDoc:any) => {

  try {
    const response = await serverConnection.post(
      "/generate-docx",
      { html: generatedDoc },
      {
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Type': 'application/json'
        },
        responseType: 'blob'  // Ensures response is treated as a blob
      }
    );

    console.log("generatedDoc response", response);

    // Create a blob object from the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    
    // Create a link element and trigger the download manually
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'documentation.docx';
    link.click();

    // Cleanup: Revoke the object URL to release memory
    window.URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error("Error downloading DOCX:", error);
  }

};
