import { ObjectId, Collection } from "../deps.ts";
import { db }from '../utils/db.ts'

export interface ElectionSchema {
    _id: ObjectId;
    title: String;
    isInprogress: Boolean;
    endedAt: Date;
    candidates: any;
}

    

export const Election: Collection<ElectionSchema> = db.collection('Election')

