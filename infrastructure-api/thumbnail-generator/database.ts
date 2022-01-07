#!/usr/bin/env node

import config from "config";
import { MongoClient, ObjectId } from "mongodb";
import { exit } from "process";
import { logger } from "../src/utils/logger";

export class Database {
  client: any;
  ontoPageColl: any;
  thumbnailColl: any;

  private async getCollection() {
    const uri: string = config.get("mongodb.url");
    const dbName: string = config.get("mongodb.db");
    const ontoPageCollName = config.get("mongodb.collection.onto_page");
    const thumbnailCollName = config.get("mongodb.collection.thumbnails");

    if (!uri || !dbName || !ontoPageCollName || !thumbnailCollName) {
      logger.error(`thumbnail-generator:Database: database parameter undefined,
                uri = ${uri}, dbName = ${dbName},  ontoPageCollName = ${ontoPageCollName}, thumbnailCollName = ${thumbnailCollName}`);
      exit(0);
    }
    logger.info(`thumbnail-generator:Database: database parameters,
                uri = ${uri}, dbName = ${dbName},  ontoPageCollName = ${ontoPageCollName}, thumbnailCollName = ${thumbnailCollName}`);

    this.client = new MongoClient(uri);
    await this.client.connect();
    let db = this.client.db(dbName);
    this.ontoPageColl = await db.collection(ontoPageCollName);
    this.thumbnailColl = await db.collection(thumbnailCollName);
  }

  async getAllPages() {
    await this.getCollection();

    // let pages = await this.ontoPageColl.find({ pageType: 'example' }, { _id: 1 }).toArray();
    let pages = await this.ontoPageColl.find({}, { _id: 1 }).toArray();
    return pages.map((d: any) => d._id.toString());
  }

  async updateScreenshot(pageId: string, thumbnail: any) {
    await this.thumbnailColl.updateOne(
      { _id: new ObjectId(pageId) },
      { $set: { thumbnail: thumbnail } },
      { upsert: true }
    );
  }

  async close() {
    this.client.close();
  }
}
