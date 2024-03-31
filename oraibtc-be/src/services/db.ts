import {
  CheckpointDataInterface,
  QueryOrderEnum,
  StoredCheckpointDataInterface,
} from "../@types";
import { TableName } from "../utils/db";
import { Connection, Database } from "duckdb-async";
import fs from "fs";
import { toObject } from "@oraichain/oraidex-common";
import { toCamel } from "snake-camel";

export const sqlCommands = {
  create: {
    [TableName.Checkpoint]: `CREATE TABLE IF NOT EXISTS Checkpoint 
    (
      checkpointIndex UINTEGER PRIMARY KEY,
      feeRate UINTEGER,
      feeCollected UINTEGER,
      signedAtBtcHeight UINTEGER,
      transaction VARCHAR,
      sigset VARCHAR,
      status VARCHAR,
      createTime BIGINT
    )`,
  },
  query: {
    getCheckpointByIndex: (index: number) =>
      `SELECT * from Checkpoint where checkpointIndex = ${index}`,
    getLatestCheckpoints: (
      limit: number,
      order: QueryOrderEnum = QueryOrderEnum.DESC
    ) =>
      `SELECT * from Checkpoint ORDER BY checkpointIndex ${order} LIMIT ${limit}`,
  },
};

export abstract class DuckDB {
  abstract createTable(): Promise<void>;
  abstract dropTable(tableName: string): Promise<void>;
}

export class DuckDbNode extends DuckDB {
  static instances: DuckDbNode;
  protected constructor(
    public readonly conn: Connection,
    private db: Database
  ) {
    super();
  }

  static async create(tableName?: string): Promise<DuckDbNode> {
    const path = tableName || ":memory:";
    if (!DuckDbNode.instances) {
      let db = await Database.create(path);
      await db.close(); // close to flush WAL file
      db = await Database.create(path);
      const conn = await db.connect();
      DuckDbNode.instances = new DuckDbNode(conn, db);
    }

    return DuckDbNode.instances;
  }

  async createTable() {
    for (const createCommand of Object.values(sqlCommands.create)) {
      await this.conn.exec(createCommand);
    }
  }

  async queryCheckpointByIndex(
    index: number
  ): Promise<StoredCheckpointDataInterface | null> {
    const result = await this.conn.all(
      sqlCommands.query.getCheckpointByIndex(index)
    );
    if (result.length > 0) {
      const item = { ...result[0] };
      return {
        ...(item as any),
        sigset: toCamel(JSON.parse(item.sigset.toString())),
        transaction: toCamel(JSON.parse(item.transaction.toString())),
      };
    }
    return null;
  }

  async queryLatestCheckpoints(
    limit: number,
    order: QueryOrderEnum = QueryOrderEnum.DESC
  ): Promise<StoredCheckpointDataInterface[]> {
    const result = await this.conn.all(
      sqlCommands.query.getLatestCheckpoints(limit, order)
    );
    if (result.length > 0) {
      return result.map((item: any) => {
        return {
          ...item,
          sigset: toCamel(JSON.parse(item.sigset.toString())),
          transaction: toCamel(JSON.parse(item.transaction.toString())),
        };
      });
    }
    return [];
  }

  // TODO: use typescript here instead of any
  async insertCheckpoint(data: CheckpointDataInterface, tableName: string) {
    const sql =
      "INSERT INTO Checkpoint (checkpointIndex, sigset, feeRate, feeCollected, signedAtBtcHeight, transaction, status, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    await this.conn.run(
      sql,
      data.sigset.index,
      JSON.stringify(data.sigset),
      data.feeRate,
      data.feesCollected,
      data.signedAtBtcHeight,
      JSON.stringify(data.transaction),
      data.status,
      data.sigset.createTime
    );
  }

  // TODO: use typescript here instead of any
  async insertData(data: any, tableName: string) {
    const tableFile = `${tableName}.json`;
    // the file written out is temporary only. Will be deleted after insertion
    await fs.promises.writeFile(tableFile, JSON.stringify(toObject(data)));
    const query = `INSERT INTO ${tableName} SELECT * FROM read_json_auto(?)`;
    await this.conn.run(query, tableFile);
    await fs.promises.unlink(tableFile);
  }

  async dropTable(tableName: string) {
    const query = `DROP TABLE ${tableName}`;
    await this.conn.run(query);
  }
}
