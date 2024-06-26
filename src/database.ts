import { AsyncLocalStorage } from "async_hooks";
import type {
  ClientSession,
  ClientSessionOptions,
  Collection,
  Db,
} from "mongodb";
import type { Connection } from "./connection";

export type DatabaseSessionTransaction = {
  session: ClientSession;
  database: Database;
};

export class Database {
  /**
   * MongoDB Internal Database instance
   */
  public database!: Db;

  /**
   * Current Connection
   */
  public connection!: Connection;

  public sessionsContainer =
    new AsyncLocalStorage<DatabaseSessionTransaction>();

  /**
   * Create a new transaction session and wrap it with a context
   */
  public async startSession(
    callback: (transaction: DatabaseSessionTransaction) => Promise<any>,
    sessionOptions: ClientSessionOptions = {
      defaultTransactionOptions: {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConcern: { w: "majority" },
      },
    },
  ) {
    const session = this.connection.client.startSession(sessionOptions);

    return new Promise((resolve, reject) => {
      this.sessionsContainer.run(
        {
          session,
          database: this,
        },
        async () => {
          try {
            await session.withTransaction(async () => {
              const result = await callback({
                session,
                database: this,
              });

              resolve(result);

              session.commitTransaction();
            });
          } catch (error) {
            reject(error);
          } finally {
            session.endSession();
          }
        },
      );
    });
  }

  /**
   * Get active session
   */
  public getActiveSession() {
    return this.sessionsContainer.getStore();
  }
  /**
   * Set connection instance
   */
  public setConnection(connection: Connection) {
    this.connection = connection;

    return this;
  }

  /**
   * Set database instance
   */
  public setDatabase(database: Db) {
    this.database = database;

    return this;
  }

  /**
   * Get database collection instance
   */
  public collection(collection: string): Collection {
    return this.database.collection(collection);
  }

  /**
   * List collection names
   */
  public async listCollectionNames() {
    return (await this.database.listCollections().toArray()).map(
      collection => collection.name,
    );
  }

  /**
   * Drop database
   */
  public async drop() {
    return await this.database.dropDatabase();
  }
}

export const database = new Database();
