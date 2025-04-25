

// src/App.tsx
import {useState, useEffect} from 'react';
import {
  BarChart, Bar,
  Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

import VoiceInput from '../../components/VoiceInput';

const sampleData = [
  { name: 'A', value: 400, value2: 240 },
  { name: 'B', value: 300, value2: 456 },
  { name: 'C', value: 300, value2: 139 },
  { name: 'D', value: 200, value2: 980 },
];

const sampleInsights = [
    {id: 1, name: "insight_1", insight:"This is the first insight into this analysis", link:""},
    {id: 2, name: "insight_2", insight:"This is the second insight into this analysis", link:""},
    {id: 3, name: "insight_3", insight:"This is the third insight into this analysis", link:""}
  ]

  const sampleSuggestions = [
    {id: 1, name: "suggestion_1", suggestion:"This is the first suggestion for this analysis", link:""},
    {id: 2, name: "suggestion_2", suggestion:"This is the second suggestion for this analysis", link:""},
    {id: 3, name: "suggestion_3", suggestion:"This is the third suggestion for this analysis", link:""}
  ]

const App = (props:any) => {

  const [data, setData] = useState(sampleData)
  const [dataKey, setDataKey] = useState("value")
  const [chartTitle, setChartTitle] = useState("Key Takeaway About This Chart")
  const [insights, setInsights] = useState(sampleInsights)
  const [suggestions, setSuggestions] = useState(sampleSuggestions)

  const width = props.width || 800
  const height = props.height || 550
  const verticalAxisTitle = props.verticalAxisTitle || "Value"
  const horizontalAxisTitle = props.horizontalAxisTitle || "Category"
  const beginColor = props.beginColor || "rgb(0,200,255)"
  const endColor = props.endColor || "rgb(0,100,200)"
  const opacity = props.opacity || 0.6

  const [prompt, setPrompt] = useState<any>(null)
  const [response, setResponse] = useState<any>(null)

  const handleValueClick = (data:any, index:number)=>{
    console.log("value clicked", data, index)
  }

  const handleShowMoreInsights = ()=>{
    console.log("Show more insights")
  }

  const handleShowMoreSuggestions = ()=>{
    console.log("Show more suggestions")
  }

  const handleUpdateAnalysis = (response:any)=>{
    console.log("updated analysis:",response)
  }

  useEffect(()=>{
    if(response){
        handleUpdateAnalysis(response)
    }
  },[response])

  return (
    <div className="panel flex-col me-3" style={{height: height, width: width}}>
        <label className="chart-title">{chartTitle}</label>
        <div className="flex w-full h-[100%]">
            <BarChart width={0.6*width} height={0.75*height} data={data} margin={{ top: 10, right: 10, bottom: 50, left: 10 }}>
                <XAxis dataKey="name" label={{ value: horizontalAxisTitle, position: 'insideBottom', fill: 'black', fontWeight:"bold", offset: -20 }} />
                <YAxis label={{ value: verticalAxisTitle, angle: -90, position: 'insideLeft', fill: '#333', fontWeight:"bold" }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={beginColor} stopOpacity={opacity} />
                        <stop offset="100%" stopColor={endColor} stopOpacity={opacity} />
                    </linearGradient>
                </defs>
                <Bar 
                    dataKey={dataKey}
                    fill="url(#barGradient)"
                    label={{ fill: '#888', position: 'top' }} 
                    onClick={(data, index) => {
                        console.log('Clicked on bar:', data);
                        handleValueClick(data, index);
                      }}
                    />
            </BarChart>

            <div className="flex flex-col w-1/3">

            {insights.length>0 &&
            <div 
                className="text-[14px] rounded-md p-2 mb-1"
            >
                <label className="text-[18px] font-bold">Key Insights</label>
                <div className="w-full p-3">
                    {(insights.slice(0, 3)).map((item:any)=>(
                        <div className="chart-insight">
                            <span className="me-2">{'\u25AA'}</span>
                            <div key={item.id}>{item.insight}</div>
                        </div>
                       ))
                    }
                {suggestions.length>3 && 
                <div 
                    className="w-full text-center cursor-pointer transition duration-300 mt-[10px] text-[var(--secondary-color)]" 
                    onClick={()=>handleShowMoreInsights()}>
                        See More
                </div>
                }
                </div>
            </div>
            }

            {suggestions.length>0 &&
            <div 
                className="text-[14px] rounded-md p-2 mb-1"
            >
                <label className="text-[18px] font-bold">Suggested Actions</label>
                <div className="w-full p-3">
                    {(suggestions.slice(0, 3)).map((item:any)=>(
                        <div className="chart-insight">
                            <span className="me-2">{'\u25AA'}</span>
                            <div key={item.id}>{item.suggestion}</div>
                        </div>
                       ))
                    }
                {suggestions.length>3 && 
                <div 
                    className="w-full text-center cursor-pointer transition duration-300 mt-[10px] text-[var(--secondary-color)]" 
                    onClick={()=>handleShowMoreSuggestions()}>See More
                </div>
                }
                </div>
            </div>
            }
            </div>
        </div>
        
        <div className="flex w-full border-t-[1px] border-[var(--border-color)]">
            <div className="flex w-1/2">
                <VoiceInput
                label=""
                value={prompt} 
                setValue={setPrompt}
                setResponse={setResponse}
                />
            </div>

            <div className="flex w-1/2 h-[100%]">
                <div className="pill">asdfasd</div>
            </div>

        </div>
        
    </div>
  );
};

export default App;



