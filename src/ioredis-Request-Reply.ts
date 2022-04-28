import * as Redis from 'ioredis'
import { Msg_old as Msg } from "./event";
import {timeout} from './unit'


export class IoRedisClass {
    private client:Redis.Redis;

    constructor(port=6379,address="127.0.0.1") {
       
        this.client=new Redis(port,address);
        this.client.ping("ping").then((val)=>{
            console.log(`Redis client: ${val}`)
        })
    }

    async subscribe(subject: string, respondCallback: (message: Msg)=>string) {
        const redis_sub=this.client.duplicate();
        await redis_sub.subscribe(subject)

        redis_sub.on("message",async (subject,message)=>{
            const msg:Msg = JSON.parse(message);
            const res_str = respondCallback(msg);
            const res_obj = new Msg(res_str, msg.subject);
    
            const redis_pub = this.client.duplicate();
            await redis_pub.publish(res_obj.reply, JSON.stringify(res_obj))
            //redis_pub.disconnect();
        })
        console.log(`Subscribe subject: ${subject} `)
    }   

    async request(subject: string, msg: string, ms: number=1000):Promise<Msg> {
        
        const redis_pub=this.client.duplicate();
        const msgObj=new Msg(msg,subject);

        const redis_sub=this.client.duplicate();
        let messageCallback=(sub:string, msg:string)=>{};
        const timer:{p:Promise<Msg>,cancel:Function}=timeout(ms)

        const p:Promise<Msg>= new Promise(async (resolve,reject)=>{
            messageCallback = (sub:string, msg:string) => {
                timer.cancel();
                redis_sub.disconnect();

                const respondMsg:Msg=JSON.parse(msg);
                resolve(respondMsg)
            }
        })

        await redis_sub.subscribe(msgObj.reply);
        redis_sub.on("message",messageCallback)

        await redis_pub.publish(subject,JSON.stringify(msgObj));
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
