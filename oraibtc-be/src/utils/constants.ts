import { ChainIdEnum } from "@oraichain/oraidex-common";

export const ChainIdToLcd = {
  [ChainIdEnum["Oraichain"]]: "https://lcd.orai.io",
  "oraibtc-testnet-1": "https://oraibtc-rest.perfogic.store",
};

export const DiscordConfig = {
  discord_webhook: process.env.DISCORD_WEBHOOK_URL,
  discord_users_id: [],
};

export const ONE_DAY = 86400 * 1000;
