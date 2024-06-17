import { resolve } from "path";
import { DuckDbNode } from "services/db";

const main = async () => {
  await DuckDbNode.create(resolve(__dirname, "../src/storages/db.duckdb"));
  await DuckDbNode.instances.createTable();

  await DuckDbNode.instances.dropTable("Checkpoint");
};

main();
