import * as Redis from 'ioredis'
import {BaseEvent } from "./event";

export type Client=Redis.Redis | Redis.Cluster

/**
 *msg 类的创建主要有两个优点
 1.内置inbox，无需修改baseevent
 2.可以直接调用Msg的respond函数来进行reply
 */
export class Msg{
    public inbox:string;
    constructor(public topic:string,public data:BaseEvent,private redis:Client=null){
        this.inbox = `INBOX_${topic}_${data.uuid}`;
    }

    async respond(msg:string)
    {
        if(this.redis===null)
            throw 'redis is null'
       // console.log(`msg: respond to ${this.inbox}`)
        const result=await this.redis.publish(this.inbox, msg)
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

    async subscribe(topic: string) {
        const redis_sub=this.client.duplicate();
        let messageCallback=(topic:string, msg:string)=>{};

        const p:Promise<Msg>=new Promise((resolve,reject)=>{
            messageCallback=(topic,message)=>{
                const msg= JSON.parse(message) ;
                const msg_obj=new Msg(topic,msg,this.client.duplicate());
                redis_sub.disconnect();
                resolve(msg_obj);
            }
        })
        const nodes= redis_sub instanceof Redis.Cluster?redis_sub.nodes():[redis_sub];
        await Promise.all(
            nodes.map(async(node)=>{
                await node.subscribe(topic)
                node.on("message",messageCallback);
            })
        )
        
        console.log(`Subscribe subject: ${topic} `)
        return p;
    }   

  
    async request<T extends BaseEvent>(event:T, ms: number=1000) {
        const redis_pub=this.client.duplicate();
        //定时器
        const timer=timeout(ms)
        const msg=new Msg(event.toString(),event);
        //订阅inbox专用redis
        const redis_sub=this.client.duplicate();
        let messageCallback=(topic:string, msg:string)=>{};

        const p= new Promise(async (resolve,reject)=>{
            messageCallback = (topic:string, msg:string) => {
                timer.cancel();
                redis_sub.disconnect();
                console.log("request callback get message",msg)
              //  const respondMsg=JSON.parse(msg);
                resolve(msg)
            }
        })
        /**msg中，topic是需要publish（request）的topic，inbox是需要subscribe（respond）接收reply的topic */
        const nodes= redis_sub instanceof Redis.Cluster?redis_sub.nodes():[redis_sub];
        await Promise.all(
            nodes.map(async(node)=>{
                await node.subscribe(msg.inbox)
                node.on("message",messageCallback);
            })
        )
      
        console.log(`request: publish "${msg.data.toString()}" sub:"${msg.inbox}" `)
        await redis_pub.publish(msg.data.toString(),JSON.stringify(msg.data));
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
