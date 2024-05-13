import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import {
  btcTokens,
  cosmosTokens,
  evmTokens,
  oraichainTokens,
  tokenMap,
} from "config/bridgeTokens";
import {
  genAddressCosmos,
  getAddress,
  handleCheckWallet,
  getWalletByNetworkCosmosFromStorage,
} from "helper";
import flatten from "lodash/flatten";
import { updateAmounts } from "reducer/token";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import { generateError } from "../libs/utils";
import { COSMOS_CHAIN_ID_COMMON } from "@oraichain/oraidex-common";
import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import {
  CustomChainInfo,
  EVM_BALANCE_RETRY_COUNT,
} from "@oraichain/oraidex-common";
import { chainInfos } from "config/chainInfos";
import { network } from "config/networks";
import { ethers } from "ethers";
import { reduce } from "lodash";
import { getUtxos } from "pages/Balance/helpers";
import { bitcoinChainId } from "helper/constants";

export type LoadTokenParams = {
  refresh?: boolean;
  oraiAddress?: string;
  btcAddress?: string;
};

async function loadNativeBalance(
  dispatch: Dispatch,
  address: string,
  tokenInfo: { chainId: string; rpc: string }
) {
  if (!address) return;
  try {
    const client = await StargateClient.connect(tokenInfo.rpc);
    const amountAll = await client.getAllBalances(address);

    let amountDetails: AmountDetails = {};

    // reset native balances
    cosmosTokens
      .filter((t) => t.chainId === tokenInfo.chainId && !t.contractAddress)
      .forEach((t) => {
        amountDetails[t.denom] = "0";
      });

    const tokensAmount = amountAll
      .filter((coin) => tokenMap[coin.denom])
      .map((coin) => [coin.denom, coin.amount]);
    Object.assign(amountDetails, Object.fromEntries(tokensAmount));

    dispatch(updateAmounts(amountDetails));
  } catch (ex) {
    console.trace("errror");
    console.log(ex);
  }
}

const timer = {};
async function loadTokens(
  dispatch: Dispatch,
  { oraiAddress, btcAddress }: LoadTokenParams
) {
  try {
    if (oraiAddress) {
      clearTimeout(timer[oraiAddress]);
      // case get address when keplr ledger not support kawaii
      // case EIP191
      const walletType = getWalletByNetworkCosmosFromStorage();
      if (walletType === "eip191") {
        timer[oraiAddress] = setTimeout(async () => {
          await Promise.all([
            loadNativeBalance(dispatch, oraiAddress, {
              chainId: network.chainId,
              rpc: network.rpc,
            }),
            loadCw20Balance(dispatch, oraiAddress),
          ]);
        }, 2000);
      } else {
        const kawaiiAddress = getAddress(
          await window.Keplr.getKeplrAddr(
            COSMOS_CHAIN_ID_COMMON.INJECTVE_CHAIN_ID
          ),
          "oraie"
        );
        timer[oraiAddress] = setTimeout(async () => {
          await Promise.all([
            loadTokensCosmos(dispatch, kawaiiAddress, oraiAddress),
            loadCw20Balance(dispatch, oraiAddress),
          ]);
        }, 2000);
      }
    }

    if (btcAddress) {
      clearTimeout(timer[btcAddress]);
      timer[btcAddress] = setTimeout(() => {
        loadBtcAmounts(
          dispatch,
          btcAddress,
          // TODO: hardcode check bitcoinTestnet need update later
          chainInfos.filter((c) => c.chainId == bitcoinChainId)
        );
      }, 2000);
    }
  } catch (error) {
    console.log("error load balance: ", error);
  }
}

async function loadTokensCosmos(
  dispatch: Dispatch,
  kwtAddress: string,
  oraiAddress: string
) {
  if (!kwtAddress && !oraiAddress) return;
  await handleCheckWallet();
  const cosmosInfos = chainInfos.filter(
    (chainInfo) =>
      (chainInfo.networkType === "cosmos" ||
        chainInfo.bip44.coinType === 118) &&
      // TODO: ignore oraibtc
      chainInfo.chainId !== ("oraibtc-mainnet-1" as string) &&
      chainInfo.chainId !== ("oraibtc-testnet-1" as string)
  );
  for (const chainInfo of cosmosInfos) {
    const { cosmosAddress } = genAddressCosmos(
      chainInfo,
      kwtAddress,
      oraiAddress
    );
    if (!cosmosAddress) continue;
    loadNativeBalance(dispatch, cosmosAddress, chainInfo);
  }
}

async function loadCw20Balance(dispatch: Dispatch, address: string) {
  if (!address) return;

  // get all cw20 token contract
  const cw20Tokens = [...oraichainTokens.filter((t) => t.contractAddress)];

  const data = toBinary({
    balance: { address },
  });

  const multicall = new MulticallQueryClient(window.client, network.multicall);

  const res = await multicall.aggregate({
    queries: cw20Tokens.map((t) => ({
      address: t.contractAddress,
      data,
    })),
  });

  const amountDetails = Object.fromEntries(
    cw20Tokens.map((t, ind) => {
      if (!res.return_data[ind].success) {
        return [t.denom, 0];
      }
      const balanceRes = fromBinary(
        res.return_data[ind].data
      ) as OraiswapTokenTypes.BalanceResponse;
      const amount = balanceRes.balance;
      return [t.denom, amount];
    })
  );

  dispatch(updateAmounts(amountDetails));
}

async function loadNativeEvmBalance(address: string, chain: CustomChainInfo) {
  try {
    const client = new ethers.providers.StaticJsonRpcProvider(
      chain.rpc,
      Number(chain.chainId)
    );
    const balance = await client.getBalance(address);
    return balance;
  } catch (error) {
    console.log("error load native evm balance: ", error);
  }
}
async function loadNativeBtcBalance(address: string, chain: CustomChainInfo) {
  const data = await getUtxos(address, chain.rest);
  const total = reduce(
    data,
    function (sum, n) {
      return sum + n.value;
    },
    0
  );

  return total;
}

async function loadBtcEntries(
  address: string,
  chain: CustomChainInfo,

  retryCount?: number
): Promise<[string, string][]> {
  try {
    const nativeBtc = btcTokens.find((t) => chain.chainId === t.chainId);

    const nativeBalance = await loadNativeBtcBalance(address, chain);
    let entries: [string, string][] = [
      [nativeBtc.denom, nativeBalance.toString()],
    ];
    return entries;
  } catch (error) {
    console.log("error querying BTC balance: ", error);
    let retry = retryCount ? retryCount + 1 : 1;
    if (retry >= EVM_BALANCE_RETRY_COUNT)
      throw generateError(`Cannot query BTC balance with error: ${error}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return loadBtcEntries(address, chain, retry);
  }
}

async function loadBtcAmounts(
  dispatch: Dispatch,
  btcAddress: string,
  chains: CustomChainInfo[]
) {
  const amountDetails = Object.fromEntries(
    flatten(
      await Promise.all(
        chains.map((chain) => loadBtcEntries(btcAddress, chain))
      )
    )
  );

  dispatch(updateAmounts(amountDetails));
}

export default function useLoadTokens(): (
  params: LoadTokenParams
) => Promise<void> {
  const dispatch = useDispatch();
  return loadTokens.bind(null, dispatch);
}
