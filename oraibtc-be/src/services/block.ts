import { DuckDbNode } from "./db";
import {
  getCheckpointConfig,
  getCheckpointData,
  getCheckpointQueue,
  getValueLocked,
} from "../utils/lcd";
import { TableName } from "../utils/db";
import env from "../configs/env";
import { CheckpointStatus } from "../@types";
import logger from "../configs/logger";
import { getBlocks, getLatestHeight } from "utils/blockstream";

export class BlockPolling {
  static height: number = -1;
  static latestHeight: number = -1;

  private static async _initialize(): Promise<void> {
    const data = await DuckDbNode.instances.getLatestBlock();
    this.latestHeight = await getLatestHeight();
    if (data.length != 0) {
      this.height = data[0].height;
      return;
    }
    this.height = env.block.firstBlockHeight;
  }

  // Do polling each time
  static async polling() {
    while (true) {
      logger.info(`Crawling block on ${this.height}/${this.latestHeight}`);
      try {
        await this._initialize();
        if (this.height < this.latestHeight) {
          for (let i = this.height; i <= this.latestHeight; i++) {
            const tenBlocks = await getBlocks(i);
            const currentBlock = tenBlocks[0];
            await DuckDbNode.instances.insert(TableName.Block, currentBlock);
          }
        }
      } catch (err) {
        console.log(err);
        logger.error(err?.message || "Something went wrong");
      }

      await new Promise((resolve) =>
        setTimeout(resolve, env.block.pollingInterval)
      );
    }
  }
}
