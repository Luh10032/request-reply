import { on } from 'events';
import * as Redis from 'ioredis'
import { EventEmitter } from 'stream';
import {BaseEvent } from "./event";

export type Client=Redis.Redis | Redis.Cluster

/**
 *msg 类的创建主要有两个优点
 1.内置inbox，无需修改baseevent
 2.可以直接调用Msg的respond函数来进行reply
 */
export class Msg{
    public inbox:string;
    constructor(public topic:string,public data:BaseEvent | any={},private redis:Client=null){
        this.inbox = `INBOX_${topic}_${data.uuid}`;
    }

    async respond(payload:any)
    {
        if(this.redis===null)
            throw 'redis is null'
       // console.log(`msg: respond to ${this.inbox}`)
        const result=await this.redis.publish(this.inbox,JSON.stringify(payload))
        this.redis.disconnect();
        return result;
    }
}


export class ReqRep {

    constructor(private client:Client=null) {
        if(!this.client)
        {
            const port=6379,address="127.0.0.1";
            this.client=new Redis(port,address);
        }
        this.client.ping("ping").then((val)=>{
            console.log(`Redis client: ${val}`)
        })
    }

    async subscribe(...topic: string[]):Promise<AsyncGenerator<Msg,void,void>> {
        const redis_sub=this.client.duplicate();

        const nodes= redis_sub instanceof Redis.Cluster?redis_sub.nodes():[redis_sub];
        const subscription=new EventEmitter();

        await Promise.all(
            nodes.map(async(node)=>{
                await node.subscribe(topic);
                console.log(`sub:subscribe ${topic}`)
                node.on(`message`,(topics,message)=>subscription.emit(`msg`,topics,message));
            })
        )
        return (async function *(client:Client) {
            try {
                for await (const [topic,message] of on(subscription,`msg`)) {
                    console.log(`get message,${topic},${message}`);
                    const msg= JSON.parse(message) ;
                    const msg_obj=new Msg(topic,msg,client.duplicate());
                    yield msg_obj;
                }
            }finally{
                redis_sub.disconnect()
            }
        })(this.client)
    }   

  
    async request<T extends BaseEvent>(event:T, ms: number=1000) {
        const redis_pub=this.client.duplicate();
        //定时器
        const timer=timeout(ms)
        const msg_event=new Msg(event.toString(),event);
        //订阅inbox专用redis
        const redis_sub=this.client.duplicate();
        let messageCallback=(topic:string, msg:string)=>{};

        const p= new Promise(async (resolve,reject)=>{
            messageCallback = (topic:string, msg:string) => {
                timer.cancel();
                redis_sub.disconnect();
                console.log("request callback get message",msg)
                const respondMsg=JSON.parse(msg);
                resolve(respondMsg)
            }
        })
        /**msg中，topic是需要publish（request）的topic，inbox是需要subscribe（respond）接收reply的topic */
        const nodes= redis_sub instanceof Redis.Cluster?redis_sub.nodes():[redis_sub];
        await Promise.all(
            nodes.map(async(node)=>{
                await node.subscribe(msg_event.inbox)
                node.on("message",messageCallback);
            })
        )
      
        //console.log(`request: publish "${msg_event.data.toString()}" sub:"${msg_event.inbox} ,\n data:`,msg_event.data);
        await redis_pub.publish(msg_event.data.toString(),JSON.stringify(msg_event.data));
        redis_pub.disconnect();

        const result=Promise.race([p,timer.p])
        result.catch((err)=>{
            console.log(err);
            timer.cancel();
        })
        return result;
       
    }

    async quit(){
       return  this.client.quit();
    }
}





function timeout(ms:number){
    let timer:NodeJS.Timeout;
    let cancel:()=>void;
    const p=new Promise((resolve,reject)=>{
       
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
