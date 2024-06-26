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
    config: JSON.stringify({ config_test: 1 }),
    valueLocked: 0,
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
    config: JSON.stringify({ config_test: 2 }),
    valueLocked: 0,
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
    config: JSON.stringify({ config_test: 3 }),
    valueLocked: 0,
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
    const data: any = await Promise.all([
      DuckDbNode.instances.update(
        TableName.Checkpoint,
        {
          valueLocked: 1,
        },
        {
          where: {
            checkpointIndex: 1,
          },
        }
      ),
      DuckDbNode.instances.queryCheckpointByIndex(1),
      DuckDbNode.instances.queryCheckpointByIndex(2),
    ]);
    console.log(data[1], data[2]);
    expect(data[1]?.checkpointIndex).toBe(1);
  });

  xit("Test query latest checkpoints", async () => {
    const data = await DuckDbNode.instances.queryLatestCheckpoints(2);
    expect(data.length).toBe(2);
  });

  xit("Test query checkpoints by times", async () => {
    const data = await DuckDbNode.instances.queryCheckpointsByUpperBoundTime(
      1711865289710,
      5
    );
    expect(data.length).toBe(2);
  });
});
