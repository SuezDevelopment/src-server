import { ObjectId, Collection } from "../deps.ts";
import {db} from '../server/utils/db.ts'

export interface CandidateSchema {
  _id: ObjectId;
  fullname: String;
  cand_id: Number;
  position:String;
  voteCount: Number;
  bio:String;
  department:String;
  mat_no:String;
  voters: Array<String>;
  createdAt: Date;

}

export const Candidate: Collection<CandidateSchema> = db.collection('Candidate');

