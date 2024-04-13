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
import _ from "lodash";

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
      config VARCHAR,
      valueLocked VARCHAR,
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
    getCheckpointsByUpperBoundTime: (
      date: number,
      limit: number,
      order: QueryOrderEnum = QueryOrderEnum.DESC
    ) =>
      `SELECT * from Checkpoint WHERE createTime <= ${date} ORDER BY createTime ${order} LIMIT ${limit}`,
    getCheckpointsInRangeTime: (
      startTime: number,
      endTime: number,
      order: QueryOrderEnum = QueryOrderEnum.DESC
    ) =>
      `SELECT * from Checkpoint WHERE createTime <= ${endTime} AND createTime >= ${startTime} ORDER BY createTime ${order}`,
  },
};

export abstract class DuckDB {
  abstract createTable(): Promise<void>;
  abstract dropTable(tableName: string): Promise<void>;
  abstract select(tableName: TableName, options: OptionInterface): Promise<any>;
  abstract insert(tableName: TableName, data: Object): Promise<void>;
  abstract update(
    tableName: TableName,
    overrideData: Object,
    options: OptionInterface
  ): Promise<void>;
}

export interface PaginationInterface {
  limit?: number;
  offset?: number;
}

export interface OptionInterface {
  where?: Object;
  attributes?: string[];
  pagination?: PaginationInterface;
}

export class DuckDbNode extends DuckDB {
  static instances: DuckDbNode;
  protected constructor(
    public readonly conn: Connection,
    private db: Database
  ) {
    super();
  }

  async select(tableName: TableName, options: OptionInterface): Promise<any> {
    const defaultOptions = {
      where: {},
      attributes: [],
      pagination: {},
    };
    const [query, values] = this.selectClause(tableName, {
      ...defaultOptions,
      ...options,
    });
    const result = await this.conn.all(query, ...values);
    return result;
  }

  async insert(tableName: TableName, data: Object): Promise<void> {
    const [query, values] = this.insertClause(tableName, data);
    await this.conn.run(query, ...values);
  }

  async update(
    tableName: TableName,
    overrideData: Object,
    options: OptionInterface
  ): Promise<void> {
    const [query, values] = this.updateClause(tableName, overrideData, options);
    await this.conn.run(query, ...values);
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
        config: toCamel(JSON.parse(item.config.toString())),
      };
    }
    return null;
  }

  async queryCheckpointsByUpperBoundTime(
    date: number,
    limit: number,
    order: QueryOrderEnum = QueryOrderEnum.DESC
  ): Promise<StoredCheckpointDataInterface[]> {
    const result = await this.conn.all(
      sqlCommands.query.getCheckpointsByUpperBoundTime(date, limit, order)
    );
    if (result.length > 0) {
      return result.map((item: any) => {
        return {
          ...item,
          sigset: toCamel(JSON.parse(item.sigset.toString())),
          transaction: toCamel(JSON.parse(item.transaction.toString())),
          config: toCamel(JSON.parse(item.config.toString())),
        };
      });
    }
    return [];
  }

  async queryCheckpointsByRangeTime(
    startTime: number,
    endTime: number,
    order: QueryOrderEnum = QueryOrderEnum.ASC
  ): Promise<StoredCheckpointDataInterface[]> {
    const result = await this.conn.all(
      sqlCommands.query.getCheckpointsInRangeTime(startTime, endTime, order)
    );
    if (result.length > 0) {
      return result.map((item: any) => {
        return {
          ...item,
          sigset: toCamel(JSON.parse(item.sigset.toString())),
          transaction: toCamel(JSON.parse(item.transaction.toString())),
          config: toCamel(JSON.parse(item.config.toString())),
        };
      });
    }
    return [];
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
          config: toCamel(JSON.parse(item.config.toString())),
        };
      });
    }
    return [];
  }

  // TODO: use typescript here instead of any
  async insertCheckpoint(data: CheckpointDataInterface, tableName: string) {
    const sql = `INSERT INTO ${tableName} (checkpointIndex, sigset, feeRate, feeCollected, signedAtBtcHeight, transaction, config, valueLocked, status, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await this.conn.run(
      sql,
      data.sigset.index,
      JSON.stringify(data.sigset),
      data.feeRate,
      data.feesCollected,
      data.signedAtBtcHeight,
      JSON.stringify(data.transaction),
      JSON.stringify(data.config),
      data.valueLocked,
      data.status,
      data.sigset.createTime
    );
  }

  // TODO: use typescript here instead of any
  async updateCheckpoint(data: CheckpointDataInterface, tableName: string) {
    const sql = `UPDATE ${tableName} SET sigset = ?, feeRate = ?, feeCollected = ?, signedAtBtcHeight = ?, transaction = ?, config = ?, status = ?, valueLocked = ?, createTime = ? WHERE checkpointIndex = ?`;

    await this.conn.run(
      sql,
      JSON.stringify(data.sigset),
      data.feeRate,
      data.feesCollected,
      data.signedAtBtcHeight,
      JSON.stringify(data.transaction),
      JSON.stringify(data.config),
      data.status,
      data.valueLocked,
      data.sigset.createTime,
      data.sigset.index
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

  // ORM BASIC
  selectClause(
    tableName: string,
    options: OptionInterface = {
      where: {},
      attributes: [],
      pagination: {},
    }
  ): [string, any[]] {
    const attributes = options.attributes;
    const whereKeys = Object.keys(options.where);
    const whereValues = Object.values(options.where);
    const whereClauses =
      whereKeys.length > 0
        ? `WHERE ${whereKeys.map((item) => `${item} = ?`).join(" AND ")}`
        : "";
    const paginationKeys = Object.keys(options.pagination);
    const paginationValues = Object.values(options.pagination);
    const paginationClause =
      paginationKeys.length > 0
        ? `${options.pagination?.limit ? `LIMIT ?` : ""} ${
            options.pagination?.offset ? "OFFSET ?" : ""
          }`
        : "";

    const query = _.trim(
      `SELECT ${
        attributes.length > 0 ? attributes.join(", ") : "*"
      } FROM ${tableName} ${whereClauses} ${paginationClause}`
    );

    return [query, [...whereValues, ...paginationValues]];
  }

  insertClause(tableName: string, data: Object): [string, any[]] {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT OR IGNORE INTO ${tableName} (${keys.join(
      ", "
    )}) VALUES (${keys.map((_) => "?").join(", ")})`;
    return [_.trim(query), values];
  }

  updateClause(
    tableName: TableName,
    overrideData: Object,
    options: OptionInterface
  ): [string, any[]] {
    const overrideDataKeys = Object.keys(overrideData);
    const overrideDataValues = Object.values(overrideData);
    const setDataClause = `SET ${overrideDataKeys
      .map((item) => `${item} = ?`)
      .join(", ")}`;
    const whereKeys = Object.keys(options.where);
    const whereValues = Object.values(options.where);
    const whereClauses =
      whereKeys.length > 0
        ? `WHERE ${whereKeys.map((item) => `${item} = ?`).join(" AND ")}`
        : "";

    const query = _.trim(
      `UPDATE ${tableName} ${setDataClause} ${whereClauses}`
    );

    return [query, [...overrideDataValues, ...whereValues]];
  }
}
