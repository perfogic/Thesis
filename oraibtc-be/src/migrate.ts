import { resolve } from "path";
import { DuckDbNode } from "services/db";
import { getValueLocked } from "utils/blockstream";
import { TableName } from "utils/db";

const main = async () => {
  await DuckDbNode.create(resolve(__dirname, "../src/storages/db.duckdb"));
  await DuckDbNode.instances.createTable();

  const data = await DuckDbNode.instances.select(TableName.Checkpoint, {
    where: {},
  });

  for (const checkpoint of data) {
    console.log(checkpoint);
    const output = JSON.parse(checkpoint.transaction).data.input[0]
      .previousOutput;
    const [txid, vout] = output.split(":");
    const valueLocked = await getValueLocked(txid, vout);
    await DuckDbNode.instances.update(
      TableName.Checkpoint,
      {
        valueLocked: valueLocked,
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
