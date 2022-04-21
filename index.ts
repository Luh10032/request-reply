import {RequestReplyClass,IoRedisClass,Msg} from './src/index'

(async () => {
  const rclass = new IoRedisClass();
  const deal = (msg: Msg):string => {
    const {data,subject}:Msg=msg
    console.log(`Server: receive data: ${data} , from ${subject} `);
    return `i konw you :"${data}"`;
  }

  await rclass.subscribe("alinq", deal);
})()



// (async ()=>{
//     const rclass=new RequestReplyClass();
//     await rclass.init();
//     await rclass.subscribe("arlinq");
// })()
