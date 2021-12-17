import { ObjectId } from "mongodb";

export enum PAGE_TYPE {
  EXAMPLE = "example",
  REVIEW = "review",
  RELEASE = "release",
}

export class IOntoPage {
  public _id!: string | ObjectId;
  public date!: Date;
  public pageType!: PAGE_TYPE;
  public visId!: string;
  public dataIds!: Array<string>;
  public pageIds?: Array<string>; // propagated links
  public childrenPageIds?: Array<string>; // rest are built from hierarchy data structure
  public parentPageId?: string;
  public neighborPageIds?: string[];
}
