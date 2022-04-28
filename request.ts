import {RequestReplyClass,IoRedisClass,Msg,ReqRep,ArlinqEvent} from './src/index'


/**reqrep */
(async ()=>{
    const rclass=new ReqRep();
    const arlinq=new ArlinqEvent("arlinq")
    const result=await rclass.request(arlinq,3000);
    console.log("request result:",result)
    rclass.quit();
})()

/**request-reply */
// (async ()=>{
//     const rclass=new IoRedisClass();
//     const result:Msg=await rclass.request("alinq","IM ARLINQ",1000);
//     console.log("request result:",result)
//     rclass.quit();
// })()

/**NATS  */
// (async ()=>{
//     const rclass=new RequestReplyClass();
//     await rclass.init();
//     //await rclass.publish("alinq","i m rlinq")
//    const result= await rclass.request("arlinq","i m rlinq")
//    console.log("request get:",result);
// })()

