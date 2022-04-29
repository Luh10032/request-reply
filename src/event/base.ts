

export class BaseEvent {
    timestamp: Date;
    uuid: string;


    constructor() {
        this.timestamp = new Date();
        this.uuid = Math.random().toString(36).substring(2, 5);
    }
    static toString() {
        return this.name
            .split(/(?=[A-Z])/)
            .join('_')
            .toLocaleLowerCase();
    }
    toString() {
        return this.constructor.toString();
    }

}





export class Msg_old {
    data: string;
    subject: string;
    reply: string;
    timestamp: Date;
    uuid: string;

    constructor(data: string = "", subject: string = "") {
        this.data = data;
        this.subject = subject;
        this.timestamp = new Date();
        this.uuid = Math.random().toString(36).substring(2, 5);
        this.reply = `INBOX_${this.subject}_${this.uuid}`;
    }

}

