import { ObjectId } from "bson";
import { DATA_TYPE, URL_CODE } from "./onto-data-types";

export interface IOntoData {
  _id: string | ObjectId;
  urlCode: URL_CODE;
  endpoint: string;
  dataType: DATA_TYPE;
  date: Date;
  description: string;
  keywords: string;
}
