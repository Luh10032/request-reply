import * as Redis from 'ioredis'

export class Msg{
    data:string;
    subject:string;
    reply:string;
    timestamp:Date;
    uuid:string;
 
    constructor(data:string="",subject:string=""){
        this.data=data;
        this.subject=subject;
        if(subject.length)
            this.reply=this.createInbox(subject);
        this.timestamp=new Date();
        this.uuid=Math.random().toString(36).substring(2,5);
    }

    createInbox(subject:string)
    {
        return subject+"_INBOX";
    }
}

