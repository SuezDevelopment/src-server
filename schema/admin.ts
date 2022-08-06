import { ObjectId, Collection } from "../deps.ts";
import {db} from '../utils/db.ts';

export interface AdminSchema {
  admin_id: ObjectId,
  photo: String,
  username: String,
  fullname: String,
  phone_no: String,
  email: String,
  pwdHash: String,
  createdBy?: any 
  createdAt: Date
}

export const Admin: Collection<AdminSchema> = db.collection('Admin')

