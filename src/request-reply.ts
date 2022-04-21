import { connect, NatsConnection,StringCodec } from "nats";

export class RequestReplyClass {
    private nats?: NatsConnection
   
    constructor() {
      
    }

    async init(servers: string = "127.0.0.1:4222") {
        this.nats = await connect({ servers })
        console.log(`connect to ${this.nats.getServer()}`)
    }
    async subscribe(subject:string){
        const sc=StringCodec();
        
        const sub=this.nats.subscribe(subject)
       console.log("subscribe ",subject)
   
        for await (const m of sub){
            console.log(m.data)
            console.log(m.reply);
            console.log(m.subject);
            m.respond(sc.encode(`I get the message "${sc.decode(m.data)}"`))
            console.log(`[${sub.getProcessed()}]:${sc.decode(m.data)}`);

        }
    }
    async request(subject:string,msg:string){
        const sc=StringCodec();
        const result=await this.nats.request(subject,sc.encode("msg"),{timeout:1000})
        return sc.decode(result.data);
       // .then((m)=>{console.log(`got response:${sc.decode(m.data)}`)})
    }
    async publish(subject:string,msg:string){
        const sc=StringCodec();
        console.log(`publish ${subject} message:${msg}`)
        this.nats.publish(subject,sc.encode(msg))
     //   this.nats.close();
    }
}

