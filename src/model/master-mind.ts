import { type ClientSession } from "mongodb";
import { Aggregate } from "../aggregate/aggregate";
import { database, type Database } from "../database";
import { query } from "../query/query";

export class MasterMind {
  /**
   * Master Mind Collection name
   */
  public collection = "MasterMind";

  /**
   * Connection instance
   */
  public database: Database = database;

  /**
   * Get last id of the given collection
   */
  public async getLastId(collection: string): Promise<number> {
    const query = this.database.collection(this.collection);

    const collectionDocument = await query.findOne({
      collection: collection,
    });

    return collectionDocument ? collectionDocument.id : 0;
  }

  /**
   * Set last id for the given collection
   */
  public async setLastId(
    collection: string,
    id: number,
    { session = this.getCurrentSession() }: { session?: ClientSession } = {},
  ) {
    const query = this.database.collection(this.collection);

    const collectionDocument = await query.findOne({
      collection: collection,
    });

    if (collectionDocument) {
      // update the collection with the latest id
      await query.updateOne(
        {
          collection: collection,
        },
        {
          $set: {
            id: id,
          },
        },
        {
          session,
        },
      );
    } else {
      // if the collection is not found in the master mind table
      // create a new record for it
      await query.insertOne(
        {
          collection: collection,
          id: id,
        },
        {
          session,
        },
      );
    }
  }

  /**
   * Rename the given collection to the new one to keep the last id updated and not to be reset
   */
  public async renameCollection(
    oldCollection: string,
    newCollection: string,
    { session = this.getCurrentSession() }: { session?: ClientSession } = {},
  ) {
    const query = this.database.collection(this.collection);

    const collectionDocument = await query.findOne({
      collection: oldCollection,
    });

    if (collectionDocument) {
      // update the collection with the latest id
      await query.updateOne(
        {
          collection: oldCollection,
        },
        {
          $set: {
            collection: newCollection,
          },
        },
        {
          session,
        },
      );
    }
  }

  /**
   * Get current active session from database object
   */
  public getCurrentSession() {
    return this.database.getActiveSession()?.session;
  }

  /**
   * Update all collections by the last id of each collection in current database
   */
  public async updateAllLastId() {
    for (const document of await query.list("MasterMind")) {
      const { collection, id } = document;
      if (!collection) continue;
      const biggestId = (
        await new Aggregate(collection).orderByDesc("id").first()
      )?.id;
      if (biggestId && biggestId > id) {
        await masterMind.setLastId(collection, biggestId + 1);
      }
    }
  }

  /**
   * Generate next id for the given collection name
   */
  public async generateNextId(
    collection: string,
    incrementIdBy = 1,
    initialId = 1,
    { session = this.getCurrentSession() }: { session?: ClientSession } = {},
  ): Promise<number> {
    const query = this.database.collection(this.collection);

    const result = await query.findOneAndUpdate(
      { collection },
      [
        {
          $set: {
            id: {
              $cond: {
                if: { $or: [{ $eq: ["$id", null] }, { $not: "$id" }] },
                then: initialId,
                else: { $add: ["$id", incrementIdBy] },
              },
            },
            collection: collection,
          },
        },
      ],
      {
        upsert: true,
        session,
        returnDocument: "after",
      },
    );

    return result.value?.id ?? initialId;
  }
}

export const masterMind = new MasterMind();
