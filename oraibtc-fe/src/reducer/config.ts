import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Themes } from 'context/theme-context';
import { CoinGeckoPrices } from 'hooks/useCoingecko';
import { DepositInfo } from 'pages/BitcoinDashboard/@types';
import { PERSIST_VER } from 'store/constants';
// import { PERSIST_VERSION } from 'store/configure';

export type ChainInfoType = {
  networkType?: string;
  chainId?: string;
  rpc?: string;
  lcd?: string;
};

export type RewardPoolType = {
  reward: Array<string>;
  liquidity_token: string;
};

export interface ConfigState {
  address: string;
  btcAddress: string | null;
  cosmosAddress: { [key: string]: string };
  allPendingDeposits: { [key: string]: DepositInfo[] };
  chainId: string;
  chainInfo: ChainInfoType;
  filterNetwork: string;
  walletTypeStore: string;
  infoCosmos: ChainInfoType;
  statusChangeAccount: boolean;
  hideOtherSmallAmount: boolean;
  hideOraichainSmallAmount: boolean;
  theme: Themes;
  coingecko: CoinGeckoPrices<string>;
  persistVersion: number;
}

const initialState: ConfigState = {
  address: '',
  btcAddress: '',
  walletTypeStore: 'owallet',
  cosmosAddress: {},
  allPendingDeposits: {},
  chainId: 'Oraichain',
  filterNetwork: 'Oraichain',
  chainInfo: {},
  infoCosmos: {},
  statusChangeAccount: false,
  hideOtherSmallAmount: false,
  hideOraichainSmallAmount: false,
  theme: 'dark',
  coingecko: {},
  persistVersion: PERSIST_VER
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    updateConfig: {
      reducer(state, action: PayloadAction<string, string, ConfigState[keyof ConfigState]>) {
        state[action.payload] = action.meta;
      },
      prepare(key: string, value: ConfigState[keyof ConfigState]) {
        return { payload: key, meta: value };
      }
    }
  }
});

// Action creators are generated for each case reducer function
export const { updateConfig } = configSlice.actions;

export default configSlice.reducer;
