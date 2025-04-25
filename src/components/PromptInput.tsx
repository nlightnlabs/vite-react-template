import {useState} from 'react'
import { useSelector } from 'react-redux';
import VoiceRecorder from './VoiceRecord.js';
import * as styleFunctions from '../functions/styleFunctions.js'
import Svg from './Svg.js'
import * as mainApi from '../apis/pythonServerApi.js'
import { config } from '../config.js';

interface propTypes{
  userInput:string,
  setUserInput: (text:any)=>void
  setResponse: (text:any)=>void
  currentTopic:string,
  setCurrentTopic: (text:any)=>void
  chatHistory:any,
  setChatHistory: (text:any)=>void
  topics:any,
  setTopics: (text:any)=>void
  
}


const PromptInput = ({userInput, setUserInput, setResponse, currentTopic, setCurrentTopic, chatHistory, setChatHistory, topics, setTopics}:propTypes) => {

  const theme = useSelector((state:any)=>state.main.theme)
  const user = useSelector((state:any)=>state.main.user)

  const [recording, setRecording] = useState(false)
  const [LLM, setLLM] = useState("oomniellm")
  const [data, setData] = useState(null)
  const [recordIconFileName, setRecordIconFileName] = useState("MicrophoneIcon")
  
  const handleChange = (e:any)=>{
    setUserInput(e.target.value)
  }

  const handleSubmit = async () => {
    setResponse("");
    let topic = currentTopic || "";
    let streamedResponse = "";
  
    const chatRecord = {
      id: chatHistory.length + 1,
      user: user.id,
      prompt: userInput,
      topic: topic,
      response: "",
      created_at: new Date().toISOString()
    };
  
    setChatHistory([...chatHistory, chatRecord]);
  
    const chunk = await mainApi.askGPT(userInput, data, LLM)
    streamedResponse += chunk
    setResponse((prev:any) => prev + chunk); // Incremental rendering

    setChatHistory((prevChatHistory:any) => {
      const updatedHistory = [...prevChatHistory];
      updatedHistory[updatedHistory.length - 1] = {
        ...updatedHistory[updatedHistory.length - 1],
        response: streamedResponse,
      };
      return updatedHistory;
    });
  
    try {
      if (topic === "") {
        const topicPrompt = `
        General inference: Provide a title for the following text, 
        focusing on the text itself without adding interpretations or answers:\n"""\n[${userInput}]\n"""\n\n
        Include the title only and limit the length of the title to 10 words or less.
        `;
        const topicResponse:any = await mainApi.askGPT(topicPrompt, data, LLM)
        const topicText = (await topicResponse.text()).replace(/["']/g, "");
        topic = topicText.trim();
        chatRecord.topic = topic;
        setCurrentTopic(topic);
  
        setChatHistory((prevChatHistory:any) => {
          const updatedHistory = [...prevChatHistory];
          updatedHistory[updatedHistory.length - 1] = {
            ...updatedHistory[updatedHistory.length - 1],
            topic: topic,
          };
          return updatedHistory;
        });

        setTopics([topic,...topics])
      }
  
      chatRecord.response = streamedResponse;
      chatRecord.topic = topic;
      delete chatRecord.id;
      delete chatRecord.created_at;
      await mainApi.addRecords("chats", chatRecord);

    } catch (error) {
      console.error("Error fetching streamed data:", error);
    }
  };
  

  const handleRecord = async ()=>{

    const filename = recording ? "MicrophoneIcon" : "StopRecordingIcon"
    setRecordIconFileName(filename)
    setRecording(!recording)

  }

  const handleReset = ()=>{
 
    setUserInput("")
    setResponse("")
    setData(null)
  }

  return (

        <div className={`panel-theme-${theme} p-3 h-auto rounded-md fade-in`}>

          <div className={`flex w-full items-center h-auto`}>
      
            <div onClick={()=>handleRecord()} title={recording ? "Stop Recording" : "Record"}>
                <Svg
                  iconName ={recordIconFileName}
                  height = "30px"
                  width = "30px"
                  fillColor = {recording ? "red" : styleFunctions.getColor(`icon-color-theme-${theme}`)}
                  fillOpacity = {1}
                />
            </div>

            <div
              className={`flex w-full items-center bg-theme-${theme} rounded-lg transition duration-500 m-1`}
            >
              {!recording && <input
                id="prompt" 
                name="prompt"
                value = {userInput}
                placeholder = "Ask something..."
                className={`flex w-full items-center outline-none text-[rgb(0,150,225)] bg-[rgba(0,0,0,0)] rounded-lg p-3 transition duration-500`}
                style={{height: "auto"}}
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
                setRecording={setRecording} 
                setTranscription={setUserInput}
              />

            </div>

            

            <div onClick={()=>handleSubmit()} title="Generate" className="flex items-center justify-center p-2">
              <Svg
                iconName ="SendIcon"
                height = "30px"
                width = "30px"
                fillColor = {styleFunctions.getColor(`icon-color-theme-${theme}`)}
                fillOpacity = {1}
              />
            </div>

            <div onClick={()=>handleReset()} title="Reset">
              <Svg
                iconName ="RefreshIcon"
                height = "30px"
                width = "30px"
                fillColor = {styleFunctions.getColor(`icon-color-theme-${theme}`)}
                fillOpacity = {1}
              />
            </div>
        </div>
          
        
          <div className={`flex p-1 h-100`}>
       
              <div 
                className={`${LLM ==="oomniellm" ? "pill-theme-"+theme+"-clicked" : "pill-theme-"+theme}`}
                onClick={(e)=>setLLM("oomniellm")}
                >
                  Oomnie LLM
                </div>
                <div 
                className={`${LLM ==="chatgpt" ? "pill-theme-"+theme+"-clicked" : "pill-theme-"+theme}`}
                onClick={(e)=>setLLM("chatgpt")}
                >
                  ChatGPT
                </div>

                {LLM==="chatgpt" && 
                <div className={`flex items-center text-orange-400 mt-1 ms-1 text-[12px] fade-in`}>
                  <div className="flex items-center justify-center rounded-full bg-orange-400 text-white text-[20px] w-[24px] h-[24px] text-center font-bold me-1">!</div>
                  <div>Data you share with ChatGPT is not private.</div>
                </div>
                }  

          </div>

        </div>

  )
}

export default PromptInput
