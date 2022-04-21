
function timeout<T>(ms:number){
    let timer:NodeJS.Timeout;
    let cancel:()=>void;
    const p:Promise<T>=new Promise((resolve,reject)=>{
       
         cancel=()=>{
            if(timer)
                clearTimeout(timer)
        }   
        timer=setTimeout(()=>{
            reject("Time out")
        },ms)
    })
    //return  Object.assign(p,methods)
    return  {p,cancel}
}

export {timeout}