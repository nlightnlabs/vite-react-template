import {useState, useEffect} from 'react'
import {useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import {setCurrentUser, setTheme} from '../redux/slices/mainSlice.js'
import * as formatValue from '../functions/formatValue.ts'

import Svg from '../components/Svg.js';
import FileUpload from '../components/FileUpload.js'
import FloatingPanel from '../components/FloatingPanel.js'

import * as styleFunctions from '../functions/styleFunctions.js'

import {config} from "../config.ts"

import * as mainApi from "../apis/pythonServerApi.ts"

const Settings = () => {

  const dispatch = useDispatch()

  const theme = useSelector((state:any) => state.main.theme);
  const user = useSelector((state:any) => state.main.currentUser);
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false)
  const [photo, setPhoto] = useState<any>()
  const themes = config.themes

  const [formData, setFormData] = useState(user)
  const [loginFormData, setLoginFormData] = useState<any>({
    username: user.username,
    password: "",
    confirm_password: "",
  })

  const [passwordErrorMessage, setPasswordErrorMessage] = useState<any>(null)
  const [loginUpdateSuccess, setLoginUpdateSuccess] = useState<any>(null)
  const [loginUpdateFail, setLoginUpdateFail] = useState<any>(null)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<any>(null)
  const [profileUpdateFail, setProfileUpdateFail] = useState<any>(null)

  useEffect(()=>{
    const userProfile = {...user}
    const {id, record_created, pwd, full_name, username, access,photo_url, user_type, ...filteredUser} = userProfile
    setFormData(filteredUser)
  },[])

  const updateProfile = async ()=>{

    console.log(formData)

    const payload = {
      tableName: "users", 
      columns: Object.keys(formData), 
      values: Object.values(formData), 
      whereClause: `"username" = '${user.username}'`, 
      dbName: config.dbName
    }
    try{
      const response = await mainApi.updateRecord(payload)
      dispatch(setCurrentUser(response))
      setProfileUpdateSuccess("Profile successfully updated.")
    }catch(error){
      setProfileUpdateFail("Unable to update profile")
    }
  }




  const updateLogin = async ()=>{
    
    let updatedData = loginFormData

    if(updatedData.password.length>1 && updatedData.password !== updatedData.confirm_password){
      setPasswordErrorMessage("Passwords do not match")
      return
    }

    else if(updatedData.password.length<=1){
      delete updatedData.password
      delete updatedData.confirm_password
      const payload = {
        tableName: "users", 
        columns: Object.keys(formData), 
        values: Object.values(formData), 
        whereClause: `"email" = '${user.email}'`, 
        dbName: config.dbName
      }
      try{ 
        const response = await mainApi.updateRecord(payload)
        
        setLoginUpdateSuccess("User login successfully updated.")
      }catch(error){
        setLoginUpdateFail("Unable to update user login.")
      } 
      
    }

    else{
      try{
        const response = await mainApi.resetPassword(user.username, loginFormData.password)
        setLoginUpdateSuccess("User login successfully updated.")
      }catch(error){
        setLoginUpdateFail("Unable to update user login.")
      }
    }
  }

  const handleLoginInputChange = (e:any)=>{
    
    setPasswordErrorMessage(null)
    setLoginUpdateSuccess(null)
    setLoginUpdateFail(null)
    const {name, value} = e.target
    setLoginFormData({...loginFormData,...{[name]:value}})
  }

  const handleInputChange = (e:any)=>{
    setProfileUpdateSuccess(null)
    setProfileUpdateFail(null)
    const {name, value} = e.target
    setFormData({...formData,...{[name]:value}})
  }


  const previewPhoto = (attachments:any[])=>{
    const file = attachments[0]
    if (file.type.search("image/")>=0){
      const url:string = URL.createObjectURL(file)
      setPhoto(url)
    }else{
      setPhoto(null)
    }
    
  }

  return (
     
      <div className="page">  

          {/* Forms Section */}
          <div className="flex flex-col w-full md:max-w-[800px] items-center m-auto">

            {/* Environment & Login Information */}
            <div className="flex flex-col w-full">

                <div className="form mb-3 border-[1px]">
                  <h4>Environment</h4>
                  <div className="flex flex-col w-full mb-3">
                    <label>Theme:</label>
                    <select value={theme} onChange={((e)=>dispatch(setTheme(e.target.value)))}>
                      {themes.length>0 && themes.map((item:any)=>(
                        <option key={item.id} value={item.name}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                
                </div>
          
                <div className="form mb-3 w-full">
                  <h4>Login Information</h4>
                  
                    <div className="flex flex-col w-full mb-3">
                      <label>Username:</label>
                      <input name="username" type="text" autoComplete="off" value={loginFormData.username} onChange={(e)=>handleLoginInputChange(e)}></input>
                    </div>

                    <div className="flex flex-col w-full mb-3">
                      <label>Password:</label>
                      <input name="password" type="password" autoComplete="off" value={loginFormData.password} onChange={(e)=>handleLoginInputChange(e)}></input>
                    </div>

                    <div className="flex flex-col w-full mb-3">
                      <label>Confirm Password:</label>
                      <input name="confirm_password" type="password" autoComplete="off" value={loginFormData.confirm_password} onChange={(e)=>handleLoginInputChange(e)}></input>
                    </div>

                    {passwordErrorMessage && <div className="flex text-red-500 mt-1 float-down">{passwordErrorMessage}</div>}
                    {loginUpdateFail && <div className="flex text-red-500 mt-1 float-down">{loginUpdateFail}</div>}
                    {loginUpdateSuccess && <div className="flex text-green-500 mt-1 float-down">{loginUpdateSuccess}</div>}
                    
                    {/* Submit Button */}
                    <div className="flex w-full justify-end mt-3">
                      <button className="primary-button" onClick={()=>updateLogin()}>Update</button>
                    </div>
                </div>

            </div>  

            {/* Profile Information */}
            <div className="flex flex-col w-full mb-[100px]">
              <div className="form">
              
                <h4>Profile Information</h4>

                    <div
                      className="profile-photo cursor-pointer"
                      onClick={()=>setShowFileUpload(true)}
                      title="Edit Photo"
                    >

                      {!photo ? 
                      <Svg
                        iconName="ImageIcon"
                        fillColor={styleFunctions.getColor("icon")}
                      />
                      :
                      <img 
                        src={photo} 
                        style={{height: "100%", width: "100%", objectFit: "cover"}}
                        alt="photo"
                      />
                      }
                    </div>
                  
               
               {Object.entries(formData).map(([key,val],index)=>(
                   <div key={index} className="flex flex-col w-full mb-3">
                    <label>{formatValue.toProperCase(key.toString().replace("_"," "))}</label>
                    <input 
                      name={key}
                      type="text" 
                      autoComplete="off" 
                      value={typeof val ==="number"? Number(val) : String(val)}
                      onChange={(e)=>handleInputChange(e)}></input>
                 </div>
               ))

               }

              {profileUpdateFail && <div className="flex text-red-500 mt-5 float-down">{profileUpdateFail}</div>}
              {profileUpdateSuccess && <div className="flex text-green-500 mt-5 float-down">{profileUpdateSuccess}</div>}

               {/* Submit Button */}
               <div className="flex w-full justify-end">
                  
                  <button className="primary-button" onClick={()=>updateProfile()}>Update</button>
                </div>

              </div>
            </div>

          </div>

     
        {showFileUpload &&
          <div className={`absolute left-[-100%] top-[-100%] flex w-[200%] h-[200%] bg-[rgba(0,0,0,0.5)] z-[9999]`}>
            <FloatingPanel title="Select Files To Upload" displayPanel={setShowFileUpload} allowDrag={false}>
              <FileUpload />
            </FloatingPanel>
          </div>
        }
      </div>
 
  )
}

export default Settings

