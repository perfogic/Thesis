// @ts-nocheck
import {
  TokenItemType,
  tokens,
  chainInfos as customChainInfos,
  OsmoToken,
  AtomToken,
  InjectiveToken,
  ChainIdEnum,
} from "@oraichain/oraidex-common";
import { ReactComponent as OraiIcon } from "assets/icons/oraichain.svg";
import { ReactComponent as OraiLightIcon } from "assets/icons/oraichain_light.svg";
import { ReactComponent as BTCIcon } from "assets/icons/btc-icon.svg";
import { ReactComponent as OraixLightIcon } from "assets/icons/oraix_light.svg";
import { ReactComponent as OsmoIcon } from "assets/icons/osmosis_light.svg";
import { ReactComponent as BitcoinIcon } from "assets/icons/bitcoin.svg";

import {
  AIRI_CONTRACT,
  ATOM_ORAICHAIN_DENOM,
  INJECTIVE_CONTRACT,
  INJECTIVE_ORAICHAIN_DENOM,
  KWTBSC_ORAICHAIN_DENOM,
  KWT_CONTRACT,
  MILKYBSC_ORAICHAIN_DENOM,
  MILKY_CONTRACT,
  ORAIX_CONTRACT,
  OSMOSIS_ORAICHAIN_DENOM,
  SCATOM_CONTRACT,
  SCORAI_CONTRACT,
  TRX_CONTRACT,
  USDC_CONTRACT,
  USDT_CONTRACT,
  WETH_CONTRACT,
  NEUTARO_ORAICHAIN_DENOM,
  OCH_CONTRACT,
} from "@oraichain/oraidex-common";
import {
  BridgeAppCurrency,
  CustomChainInfo,
  defaultBech32Config,
} from "@oraichain/oraidex-common";
import { flatten } from "lodash";
import { bitcoinChainId } from "helper/constants";
import { OBTCContractAddress } from "libs/nomic/models/ibc-chain";

const [otherChainTokens, oraichainTokens] = tokens;
type TokenIcon = Pick<TokenItemType, "coinGeckoId" | "Icon" | "IconLight">;
type ChainIcon = Pick<CustomChainInfo, "chainId" | "Icon" | "IconLight">;
export const bitcoinMainnet: CustomChainInfo = {
  rest: "https://blockstream.info/api",
  rpc: "https://blockstream.info/api",
  chainId: ChainIdEnum.Bitcoin,
  chainName: "Bitcoin",
  bip44: {
    coinType: 0,
  },
  coinType: 0,
  Icon: BTCIcon,
  IconLight: BTCIcon,
  stakeCurrency: {
    coinDenom: "BTC",
    coinMinimalDenom: "btc",
    coinDecimals: 8,
    coinGeckoId: "bitcoin",
    coinImageUrl:
      "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  bech32Config: defaultBech32Config("bc"),
  networkType: "bitcoin",
  currencies: [
    {
      coinDenom: "BTC",
      coinMinimalDenom: "btc",
      coinDecimals: 8,
      bridgeTo: ["Oraichain"],
      prefixToken: "oraibtc",
      Icon: BTCIcon,
      coinGeckoId: "bitcoin",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0,
      },
    },
  ],
  get feeCurrencies() {
    return this.currencies;
  },

  features: ["isBtc"],
  txExplorer: {
    name: "BlockStream",
    txUrl: "https://blockstream.info/tx/",
    accountUrl: "https://blockstream.info/address/",
  },
};
export const bitcoinTestnet: CustomChainInfo = {
  rest: "https://blockstream.info/testnet/api",
  rpc: "https://blockstream.info/testnet/api",
  chainId: ChainIdEnum.BitcoinTestnet,
  chainName: "BitcoinTestnet",
  bip44: {
    coinType: 0,
  },
  coinType: 0,
  Icon: BTCIcon,
  IconLight: BTCIcon,
  stakeCurrency: {
    coinDenom: "BTC",
    coinMinimalDenom: "btc",
    coinDecimals: 8,
    coinGeckoId: "bitcoin",
    coinImageUrl:
      "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  bech32Config: defaultBech32Config("tb"),
  networkType: "bitcoin",
  currencies: [
    {
      coinDenom: "BTC",
      coinMinimalDenom: "btc",
      coinDecimals: 8,
      bridgeTo: ["Oraichain"],
      prefixToken: "oraibtc",
      Icon: BTCIcon,
      coinGeckoId: "bitcoin",
      coinImageUrl:
        "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0,
      },
    },
  ],
  get feeCurrencies() {
    return this.currencies;
  },

  features: ["isBtc"],
  txExplorer: {
    name: "BlockStream",
    txUrl: "https://blockstream.info/testnet/tx/",
    accountUrl: "https://blockstream.info/testnet/address/",
  },
};
export const tokensIcon: TokenIcon[] = [
  {
    coinGeckoId: "oraichain-token",
    Icon: OraiIcon,
    IconLight: OraiLightIcon,
  },
  {
    coinGeckoId: "bitcoin",
    Icon: BTCIcon,
    IconLight: BTCIcon,
  },
  {
    chainId: bitcoinChainId,
    Icon: BTCIcon,
    IconLight: BTCIcon,
  },
];

