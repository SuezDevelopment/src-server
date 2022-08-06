import { ObjectId, Collection } from "../deps.ts";
import {db} from '../utils/db.ts'

export interface CommunitySchama {
  _id: ObjectId;
  comm_id: String;
  title: String;
  description: String;
  photo: String;
  isApproved: Boolean;
  membersCount: Number;
  members: any;
  operators: ObjectId;
  messages: String;
  createdAt: Date;
}

export interface channelEvents {
  _id: ObjectId;
  event: String
};

export const Community: Collection<CommunitySchama> = db.collection('Community')



