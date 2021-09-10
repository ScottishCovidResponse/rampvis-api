import { MongoClient, ObjectId } from 'mongodb';

const uri = ''; // TODO: Read from environment

export class Database {
    client: any;
    ontoPageColl: any;
    thumbnailColl: any;

    private async getCollection() {
        this.client = new MongoClient(uri);
        await this.client.connect();
        let db = this.client.db('rampvis');
        this.ontoPageColl = await db.collection('onto_page');
        this.thumbnailColl = await db.collection('thumbnails');
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
