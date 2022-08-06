import { ObjectId, Collection } from "../deps.ts";
import { db }from '../server/utils/db.ts'

export interface MessageSchema {
  _id: ObjectId;
  message: String;
  messageType: String;
  messageTime: Date;
  file: String;
  comments: Array<ObjectId>;
  sentBy: String;
  isRead: Boolean;
}

export const Message: Collection<MessageSchema> = db.collection('Message')
