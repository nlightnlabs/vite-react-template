import {useState} from 'react'
import {useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import {setCurrentUser, setTheme} from '../redux/slices/mainSlice.js'

import Svg from '../components/Svg.js';
import FileUpload from '../components/FileUpload.js'
import FloatingPanel from '../components/FloatingPanel.js'

import * as styleFunctions from '../functions/styleFunctions.js'

const Settings = () => {

  const navigateTo = useNavigate()
  const dispatch = useDispatch()

  const theme = useSelector((state:any) => state.main.theme);
  const user = useSelector((state:any) => state.main.currentUser);
  const [errorMessage, setErrorMessage] = useState(null)

  const [formData, setFormData] = useState(user)
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false)
  const [photo, setPhoto] = useState<any>()


  const updateUser = async ()=>{
    dispatch(setCurrentUser(formData))
    navigateTo("/home")
  }

  const handleInputChange = (e:any)=>{
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
     
      <div className="page fade-in justify-center">  

        <div className="flex flex-col w-[80%]">

          {/* Submit Button */}
          <div className="flex w-full justify-end">
            <button className="primary-button" onClick={()=>updateUser()}>Submit</button>
            {errorMessage && <div className="flex text-red-500 mt-5">{errorMessage}</div>}
          </div>


          {/* Forms Section */}
          <div className="flex justify-between">

            {/* Environment & Login Information */}
            <div className="flex flex-col w-[50%] m-3">

                <div className="form mb-3 border-[1px]">
                  <h4>Environment</h4>
                  <div className="flex flex-col w-full mb-3">
                    <label>Theme:</label>
                    <select value={theme} onChange={((e)=>dispatch(setTheme(e.target.value)))}>
                      <option value="root">Default</option>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                
                </div>
          
                <div className="form mb-3">
                  <h4>Login Information</h4>
                    <div className="flex flex-col w-full mb-3">
                      <label>Username:</label>
                      <input name="username" type="text" autoComplete="off" value={formData.username} onChange={(e)=>handleInputChange(e)}></input>
                    </div>

                    <div className="flex flex-col w-full mb-3">
                      <label>Password:</label>
                      <input name="password" type="password" autoComplete="off" value={formData.password} onChange={(e)=>handleInputChange(e)}></input>
                    </div>
                </div>

            </div>  

            {/* Profile Information */}
            <div className="flex flex-col w-[50%] m-3">
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
                  
               

                <div className="flex flex-col w-full mb-3">
                  <label>First Name:</label>
                  <input name="first_name" type="text" autoComplete="off" value={formData.first_name} onChange={(e)=>handleInputChange(e)}></input>
                </div>

                <div className="flex flex-col w-full mb-3">
                  <label>Last Name:</label>
                  <input name="last_name" type="text" autoComplete="off" value={formData.last_name} onChange={(e)=>handleInputChange(e)}></input>
                </div>

                <div className="flex flex-col w-full mb-3">
                  <label>email:</label>
                  <input name="email" type="email" autoComplete="off" value={formData.email} onChange={(e)=>handleInputChange(e)}></input>
                </div>

                <div className="flex flex-col w-full mb-3">
                  <label>Phone:</label>
                  <input name="phone" type="text"  autoComplete="off" value={formData.phone} onChange={(e)=>handleInputChange(e)}></input>
                </div>

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

