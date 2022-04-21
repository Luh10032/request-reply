import {RequestReplyClass,IoRedisClass,Msg} from './src/index'

(async ()=>{
    const rclass=new IoRedisClass();
    const result:Msg=await rclass.request("alinq","IM ARLINQ",1000);
    console.log("request result:",result)
    rclass.quit();
})()


// (async ()=>{
//     const rclass=new RequestReplyClass();
//     await rclass.init();
//     //await rclass.publish("alinq","i m rlinq")
//    const result= await rclass.request("arlinq","i m rlinq")
//    console.log("request get:",result);
// })()

