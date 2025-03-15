import React, {useState, useEffect, useRef} from 'react'
import { useSelector } from 'react-redux';
import * as styleFunctions from '../functions/styleFunctions'
import * as formatValue from '../functions/formatValue'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const MultiInput = (props) => {

const updateParent  = props.onChange
const list = props.list || []
const [options, setOptions] = useState([])
const theme = useSelector(state=>state.main.theme)

const id = props.id || ""
const name = props.name || ""
const label = props.label || ""
const type = props.type || "text"

const labelSize = props.labelSize || 14
const valueSize = props.valueSize || 14
const labelColor = props.labelColor || null
const valueColor = props.valueColor || null

const width = props.width || null
const height = props.height || 50
const rows = props.rows || 20

const [value, setValue] = useState(props.value || "")
const [showDropdown, setShowDropdown] = useState(false)

const classNameMain = props.classNameMain || `input-maincontainer-theme-${theme}`
const classNameInput = props.classNameInput || `input-input-theme-${theme}`
const classNameLabel = props.classNameLabel || `input-label-theme-${theme}`
const classNameDropdown = props.classNameDropdown || `input-dropdown-theme-${theme}`
const classNameOption = props.classNameOption || `input-option-theme-${theme}`
const placeholder = props.placeholder || ""

const required = props.required || false
const disabled = props.disabled || false
const readonly = props.readonly || false
const abbreviate = props.abbreviate || false

const dropdownRef = useRef()


useEffect(()=>{
    setValue(props.value)
},[props.value])

useEffect(()=>{
if (props.list && props.list.length>0){
    setOptions(props.list)
    }
},[])


const [inputData, setInputData] = useState({})
const inputRef = useRef(null)
const labelRef = useRef(null);
const [inputProps, setInputProps] = useState({ 
    width: props.width || "100%", 
    height: props.labelFontSize + props.valueFontSize + 15 || 50, 
    top: 0, 
    left: 0,
    padding: 5
});

const [mainContainerStyle, setMainContainerStyle] = useState({
    height: `${height}px`,
    width: `${width}px`
})
const [labelStyle, setLabelStyle] = useState({});
const [inputFontStyle, setInputFontStyle] = useState({
    textAlign: "left",
});

useEffect(() => {

  if (inputRef.current) {
    const { width, height, top, left } = inputRef.current.getBoundingClientRect();
    setInputProps({ width, height, top, left });
  }

}, []); 


const handleInputClick = ()=>{
    if(list.length>0 && !showDropdown){
        setOptions(list)
        setShowDropdown(true)
    }else{
        setShowDropdown(false)
    }

    const labelFontSizeNum = parseFloat(styleFunctions.getFontSize(classNameLabel));
    setLabelStyle({
        fontSize: `${labelFontSizeNum * 0.75}px`,       // Shrink by 50%
        transform: `translateY(-${labelFontSizeNum-5}px)`, // Move up by input font size
        transition: 'font-size 0.3s ease, transform 0.3s ease' // Smooth transition
      });
}


const handleLeave = (e)=>{
    setShowDropdown(false)
}

const changeLabelFontSize = (value) =>{

    const labelFontSizeNum = parseFloat(styleFunctions.getFontSize(classNameLabel));

    if(value && value.toString().length>0){
        setLabelStyle({
        fontSize: `${labelFontSizeNum * 0.75}px`,       // Shrink by 75%
        transform: `translateY(-${labelFontSizeNum-5}px)`, // Move up by input font size
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



const handleInputChange = (e)=>{
   
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


const handleOptionClick = (item)=>{
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

useEffect(()=>{
    setMainContainerStyle({...mainContainerStyle,
        ...{"height":height}
    })
},[])

const handleMouseLeave = (e)=>{
    if(type =="textarea" || "date"){
        changeLabelFontSize(value)
    }
}

  return (
        <div 
            className={`${classNameMain}`} 
            style={mainContainerStyle}
            onMouseLeave = {(e)=>handleMouseLeave(e)}
        > 
            <div
                ref = {labelRef}
                id={`label_${id}`}
                htmlFor={`input_${id}`}
                className={`${classNameLabel}`}
                style={labelStyle}
            >
                {`${label}`} <span style={{color: "red"}}>{`${required ? "*" : ""}`}</span>
            </div>

            {/* {type ==="date"?
            <DatePicker
                dateFormat="MM/d/yyyy"    
                placeholderText={placeholder}
                className={`datepicker-theme-${theme}`}
                style={inputFontStyle}
                id ={`input_${id}`}
                name={name}
                selected={value} // Bind selected date to state
                onClick = {(e)=>handleInputClick()}
                onChange={(date) => handleInputChange({ target: { name: 'start_date', value: new Date(date.setHours(0, 0, 0, 0))} })} // Call handleChange with a Date
            /> */}

            {type ==="textarea"?
            <textarea
                ref={inputRef} 
                className={classNameInput}
                style={inputFontStyle}
                id ={`input_${id}`}
                name={name}
                placeholdertext={placeholder}
                value = {formatValue.formatInput(value, type)}
                onChange = {(e)=>handleInputChange(e)}
                onClick = {(e)=>handleInputClick()}
                readOnly = {readonly}
                disabled = {disabled}
                autoComplete="off" 
                rows={rows}
            />
            
            :

            <input 
                ref={inputRef} 
                className={classNameInput}
                style={inputFontStyle}
                id ={`input_${id}`}
                name={name}
                placeholdertext={placeholder}
                value = {value ? formatValue.formatInput(value, type) : ""}
                type={type==="password"? "password": "text"}
                onChange = {(e)=>handleInputChange(e)}
                onClick = {(e)=>handleInputClick()}
                readOnly = {readonly}
                disabled = {disabled}
                autoComplete="off" 
            />
        }
        {showDropdown && options.length>0 &&  type !=="date" &&
            <div id="dropdown" ref={dropdownRef} className={classNameDropdown}  style={{height:"200px", top: `${inputProps.height}px`}} onMouseLeave={()=>handleLeave()}>
                {options.map((item,index)=>(
                    <div 
                        key={index} 
                        className={`${classNameOption} fade-in`}
                        onClick={(e)=>handleOptionClick(item)}
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