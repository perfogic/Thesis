import { PairInfo } from '@oraichain/oraidex-contracts-sdk';
import { TokenItemType } from '@oraichain/oraidex-common';

export type TokenInfo = TokenItemType & {
  symbol?: string;
  total_supply?: string;
  icon?: string;
  verified?: boolean;
};

export type PairInfoExtend = PairInfo & {
  asset_infos_raw: [string, string];
};
