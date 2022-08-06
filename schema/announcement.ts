import { ObjectId, Collection } from "../deps.ts";
import {db} from '../utils/db.ts';
export interface AnnoucementSchema {
    ann_id : ObjectId,
    title: String,
    body: any,
    photo?: any,
    createdBy?: any,
    createdAt: Date
}

export const Annoucement: Collection<AnnoucementSchema> = db.collection('Annoucement')