export const chainIcons: ChainIcon[] = [
  {
    chainId: "Oraichain",
    Icon: OraiIcon,
    IconLight: OraiLightIcon,
  },
  {
    chainId: "bitcoinTestnet",
    Icon: BTCIcon,
    IconLight: BTCIcon,
  },
  {
    chainId: "bitcoin",
    Icon: BTCIcon,
    IconLight: BTCIcon,
  },
  {
    chainId: "oraibtc-mainnet-1",
    Icon: BitcoinIcon,
    IconLight: BitcoinIcon,
  },
  {
    chainId: "oraibtc-testnet-1",
    Icon: BitcoinIcon,
    IconLight: BitcoinIcon,
  },
];
export const mapListWithIcon = (
  list: any[],
  listIcon: ChainIcon[] | TokenIcon[],
  key: "chainId" | "coinGeckoId"
) => {
  return list.map((item) => {
    let Icon = OraiIcon;
    let IconLight = OraiLightIcon;

    const findedItem = listIcon.find((icon) => icon[key] === item[key]);
    if (findedItem) {
      Icon = findedItem.Icon;
      IconLight = findedItem.IconLight;
    }

    return {
      ...item,
      Icon,
      IconLight,
    };
  });
};

// mapped chain info with icon
export const chainInfosWithIcon = mapListWithIcon(
  [...customChainInfos, bitcoinMainnet, bitcoinTestnet],
  chainIcons,
  "chainId"
);

// mapped token with icon
export const oraichainTokensWithIcon = mapListWithIcon(
  oraichainTokens,
  tokensIcon,
  "coinGeckoId"
);
export const otherTokensWithIcon = mapListWithIcon(
  otherChainTokens,
  tokensIcon,
  "coinGeckoId"
);

export const tokensWithIcon = [otherTokensWithIcon, oraichainTokensWithIcon];
export const flattenTokensWithIcon = flatten(tokensWithIcon);

export const OraiToken: BridgeAppCurrency = {
  coinDenom: "ORAI",
  coinMinimalDenom: "orai",
  coinDecimals: 6,
  coinGeckoId: "oraichain-token",
  Icon: OraiIcon,
  IconLight: OraiLightIcon,
  bridgeTo: ["0x38", "0x01", "injective-1"],
  gasPriceStep: {
    low: 0.003,
    average: 0.005,
    high: 0.007,
  },
};

const OraiBTCToken: BridgeAppCurrency = {
  coinDenom: "ORAIBTC",
  coinMinimalDenom: "uoraibtc",
  coinDecimals: 6,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0,
  },
};

export const oraichainNetwork: CustomChainInfo = {
  rpc: "https://rpc.orai.io",
  rest: "https://lcd.orai.io",
  chainId: "Oraichain",
  chainName: "Oraichain",
  networkType: "cosmos",
  stakeCurrency: OraiToken,
  bip44: {
    coinType: 118,
  },
  bech32Config: defaultBech32Config("orai"),
  feeCurrencies: [OraiToken],

  Icon: OraiIcon,
  IconLight: OraiLightIcon,
  features: ["ibc-transfer", "cosmwasm", "wasmd_0.24+"],
  currencies: [
    {
      coinDenom: "BTC",
      coinGeckoId: "bitcoin",
      coinMinimalDenom:
        "ibc/CBC7979082B808A0A9DA4DB44DA17ABEBB615C962F367A1638ED66EE802F66BC",
      type: "native",
      bridgeTo: [bitcoinChainId],
      coinDecimals: 14,
      Icon: BTCIcon,
      IconLight: BTCIcon,
      coinImageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    },
  ],
};

export const oraibtcTestnetNetwork = {
  rpc: "https://oraibtc-rpc.perfogic.store",
  rest: "https://oraibtc-rest.perfogic.store/",
  chainId: "oraibtc-testnet-1",
  chainName: "OraiBtcTestnet",
  networkType: "cosmos",
  bip44: {
    coinType: 118,
  },
  Icon: BitcoinIcon,
  IconLight: BitcoinIcon,
  bech32Config: defaultBech32Config("oraibtc"),
  feeCurrencies: [OraiBTCToken],
  currencies: [
    {
      coinDenom: "BTC",
      coinMinimalDenom: "uoraibtc",
      coinDecimals: 6,
      coinGeckoId: "bitcoin",
      bridgeTo: ["Oraichain"],
      Icon: BitcoinIcon,
      IconLight: BitcoinIcon,
    },
  ],
};

const oraibtcMainnetNetwork = {
  rpc: "https://btc.rpc.orai.io",
  rest: "https://btc.lcd.orai.io/",
  chainId: "oraibtc-mainnet-1",
  chainName: "OraiBTC",
  networkType: "cosmos",
  bip44: {
    coinType: 118,
  },
  Icon: BitcoinIcon,
  IconLight: BitcoinIcon,
  bech32Config: defaultBech32Config("oraibtc"),
  feeCurrencies: [OraiBTCToken],
  currencies: [
    {
      coinDenom: "BTC",
      coinMinimalDenom: "uoraibtc",
      coinDecimals: 6,
      coinGeckoId: "bitcoin",
      bridgeTo: ["Oraichain"],
      Icon: BitcoinIcon,
      IconLight: BitcoinIcon,
    },
  ],
};

const bitcoinNetwork = bitcoinTestnet;
export const chainInfos: CustomChainInfo[] = [
  // networks to add on keplr
  oraichainNetwork,
  bitcoinNetwork,
  oraibtcTestnetNetwork,
  oraibtcMainnetNetwork,
];

export const btcChains = chainInfos.filter((c) => c.networkType === "bitcoin");
