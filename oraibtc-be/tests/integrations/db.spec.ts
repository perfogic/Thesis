import { resolve } from "path";
import { DuckDbNode } from "../../src/services/db";
import { TableName } from "../../src/utils/db";

describe("Testing DuckDB Checkpoint", () => {
  beforeEach(async () => {
    const db = await DuckDbNode.create(
      resolve(__dirname, "../../src/storages/db.duckdb")
    );
  });

  it("Test query from checkpointIndex", async () => {
    const data: any = await DuckDbNode.instances.queryCheckpointByIndex(96);
    expect(data?.checkpointIndex).toBe(96);
  });
});
