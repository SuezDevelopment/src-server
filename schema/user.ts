import { ObjectId, Collection } from "../deps.ts";
import {db} from '../utils/db.ts';

export interface UserSchema {
  user_id: any,
  photo?: String,
  username: String,
  fullname: String,
  phone_no: String,
  bio?: any,
  depertment: String,
  email:String,
  communities: any,
  hasVoted: Boolean,
  status: String,
  isOperator: Boolean,
  pwdHash?: String,
  createdAt: Date,
}

export const User: Collection<UserSchema> = db.collection('User')

