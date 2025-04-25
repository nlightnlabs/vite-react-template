import {useState, useEffect, useRef} from 'react'
import * as styleFunctions from '../functions/styleFunctions'
import * as formatValue from '../functions/formatValue'
import DatePicker from 'react-datepicker'


const MultiInput = (props:any) => {

const updateParent  = props.onChange
const list = props.list || []
const [options, setOptions] = useState([])

const name:string = props.name || ""
const label:string = props.label || ""
const type:string = props.type || "text"

const rows:any = props.rows || 20

const [value, setValue] = useState(props.value || "")
const [showDropdown, setShowDropdown] = useState(false)

const classNameMain = props.classNameMain || `multiinput-maincontainer`
const classNameInput = props.classNameInput || `multiinput-input`
const classNameTextArea = props.classNameTextArea || `multiinput-textarea`
const classNameLabel = props.classNameLabel || `multiinput-label`
const classNameDropdown = props.classNameDropdown || `multiinput-choice-list`
const classNameOption = props.classNameOption || `multiinput-option`
const placeholder = props.placeholder || ""

const required:boolean = props.required || false
const disabled:boolean = props.disabled || false
const readonly:boolean = props.readonly || false

const dropdownRef = useRef<HTMLDivElement>(null)


useEffect(()=>{
    setValue(props.value)
},[props.value])

useEffect(()=>{

if (props.list && props.list.length>0){
    props.list
    setOptions(props.list)
    }
},[])


const [inputData, setInputData] = useState({})
const inputRef = useRef<HTMLInputElement>(null);
const textAreaRef = useRef<HTMLTextAreaElement>(null);
const labelRef = useRef<HTMLInputElement>(null);


const [labelStyle, setLabelStyle] = useState({});




const handleInputClick = ()=>{
    if(list.length>0 && !showDropdown){
        setOptions(list)
        setShowDropdown(true)
    }else{
        setShowDropdown(false)
    }

    const labelFontSizeNum = parseFloat(styleFunctions.getFontSize(classNameLabel));
    const valueFontSizeNum = parseFloat(styleFunctions.getFontSize(classNameInput));

    setLabelStyle({
        fontSize: `${labelFontSizeNum * 0.75}px`, 
        transform: `translateY(-${valueFontSizeNum-5}px)`, // Move up by input font size
        transition: 'font-size 0.3s ease, transform 0.3s ease' // Smooth transition
      });
}

const handleLeave = ()=>{
    setShowDropdown(false)
}

const changeLabelFontSize = (value:any) =>{

    const labelFontSizeNum = parseFloat(styleFunctions.getFontSize(classNameLabel));
    const valueFontSizeNum = parseFloat(styleFunctions.getFontSize(classNameInput));

    if(value && value.toString().length>0){
        setLabelStyle({
        fontSize: `${labelFontSizeNum * 0.75}px`,       // Shrink by 75%
        transform: `translateY(-${valueFontSizeNum-5}px)`, // Move up by input font size
        transition: 'font-size 0.3s ease, transform 0.3s ease' // Smooth transition
      });
    }

    else{
        setLabelStyle({
                fontSize: `${labelFontSizeNum}px`,      
                transform: `translateY(0)`,
                transition: 'font-size 0.3s ease, transform 0.3s ease'
            });
        }
}

useEffect(()=>{
    changeLabelFontSize(value)
},[value])



const handleInputChange = (e:any)=>{
   
    let {name, value} = e.target
    setValue(value)

    let filteredOptions = []
    if (value.length > 0) {
        filteredOptions = options.filter(item=>
            item && String(item).toLowerCase().includes(value.toLowerCase())
        );
        setOptions(filteredOptions)
    } else {
        setOptions(list)
    }
    
    setInputData({...inputData,"name": name, "value":value})
    if(typeof(updateParent) === "function"){
        updateParent(e)
    }      
}


const handleOptionClick = (item:any)=>{
    console.log(item)
    setValue(item)

    const e = {
        target: {
            name: name,
            value: item
        }
    }
    setShowDropdown(false)
    handleInputChange(e)
}



const handleMouseLeave = ()=>{
    setShowDropdown(false)
    if(type =="textarea" || "date"){
        changeLabelFontSize(value)
    }
}

const buildDateFromTime = (timeString:string) => {
    if (!timeString || typeof timeString !== "string") return null;
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const now = new Date();
    now.setHours(hours);
    now.setMinutes(minutes);
    now.setSeconds(seconds || 0);
    now.setMilliseconds(0);
    return now;
  };


  return (
        <div 
            className={`${classNameMain}`} 
            onMouseLeave = {()=>handleMouseLeave()}
            onClick = {()=>handleInputClick()}
        > 
            <div
                ref = {labelRef}
                className={`${classNameLabel}`}
                style={labelStyle}
            >
                {`${label}`} <span style={{color: "red"}}>{`${required ? "*" : ""}`}</span>
            </div>
            {type ==="textarea"?
                <textarea
                    ref={textAreaRef} 
                    className={classNameTextArea}
                    name={name}
                    placeholder={placeholder}
                    value = {value ? formatValue.formatInput(value, type) : ""}
                    onChange = {(e)=>handleInputChange(e)}
                    onClick = {()=>handleInputClick()}
                    readOnly = {readonly}
                    disabled = {disabled}
                    autoComplete="off" 
                    rows={rows}
                />
            :
            type ==="date" || type=="datetime" || type=="time"?
            <DatePicker
                className="w-full h-[50px] border-none focus:ring-0 focus:outline-none bg-transparent"
                wrapperClassName="w-full h-[50px] border-none focus:ring-0 focus:outline-none bg-transparent"
                name={name}
                selected={
                    type === "time"
                      ? buildDateFromTime(value) // convert "HH:mm:ss" to Date
                      : value
                      ? new Date(value) // ISO string, date, datetime
                      : null
                  }
                onChange={(date) => {
                    if (!date) {
                    handleInputChange({ target: { name, value: null } });
                    return;
                    }

                    let formatted;
                    if (type === "date") {
                    formatted = date.toISOString().split("T")[0]; // "2025-04-02"
                    } else if (type === "datetime") {
                    formatted = date.toISOString(); // "2025-04-02T07:00:00.000Z"
                    } else if (type === "time") {
                    formatted = date.toISOString().split("T")[1].split("Z")[0].split(".")[0]; // "07:00:00"
                    } else {
                    formatted = date;
                    }

                    handleInputChange({ target: { name, value: formatted } });
                }}
                dateFormat={
                    type === "date"
                    ? "MM/dd/yyyy"
                    : type === "datetime"
                    ? "MM/dd/yyyy h:mm aa"
                    : type === "time"
                    ? "h:mm aa"
                    : "MM/dd/yyyy"
                }
                showTimeSelect={type === "datetime" || type === "time"}        // 👈 Needed for time picker
                showTimeSelectOnly={type === "time"}                           // 👈 Time-only mode
                timeIntervals={15}
                timeCaption="Time"
                autoComplete="off"
            />
            :
            <input 
                ref={inputRef} 
                className={classNameInput}
                name={name}
                placeholder={placeholder}
                value = {value ? formatValue.formatInput(value, type) : ""}
                type={type ==="password" ? "password" : "text"}
                onChange = {(e)=>handleInputChange(e)}
                onClick = {()=>handleInputClick()}
                readOnly = {readonly}
                disabled = {disabled}
                autoComplete="off" 
            />
            }
            {showDropdown && options.length>0 &&  type !=="date" &&
                <div id="dropdown" ref={dropdownRef} className={classNameDropdown} onMouseLeave={()=>handleLeave()}>
                    {options.map((item,index)=>(
                        <div 
                            key={index} 
                            className={`${classNameOption} fade-in`}
                            onClick={()=>handleOptionClick(item)}
                            >
                            {item}
                        </div>
                    ))}
            </div>
            }
        </div>
  )
}

export default MultiInput
