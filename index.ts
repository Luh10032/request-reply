import {ReqRep,ArlinqEvent} from './src/index'

/**reqrep */
(async () => {
  const rclass = new ReqRep();
  const sub=await rclass.subscribe(ArlinqEvent.toString(),"caidynasty","toinxiao","tay9xiao","choinfield")
  for await (const msg of sub) {
    console.log("Server: receive msg:",msg.data)
    msg.respond({value:"got it"});
  }
  rclass.quit();


  //console.log("sub quit")
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
