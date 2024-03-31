import { DuckDbNode } from "../src/services/db";
import { TableName } from "../src/utils/db";

const seedsData = [
  {
    checkpointIndex: 1,
    feeRate: 50,
    feeCollected: 500,
    signedAtBtcHeight: 1001,
    sigset: JSON.stringify({
      createTime: 1710080337,
      index: 13,
      possibleVp: 10,
      presentVp: 10,
      signatories: [],
    }),
    transaction: JSON.stringify({ transaction_test: 1 }),
    status: "Complete",
    createTime: 1711865289609,
  },
  {
    checkpointIndex: 2,
    feeRate: 30,
    feeCollected: 200,
    signedAtBtcHeight: 1002,
    sigset: JSON.stringify({
      createTime: 1710080337,
      index: 13,
      possibleVp: 10,
      presentVp: 10,
      signatories: [],
    }),
    transaction: JSON.stringify({ transaction_test: 2 }),
    status: "Signing",
    createTime: 1711865289709,
  },
  {
    checkpointIndex: 3,
    feeRate: 70,
    feeCollected: 850,
    signedAtBtcHeight: 1003,
    sigset: JSON.stringify({
      createTime: 1710080337,
      index: 13,
      possibleVp: 10,
      presentVp: 10,
      signatories: [],
    }),
    transaction: JSON.stringify({ transaction_test: 3 }),
    status: "Building",
    createTime: 1711865289809,
  },
];
describe("Testing DuckDB Checkpoint", () => {
  beforeEach(async () => {
    const db = await DuckDbNode.create(":memory:");
    if (db) {
      await db.createTable();
      for (const seed of seedsData) {
        await db.insertData(seed, TableName.Checkpoint);
      }
    }
  });

  afterEach(async () => {
    await DuckDbNode.instances.dropTable(TableName.Checkpoint);
  });

  it("Test query from checkpointIndex", async () => {
    const data: any = await DuckDbNode.instances.queryCheckpointByIndex(1);
    console.log(data);
    expect(data?.checkpointIndex).toBe(1);
  });

  it("Test query latest checkpoints", async () => {
    const data = await DuckDbNode.instances.queryLatestCheckpoints(2);
    expect(data.length).toBe(2);
  });
});
