// import * as duckdb from "@duckdb/duckdb-wasm";
// import { Connection, Database } from "duckdb-async";
// import fs from "fs";

// export const sqlCommands = {
//   create: {
//     EvmState: `create table if not exists EvmState 
//     (
//       txHash varchar,
//       height uinteger,
//       prevState varchar,
//       prevTxHash varchar,
//       nextState varchar,
//       destination varchar,
//       fromAmount hugeint,
//       oraiBridgeChannelId varchar,
//       oraiReceiver varchar,
//       destinationDenom varchar,
//       destinationChannelId varchar,
//       destinationReceiver varchar,
//       eventNonce uinteger primary key,
//     )`,
//     OraiBridgeState: `create table if not exists OraiBridgeState 
//     (
//       txHash varchar,
//       height uinteger,
//       prevState varchar,
//       prevTxHash varchar,
//       nextState varchar,
//       eventNonce uinteger,
//       packetSequence uinteger primary key,
//       amount hugeint,
//       denom varchar,
//       memo varchar,
//       receiver varchar,
//       sender varchar,
//       srcPort varchar,
//       srcChannel varchar,
//       dstPort varchar,
//       dstChannel varchar,
//     )`,
//     OraichainState: `create table if not exists OraichainState 
//     (
//         txHash varchar,
//         height uinteger,
//         prevState varchar,
//         prevTxHash varchar,
//         nextState varchar,
//         packetSequence uinteger primary key,
//         packetAck varchar,
//         nextPacketSequence uinteger,
//         nextMemo varchar,
//         nextAmount hugeint,
//         nextReceiver varchar,
//         nextDestinationDenom varchar,
//     )`
//   },
//   query: {
//     evmStateByHash: "SELECT * from EvmState where txHash = ?",
//     evmStateByNonce: "SELECT * from EvmState where eventNonce = ?",
//     oraiBridgeStateByNonce: `
//       SELECT * from OraiBridgeState where eventNonce = ?
//       `,
//     oraiBridgeStateBySequence: `
//       SELECT * from OraiBridgeState where packetSequence = ?
//       `,
//     oraichainStateByPacketSequence: `
//       SELECT * from OraichainState where packetSequence = ?
//       `,
//     stateDataByPacketSequence: (tableName: string) => `SELECT * from ${tableName} where packetSequence = ?`
//   }
// };

// export abstract class DuckDB {
//   abstract createTable(): Promise<void>;
//   abstract queryInitialEvmStateByHash(txHash: string): Promise<any>;
//   abstract queryInitialEvmStateByNonce(nonce: number): Promise<any>;
//   abstract queryOraiBridgeStateByNonce(eventNonce: number): Promise<any>;
//   abstract queryOraiBridgeStateBySequence(packetSequence: number): Promise<any>;
//   abstract queryOraichainStateBySequence(packetSequence: number): Promise<any>;
//   abstract findStateByPacketSequence(packetSequence: number): Promise<any>;
//   abstract insertData(data: any, tableName: string): Promise<void>;
// }

// export class DuckDbNode extends DuckDB {
//   static instances: DuckDbNode;
//   protected constructor(public readonly conn: Connection, private db: Database) {
//     super();
//   }

//   static async create(tableName?: string): Promise<DuckDbNode> {
//     const path = tableName || ":memory:";
//     if (!DuckDbNode.instances) {
//       let db = await Database.create(path);
//       await db.close(); // close to flush WAL file
//       db = await Database.create(path);
//       const conn = await db.connect();
//       DuckDbNode.instances = new DuckDbNode(conn, db);
//     }

//     return DuckDbNode.instances;
//   }

//   async createTable() {
//     for (const createCommand of Object.values(sqlCommands.create)) {
//       await this.conn.exec(createCommand);
//     }
//   }

//   async queryInitialEvmStateByHash(txHash: string) {
//     const result = await this.conn.all(sqlCommands.query.evmStateByHash, txHash);
//     if (result.length > 0) return result[0];
//     return [];
//   }

//   async queryInitialEvmStateByNonce(nonce: number) {
//     const result = await this.conn.all(sqlCommands.query.evmStateByNonce, nonce);
//     if (result.length > 0) return result[0];
//     return [];
//   }

//   async queryOraiBridgeStateByNonce(eventNonce: number) {
//     const result = await this.conn.all(sqlCommands.query.oraiBridgeStateByNonce, eventNonce);
//     if (result.length > 0) return result[0];
//     return [];
//   }

//   async queryOraiBridgeStateBySequence(packetSequence: number): Promise<any> {
//     const result = await this.conn.all(sqlCommands.query.oraiBridgeStateBySequence, packetSequence);
//     if (result.length > 0) return result[0];
//     return [];
//   }

//   async queryOraichainStateBySequence(packetSequence: number) {
//     const result = await this.conn.all(sqlCommands.query.oraichainStateByPacketSequence, packetSequence);
//     if (result.length > 0) return result[0];
//     return [];
//   }

//   async findStateByPacketSequence(packetSequence: number): Promise<any> {
//     for (const tableName of Object.keys(sqlCommands.create)) {
//       try {
//         const result = await this.conn.all(sqlCommands.query.stateDataByPacketSequence(tableName), packetSequence);
//         if (result.length > 0) return { tableName, state: result[0] };
//       } catch (error) {
//         // ignore errors because some tables may not have packetSequence column
//       }
//     }
//     return { tableName: "", state: "" };
//   }

//   // TODO: use typescript here instead of any
//   async insertData(data: any, tableName: string) {
//     const tableFile = `${tableName}.json`;
//     // the file written out is temporary only. Will be deleted after insertion
//     await fs.promises.writeFile(tableFile, JSON.stringify(toObject(data)));
//     const query = `INSERT INTO ${tableName} SELECT * FROM read_json_auto(?)`;
//     await this.conn.run(query, tableFile);
//     await fs.promises.unlink(tableFile);
//   }
// }
