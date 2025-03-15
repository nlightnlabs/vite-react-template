export const formatValue = (inputValue:string | number, format:string, currencySymbol:string, digits:number, abbreviate:boolean)=>{
    
  const numericalValue:number = getValue(inputValue, format)

  let formattedValue:string = ""
  let prefix:string = ""
  let suffix:string = ""
  let divisor:number = 1
  
  if(format === "percent"){
    suffix = "%"
    divisor = (1/100)
  }
  
  else{
    if(format ==="currency"){
      prefix = currencySymbol
    }else{
      prefix = ""
    }
    
    if(abbreviate){
      if(numericalValue>=(10**12)){
        divisor = 10**12
        suffix = "T"
      }else if(numericalValue>=(10**9)){
        divisor = 10**9
        suffix = "B"
      }else if(numericalValue>=(10**6)){
        divisor = 10**6
        suffix = "M"
      }else if(numericalValue>=(1000)){
        divisor = 1000
        suffix = "K"
      }
      else{
        divisor = 1
        suffix = ""
      }
  }
  
  }
  formattedValue = `${prefix}${parseFloat((numericalValue/divisor).toFixed(digits)).toLocaleString("en-US")}${suffix}`
  return formattedValue
}


export const getValue = (inputValue: string | number, format: string): number => {
  let stringValue: string = String(inputValue).toLowerCase(); 
  let numericalValue: number = Number(parseFloat(stringValue.replace(/[^0-9.]/g, "")));
  let outputValue: number = 0;

  if (!inputValue) {
    outputValue = 0;
    return outputValue;
  }

  // Adjust for percentage formatting
  if (format === "percent" || stringValue.includes("%") || stringValue.includes("pct") || stringValue.includes("percent")) {
    return numericalValue / 100;
  }

  // Adjust for exponential formatting
  if (stringValue.includes("e")) {
    let parts = stringValue.split("e");
    let exponent = parseFloat(parts[1].replace(/[^0-9.]/g, ""));
    numericalValue = parseFloat(parts[0].replace(/[^0-9.]/g, ""));
    return (outputValue = numericalValue * 10 ** exponent);
  }

  // Adjust for abbreviated formatting (Millions, Billions, etc.)
  if (stringValue.includes("t") || stringValue.includes("tn") || stringValue.includes("trillion")) {
    return (outputValue = numericalValue * 10 ** 12);
  }

  if (stringValue.includes("b") || stringValue.includes("bn") || stringValue.includes("billion")) {
    return (outputValue = numericalValue * 10 ** 9);
  }

  if (stringValue.includes("m") || stringValue.includes("mn") || stringValue.includes("million")) {
    return (outputValue = numericalValue * 10 ** 6);
  }

  if (stringValue.includes("k") || stringValue.includes("thousand")) {
    return (outputValue = numericalValue * 1000);
  }

  return outputValue = numericalValue;
};


export const toProperCase = (str:string)=>{
  return str.split(" ")
   .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
   .join(" ");
}


export const extractDate = (str:string)=>{
  const date = new Date(str);

// Extract the date in YYYY-MM-DD format
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, "0");

  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate
}

export const UTCToLocalTime =(utcDateString:string)=>{
  const utcDate = new Date(utcDateString);
  const timezoneOffset = utcDate.getTimezoneOffset();
  const localTime = new Date(utcDate.getTime() - timezoneOffset * 60000);
  return localTime.toLocaleString(); // Adjust the output format as needed
}

export const UTCToLocalDate =(utcDateString:string)=>{
  const utcDate = new Date(utcDateString);
  const timezoneOffset = utcDate.getTimezoneOffset();
  const localTime = new Date(utcDate.getTime() - timezoneOffset * 60000);
  return localTime.toLocaleString().slice(0,localTime.toLocaleString().search(","));
}

export const formatDateInput = (inputValue:string)=>{
  let dateValue = new Date(inputValue);  
  let dd = String(dateValue.getDate()).padStart(2, '0'); 
  let mm = String(dateValue.getMonth() + 1).padStart(2, '0'); 
  let yyyy = dateValue.getFullYear(); 
  let formattedDate = yyyy + '-' + mm + '-' + dd; 
  return formattedDate
}

export const UTCToLocalDateTime = (utcTimeString:string)=>{

  // Create a new Date object from the UTC time string
  const utcDate = new Date(utcTimeString);

  // Extract date components
  const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
  const day = utcDate.getUTCDate().toString().padStart(2, '0');
  const year = utcDate.getUTCFullYear();

  // Extract time components
  let hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
  let amOrPm = 'AM';

  // Convert hours to 12-hour format and determine AM/PM
  if (hours > 12) {
    hours -= 12;
    amOrPm = 'PM';
  } else if (hours === 12) {
    amOrPm = 'PM';
  } else if (hours === 0) {
    hours = 12;
  }

  // Format the date-time string
  const dateTimeString = `${month}/${day}/${year} ${hours.toString().padStart(2, '0')}:${minutes} ${amOrPm}`;
  return dateTimeString

}


export const limitText =(textContent:string, maxLength:number)=>{
  if (textContent !=="" && textContent !=null){
    var text = textContent.toString();
    if (text.length > maxLength) {
      text=text.substring(0, maxLength) + '...';
    }
    return(text)
  }
}

export const escapeQuotes = (inputString:string) =>{
  let escapedString =""
  
  if(inputString.search("'")>0){
    // Replace single quotes with escaped single quotes
    escapedString = inputString.replace(/'/g, "\'");
  }

  if(escapedString.search('"')>0){
    // Replace double quotes with escaped double quotes
    escapedString = escapedString.replace(/"/g, '\"');
  }

  return escapedString;
  
}



export const formatFileSize = (inputValue:string)=>{

    const value = parseInt(inputValue)
    
    if(value>=1e12){
      return `${(value/1e12).toFixed(1)} TB`
    }else if(value>=1e9){
      return `${(value/1e9).toFixed(1)} GB`
    }else if(value>=1e6){
      return `${(value/1e6).toFixed(1)} MB`
    }else if(value>=1e3){
      return `${(value/1e3).toFixed(1)} KB`
    }else{
      return `${value} Bytes`
    }

}


function isDate(date:any) {
  // Check if it's a Date object
  if (date instanceof Date && !isNaN(date.getTime())) {
      return true;
  }
  return false;
}


export const formatInput = (value:any, dataType:string) =>{
  
  let date:any = value
  
  if (dataType === "number" && !isNaN(date)) {
      return parseFloat(value).toLocaleString("en-US");
  } 

  else if (dataType === "date" && !isNaN(Date.parse(date))) {

      const isValidDate = isDate(value)
      if(!isValidDate){
          date = new Date(value);
      }
      
      const month:string = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day:string = String(date.getDate()).padStart(2, '0');
      const year:string = date.getFullYear();
      return `${year}-${month}-${day}`;
  } 
  else if (dataType === "time") {
      const date = new Date();
      if (!isNaN(date.getTime())) {
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const period = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12; // Convert to 12-hour format
          return `${hours}:${minutes} ${period}`;
      }
  }
  return value; // Return text or unrecognized types as-is

}