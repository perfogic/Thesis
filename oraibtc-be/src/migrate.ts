import { resolve } from "path";
import { DuckDbNode } from "services/db";
import { TableName } from "utils/db";
import { getCheckpointConfig } from "utils/lcd";

const main = async () => {
  await DuckDbNode.create(resolve(__dirname, "../src/storages/db.duckdb"));
  await DuckDbNode.instances.createTable();

  const data = await DuckDbNode.instances.select(TableName.Checkpoint, {
    where: {},
  });
  const config = await getCheckpointConfig();

  for (const checkpoint of data) {
    console.log(checkpoint.checkpointIndex);
    if (checkpoint.createTime > 1711670400)
      await DuckDbNode.instances.update(
        TableName.Checkpoint,
        {
          config: {
            ...config,
            user_fee_factor: checkpoint.createTime > 1711670400 ? 27000 : 21000,
          },
        },
        {
          where: {
            checkpointIndex: checkpoint.checkpointIndex,
          },
        }
      );
  }
};

main();
