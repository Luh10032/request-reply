import * as Redis from 'ioredis'
import {BaseEvent } from "./event";
//import {timeout} from './unit'

export class Msg{
    public inbox:string;
    constructor(public topic:string,public data:BaseEvent,private redis:Redis.Redis=null){
        this.inbox = `INBOX_${topic}_${data.uuid}`;
    }

    async respond(msg:string)
    {
        if(this.redis===null)
            throw 'redis is null'
        console.log(`msg: respond to ${this.inbox}`)
        return await this.redis.publish(this.inbox, msg)
    }
}


export class ReqRep {
    private client:Redis.Redis;

    constructor(port=6379,address="127.0.0.1") {
        this.client=new Redis(port,address);
        this.client.ping("ping")
    }

    async subscribe(topic: string) {
        const redis_sub=this.client.duplicate();
        await redis_sub.subscribe(topic)
        
        const p:Promise<Msg>=new Promise((resolve,reject)=>{
            redis_sub.on("message",(topic,message)=>{
                const msg= JSON.parse(message) ;
                const msg_obj=new Msg(topic,msg,this.client.duplicate());
                resolve(msg_obj);
            })
        })
       
        console.log(`Subscribe subject: ${topic} `)
        return p;
    }   

    async request<T extends BaseEvent>(event:T, ms: number=1000) {
        
        const redis_pub=this.client.duplicate();
        //const msgObj=new Msg(msg,subject);

        const redis_sub=this.client.duplicate();
        let messageCallback=(topic:string, msg:string)=>{};
        const timer=timeout(ms)

        const p= new Promise(async (resolve,reject)=>{
            messageCallback = (topic:string, msg:string) => {
                timer.cancel();
                redis_sub.disconnect();
                console.log("request callback get message",msg)
              //  const respondMsg=JSON.parse(msg);
                resolve(msg)
            }
        })
        /**msg的topic是需要publish（request）的topic，inbox是需要subscribe（respond）的topic */
        const msg=new Msg(event.toString(),event);
        await redis_sub.subscribe(msg.inbox);
        redis_sub.on("message",messageCallback)
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
