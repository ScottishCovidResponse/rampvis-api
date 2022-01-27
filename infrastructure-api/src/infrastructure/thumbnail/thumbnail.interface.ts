import { ObjectId } from "bson";

export interface IThumbnail {
  _id: string | ObjectId;
  thumbnail?: any;
  title?: string;
}
