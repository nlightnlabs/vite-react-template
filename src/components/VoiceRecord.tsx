import { useState, useEffect, useRef } from 'react';
import * as mainApi from '../apis/pythonServerApi.js';
import * as styleFunctions from '../functions/styleFunctions.js';
import {useSelector} from 'react-redux'

interface propTypes{
  recording: any,
  setRecording: (recording:any)=>void
  setTranscription: (transcription:any)=>void
}

const VoiceRecorder = ({ recording, setTranscription }:propTypes) => {

  const theme = useSelector((state:any)=>state.main.theme)

  const [audioChunks, setAudioChunks] = useState<any>([]);
  const mediaRecorderRef = useRef<any>(null); // Use useRef for mediaRecorder
  const canvasRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);

  // let audioChunks = []

  // Start recording
  const startRecording = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Ensure supported MIME type
    mediaRecorderRef.current = recorder;
    setAudioChunks([]); // Clear previous chunks
    analyser.fftSize = 2048;
  
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        setAudioChunks((prev:any) => [...prev, e.data]);
      }
    };
  
    recorder.start();
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  
    visualizeWaveform();
  };
  

  // Stop recording
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      // Collect all audio chunks and process them when recording stops
      recorder.ondataavailable = (e:any) => {
        if (e.data && e.data.size > 0) {
          const audioBlob = new Blob([e.data], { type: 'audio/webm' }); // Create Blob directly
          console.log("Audio Blob:", audioBlob);
          console.log("Audio Blob Size:", audioBlob.size);
  
          if (audioBlob.size > 0) {
            transcribeAudio(audioBlob); // Pass the blob for transcription
          } else {
            console.error("No audio data captured.");
          }
        }
      };
  
      recorder.onstop = () => {
        console.log("Recording stopped.");
      };
  
      recorder.stop();
  
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    } else {
      console.error("MediaRecorder is not initialized.");
    }
  };
  
  

  // Visualize waveform
  const visualizeWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      if (!recording || !analyser) return;

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = styleFunctions.getColor(`bg-color-theme-${theme}`);
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 1.5;
      canvasCtx.strokeStyle = 'red';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      requestAnimationFrame(draw);
    };

    draw();
  };

  // Transcribe audio
  const transcribeAudio = async (audioBlob:any) => {
    console.log("transcribing audio")
    try {
      const response = await mainApi.convertAudioToText(audioBlob);
      console.log(response);
      setTranscription(response);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  // React to `recording` prop changes
  useEffect(() => {
    console.log("Recording state changed:", recording);
    if (recording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [recording]); // Trigger on recording state change

  return (
    recording && 
      <div className={`flex w-full h-[50px] p-1 overflow-hidden fade-in text-center justify-center`}>
        <canvas
          ref={canvasRef}
          className={`flex w-[90%] h-[90%] overflow-hidden`}
        ></canvas>
    </div>
  );
};

export default VoiceRecorder;
