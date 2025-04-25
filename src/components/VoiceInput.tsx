import {useState} from 'react'
import { useSelector } from 'react-redux';
import VoiceRecorder from './VoiceRecord.tsx';
import * as styleFunctions from '../functions/styleFunctions.js'
import Svg from './Svg.tsx'
import * as mainApi from '../apis/pythonServerApi.ts'

interface propTypes{
  label:string, 
  value:string, 
  setValue: (text:any)=>void
  setResponse: (text:any)=>void
}

const VoiceInput = ({label, value, setValue, setResponse}:propTypes) => {

  const theme = useSelector((state:any)=>state.main.theme)

  const [inputHeight, setInputHeight] = useState<any>("auto")
  const [transcription, setTranscription] = useState<any>(null)
  const [recording, setRecording] = useState<any>(false)
  const [LLM, setLLM] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [recordIconFileName, setRecordIconFileName] = useState<any>("MicrophoneIcon")
  
  const handleChange = (e:any)=>{
    setValue(e.target.value)
  }

  const handleSubmit = async () => {
    const userInput = value
    let streamedResponse = "";
    const chunk = await mainApi.askGPT(userInput, data, LLM)
    streamedResponse += chunk
    setResponse((prev:any) => prev + chunk); // Incremental rendering
  };
  

  const handleRecord = async ()=>{
    const filename = recording ? "MicrophoneIcon" : "StopRecordingIcon"
    setRecordIconFileName(filename)
    setRecording(!recording)
  }

  const handleReset = ()=>{
    setTranscription("")
    setValue("")
    setResponse("")
    setData(null)
  }

  return (

        <div className={`panel-theme-${theme} p-3 h-auto rounded-md fade-in w-full`}>

          <div className={`flex w-full items-center h-auto`}>
      
            <div onClick={()=>handleRecord()} title={recording ? "Stop Recording" : "Record"}>
                <Svg
                  iconName ={recordIconFileName}
                  height = "30px"
                  width = "30px"
                  fillColor = {recording ? "red" : styleFunctions.getColor(`icon`)}
                  fillOpacity = {1}
                />
            </div>

            <div
              className={`flex w-full items-center bg-theme-${theme} rounded-lg transition duration-500 m-1`}
            >
              {!recording && 
              <input
                id="prompt" 
                name="prompt"
                value = {value}
                placeholder = {label}
                className={`flex w-full items-center outline-none text-[rgb(0,100,225)] bg-[rgba(0,0,0,0)] rounded-lg p-3 transition duration-500`}
                style={{height: inputHeight}}
                onChange = {(e)=>handleChange(e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(); // Call your handleSubmit function
                  }
                }}
                autoComplete="off"
              />}

              <VoiceRecorder 
                recording={recording} 
                setTranscription={setValue}
              />

            </div>

            <div onClick={()=>handleSubmit()} title="Generate" className="flex items-center justify-center p-2">
              <Svg
                iconName ="SendIcon"
                height = "30px"
                width = "30px"
                fillColor = {styleFunctions.getColor(`icon`)}
                fillOpacity = {1}
              />
            </div>

            <div onClick={()=>handleReset()} title="Reset">
              <Svg
                iconName ="RefreshIcon"
                height = "30px"
                width = "30px"
                fillColor = {styleFunctions.getColor(`icon`)}
                fillOpacity = {1}
              />
            </div>
        </div>

        </div>

  )
}

export default VoiceInput
