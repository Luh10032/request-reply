import {ReqRep,ArlinqEvent} from './src/index'

/**reqrep */
(async () => {
  const rclass = new ReqRep();
  const msg=await rclass.subscribe(ArlinqEvent.toString())
  console.log("Server:get request:",msg.data);
  msg.respond("okkk");
  rclass.quit();
})()



/**request-reply */
// (async () => {
//   const rclass = new IoRedisClass();
//   const deal = (msg: Msg):string => {
//     const {data,subject}:Msg=msg
//     console.log(`Server: receive data: ${data} , from ${subject} `);
   
//     return `i konw you :"${data}"`;
//   }

//   await rclass.subscribe("alinq", deal);
// })()


/**NATS  */
// (async ()=>{
//     const rclass=new RequestReplyClass();
//     await rclass.init();
//     await rclass.subscribe("arlinq");
// })()
