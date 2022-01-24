import { ObjectId } from "bson";
import { ROLES } from "../user/roles.enum";

export interface IActivity {
  _id: string | ObjectId;
  type: ACTIVITY_TYPE;
  action: ACTIVITY_ACTION;
  // Id of the object for which the activity is generated, e.g., userId, collectionId, etc.
  objectId: string;
  createdAt: Date;
  userId: string;
  role: ROLES;
}

export enum ACTIVITY_TYPE {
  LOGIN = "login",
  USER = "user",
  BOOKMARK = "bookmark",
  THUMBNAIL = "thumbnail",
  ONTO_DATA = "onto_data",
  ONTO_VIS = "onto_vis",
  ONTO_PAGE = "onto_page",
  ONTO_PAGES = "onto_pages",
}

export enum ACTIVITY_ACTION {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LOGIN = "login",
}
