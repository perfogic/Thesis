import { DuckDbNode } from "./db";
import { getCheckpointData, getCheckpointQueue } from "../utils/lcd";
import { TableName } from "../utils/db";
import env from "../configs/env";
import { CheckpointStatus } from "../@types";
import logger from "../configs/logger";

export class CheckpointPolling {
  static index: number = -1;
  static latestIndex: number = -1;

  // This one will fetch the index (checkpoint_index)
  // If it is exist on DB, save to this value
  // else save it to 0
  private static async _initialize(): Promise<void> {
    // Set latest index value
    const checkpointQueue = await getCheckpointQueue();
    this.latestIndex = checkpointQueue.index;

    // Set index value
    const latestCheckpoints = await DuckDbNode.instances.queryLatestCheckpoints(
      1
    );
    if (latestCheckpoints.length == 0) {
      this.index = env.checkpoint.firstCheckpointIndex;
      return;
    }

    if (latestCheckpoints[0].status == CheckpointStatus.Building) {
      this.index = latestCheckpoints[0].checkpointIndex;
      return;
    }

    this.index = latestCheckpoints[0].checkpointIndex + 1;
  }

  // Do polling each time
  static async polling() {
    while (true) {
      try {
        await this._initialize();
        logger.info(
          `Crawling checkpoint index: ${this.index}/${this.latestIndex}`
        );
        // first index is checkpoint on bridge
        // second index is checkpoint on database
        const data = await Promise.all([
          getCheckpointData(this.index),
          DuckDbNode.instances.queryCheckpointByIndex(this.index),
        ]);

        if (data[1] === null) {
          let insertData = { ...data[0] };
          await DuckDbNode.instances.insertCheckpoint(
            insertData,
            TableName.Checkpoint
          );
        } else if (data[0].status !== data[1].status) {
          let insertData = { ...data[0] };
          await DuckDbNode.instances.updateCheckpoint(
            insertData,
            TableName.Checkpoint
          );
        } else {
          logger.info(`Skipping handle checkpoint ${this.index}`);
        }

        if (this.index < this.latestIndex) {
          this.index++;
        }
      } catch (err) {
        console.log(err);
        logger.error(err?.message || "Something went wrong");
      }

      await new Promise((resolve) =>
        setTimeout(resolve, env.checkpoint.pollingInterval)
      );
    }
  }
}
