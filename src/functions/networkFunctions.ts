
export const getIpAddress = async ()=>{
    const response:any = await fetch('https://api.ipify.org?format=json');
    const value:any = await response.json();
    const clientIPAddress: string= await value.ip;
    return clientIPAddress
}