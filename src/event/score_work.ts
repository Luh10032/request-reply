import { BaseEvent } from './base'

export class ArlinqEvent extends BaseEvent{
    constructor(public arlinq_id:string){
        super();
    }
}