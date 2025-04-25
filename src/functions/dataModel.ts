export const mapDataTypes = (record, data_model)=>{
    const map = []
    Object.keys(record).map((key,index)=>{
        const data_type = data_model.find((i:any)=>i.field_name === key).data_type
        map.push({key, data_type})
    })
}