// @ts-nocheck
import {
  TokenItemType,
  tokens,
  chainInfos as customChainInfos,
  OsmoToken,
  AtomToken,
  InjectiveToken,
  ChainIdEnum
} from '@oraichain/oraidex-common';
import { ReactComponent as AiriIcon } from 'assets/icons/airi.svg';
import { ReactComponent as AtomIcon } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as BnbIcon } from 'assets/icons/bnb.svg';
import { ReactComponent as EthIcon } from 'assets/icons/ethereum.svg';
import { ReactComponent as KwtIcon } from 'assets/icons/kwt.svg';
import { ReactComponent as MilkyIcon } from 'assets/icons/milky-token.svg';
import { ReactComponent as OraiIcon } from 'assets/icons/oraichain.svg';

import { ReactComponent as BTCIcon } from 'assets/icons/btc-icon.svg';
import { ReactComponent as OraiLightIcon } from 'assets/icons/oraichain_light.svg';
import { ReactComponent as OraixIcon } from 'assets/icons/oraix.svg';
import { ReactComponent as OraixLightIcon } from 'assets/icons/oraix_light.svg';
import { ReactComponent as OsmoIcon } from 'assets/icons/osmosis_light.svg';
import { ReactComponent as ScOraiIcon } from 'assets/icons/orchai.svg';
import { ReactComponent as UsdtIcon } from 'assets/icons/tether.svg';
import { ReactComponent as TronIcon } from 'assets/icons/tron.svg';
import { ReactComponent as UsdcIcon } from 'assets/icons/usd_coin.svg';
import { ReactComponent as ScAtomIcon } from 'assets/icons/scatom.svg';
import { ReactComponent as InjIcon } from 'assets/icons/inj.svg';
import { ReactComponent as NobleIcon } from 'assets/icons/noble.svg';
import { ReactComponent as NobleLightIcon } from 'assets/icons/ic_noble_light.svg';
import { ReactComponent as TimpiIcon } from 'assets/icons/timpiIcon.svg';
import { ReactComponent as NeutaroIcon } from 'assets/icons/neutaro.svg';
import { ReactComponent as OrchaiIcon } from 'assets/icons/orchaiIcon.svg';
import { ReactComponent as BitcoinIcon } from 'assets/icons/bitcoin.svg';

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
} from '@oraichain/oraidex-common';
import { BridgeAppCurrency, CustomChainInfo, defaultBech32Config } from '@oraichain/oraidex-common';
import { flatten } from 'lodash';
import { bitcoinChainId } from 'helper/constants';
import { OBTCContractAddress } from 'libs/nomic/models/ibc-chain';

const [otherChainTokens, oraichainTokens] = tokens;
type TokenIcon = Pick<TokenItemType, 'coinGeckoId' | 'Icon' | 'IconLight'>;
type ChainIcon = Pick<CustomChainInfo, 'chainId' | 'Icon' | 'IconLight'>;
export const bitcoinMainnet: CustomChainInfo = {
  rest: 'https://blockstream.info/api',
  rpc: 'https://blockstream.info/api',
  chainId: ChainIdEnum.Bitcoin,
  chainName: 'Bitcoin',
  bip44: {
    coinType: 0
  },
  coinType: 0,
  Icon: BTCIcon,
  IconLight: BTCIcon,
  stakeCurrency: {
    coinDenom: 'BTC',
    coinMinimalDenom: 'btc',
    coinDecimals: 8,
    coinGeckoId: 'bitcoin',
    coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  bech32Config: defaultBech32Config('bc'),
  networkType: 'bitcoin',
  currencies: [
    {
      coinDenom: 'BTC',
      coinMinimalDenom: 'btc',
      coinDecimals: 8,
      bridgeTo: ['Oraichain'],
      prefixToken: 'oraibtc',
      Icon: BTCIcon,
      coinGeckoId: 'bitcoin',
      coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0
      }
    }
  ],
  get feeCurrencies() {
    return this.currencies;
  },

  features: ['isBtc'],
  txExplorer: {
    name: 'BlockStream',
    txUrl: 'https://blockstream.info/tx/{txHash}',
    accountUrl: 'https://blockstream.info/address/{address}'
  }
};
export const tokensIcon: TokenIcon[] = [
  {
    coinGeckoId: 'oraichain-token',
    Icon: OraiIcon,
    IconLight: OraiLightIcon
  },
  {
    coinGeckoId: 'usd-coin',
    Icon: UsdcIcon,
    IconLight: UsdcIcon
  },
  {
    coinGeckoId: 'bitcoin',
    Icon: BTCIcon,
    IconLight: BTCIcon
  },
  {
    coinGeckoId: 'airight',
    Icon: AiriIcon,
    IconLight: AiriIcon
  },
  {
    coinGeckoId: 'tether',
    Icon: UsdtIcon,
    IconLight: UsdtIcon
  },
  {
    coinGeckoId: 'tron',
    Icon: TronIcon,
    IconLight: TronIcon
  },
  {
    coinGeckoId: 'kawaii-islands',
    Icon: KwtIcon,
    IconLight: KwtIcon
  },
  {
    coinGeckoId: 'milky-token',
    Icon: MilkyIcon,
    IconLight: MilkyIcon
  },
  {
    coinGeckoId: 'osmosis',
    Icon: OsmoIcon,
    IconLight: OsmoIcon
  },
  {
    coinGeckoId: 'injective-protocol',
    Icon: InjIcon,
    IconLight: InjIcon
  },
  {
    coinGeckoId: 'cosmos',
    Icon: AtomIcon,
    IconLight: AtomIcon
  },
  {
    coinGeckoId: 'weth',
    Icon: EthIcon,
    IconLight: EthIcon
  },
  {
    coinGeckoId: 'ethereum',
    Icon: EthIcon,
    IconLight: EthIcon
  },
  {
    coinGeckoId: 'wbnb',
    Icon: BnbIcon,
    IconLight: BnbIcon
  },
  {
    coinGeckoId: 'binancecoin',
    Icon: BnbIcon,
    IconLight: BnbIcon
  },
  {
    coinGeckoId: 'oraidex',
    Icon: OraixIcon,
    IconLight: OraixLightIcon
  },
  {
    coinGeckoId: 'scorai',
    Icon: ScOraiIcon,
    IconLight: ScOraiIcon
  },
  {
    coinGeckoId: 'scatom',
    Icon: ScAtomIcon,
    IconLight: ScAtomIcon
  },
  {
    coinGeckoId: 'neutaro',
    Icon: TimpiIcon,
    IconLight: TimpiIcon
  },
  {
    coinGeckoId: 'och',
    Icon: OrchaiIcon,
    IconLight: OrchaiIcon
  },
  {
    coinGeckoId: 'bitcoin',
    Icon: BitcoinIcon,
    IconLight: BitcoinIcon
  }
];

export const chainIcons: ChainIcon[] = [
  {
    chainId: 'Oraichain',
    Icon: OraiIcon,
    IconLight: OraiLightIcon
  },
  {
    chainId: bitcoinChainId,
    Icon: BTCIcon,
    IconLight: BTCIcon
  },
  {
    chainId: 'kawaii_6886-1',
    Icon: KwtIcon,
    IconLight: KwtIcon
  },
  {
    chainId: 'osmosis-1',
    Icon: OsmoIcon,
    IconLight: OsmoIcon
  },
  {
    chainId: 'injective-1',
    Icon: InjIcon,
    IconLight: InjIcon
  },
  {
    chainId: 'cosmoshub-4',
    Icon: AtomIcon,
    IconLight: AtomIcon
  },
  {
    chainId: '0x01',
    Icon: EthIcon,
    IconLight: EthIcon
  },
  {
    chainId: '0x2b6653dc',
    Icon: TronIcon,
    IconLight: TronIcon
  },
  {
    chainId: '0x38',
    Icon: BnbIcon,
    IconLight: BnbIcon
  },
  {
    chainId: '0x1ae6',
    Icon: KwtIcon,
    IconLight: KwtIcon
  },
  {
    chainId: 'noble-1',
    Icon: NobleIcon,
    IconLight: NobleLightIcon
  },
  {
    chainId: 'Neutaro-1',
    Icon: NeutaroIcon,
    IconLight: NeutaroIcon
  },
  {
    chainId: 'oraibtc-mainnet-1',
    Icon: BitcoinIcon,
    IconLight: BitcoinIcon
  }
];
export const mapListWithIcon = (list: any[], listIcon: ChainIcon[] | TokenIcon[], key: 'chainId' | 'coinGeckoId') => {
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
      IconLight
    };
  });
};

// mapped chain info with icon
export const chainInfosWithIcon = mapListWithIcon([...customChainInfos, bitcoinMainnet], chainIcons, 'chainId');

// mapped token with icon
export const oraichainTokensWithIcon = mapListWithIcon(oraichainTokens, tokensIcon, 'coinGeckoId');
export const otherTokensWithIcon = mapListWithIcon(otherChainTokens, tokensIcon, 'coinGeckoId');

export const tokensWithIcon = [otherTokensWithIcon, oraichainTokensWithIcon];
export const flattenTokensWithIcon = flatten(tokensWithIcon);

export const OraiToken: BridgeAppCurrency = {
  coinDenom: 'ORAI',
  coinMinimalDenom: 'orai',
  coinDecimals: 6,
  coinGeckoId: 'oraichain-token',
  Icon: OraiIcon,
  IconLight: OraiLightIcon,
  bridgeTo: ['0x38', '0x01', 'injective-1'],
  gasPriceStep: {
    low: 0.003,
    average: 0.005,
    high: 0.007
  }
};

const OraiBTCToken: BridgeAppCurrency = {
  coinDenom: 'ORAIBTC',
  coinMinimalDenom: 'uoraibtc',
  coinDecimals: 6,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0
  }
};

export const oraichainNetwork: CustomChainInfo = {
  rpc: 'https://rpc.orai.io',
  rest: 'https://lcd.orai.io',
  chainId: 'Oraichain',
  chainName: 'Oraichain',
  networkType: 'cosmos',
  stakeCurrency: OraiToken,
  bip44: {
    coinType: 118
  },
  bech32Config: defaultBech32Config('orai'),
  feeCurrencies: [OraiToken],

  Icon: OraiIcon,
  IconLight: OraiLightIcon,
  features: ['ibc-transfer', 'cosmwasm', 'wasmd_0.24+'],
  currencies: [
    {
      coinDenom: 'BTC',
      coinGeckoId: 'bitcoin',
      coinMinimalDenom: 'usat',
      type: 'cw20',
      contractAddress: OBTCContractAddress,
      bridgeTo: [bitcoinChainId],
      coinDecimals: 6,
      Icon: BTCIcon,
      IconLight: BTCIcon,
      coinImageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png'
    }
  ]
};

export const OraiBTCBridgeNetwork = {
  chainId: 'oraibtc-mainnet-1',
  chainName: 'OraiBtc Bridge',
  rpc: 'https://btc.rpc.orai.io',
  rest: 'https://btc.lcd.orai.io',
  networkType: 'cosmos',
  Icon: BTCIcon,
  IconLight: BTCIcon,
  stakeCurrency: {
    coinDenom: 'ORAIBTC',
    coinMinimalDenom: 'uoraibtc',
    coinDecimals: 6,
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0
    },
    coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  bip44: {
    coinType: 118
  },
  coinType: 118,
  bech32Config: defaultBech32Config('oraibtc'),
  currencies: [
    {
      coinDenom: 'ORAIBTC',
      coinMinimalDenom: 'uoraibtc',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0
      },
      coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
    },
    {
      coinDenom: 'oBTC',
      coinMinimalDenom: 'usat',
      coinDecimals: 14,
      gasPriceStep: {
        low: 0,
        average: 0,
        high: 0
      },
      coinImageUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
    }
  ],

  get feeCurrencies() {
    return this.currencies;
  }
};

const bitcoinNetwork = bitcoinMainnet;
export const chainInfos: CustomChainInfo[] = [
  // networks to add on keplr
  oraichainNetwork,
  bitcoinNetwork,
  {
    rpc: 'https://btc.rpc.orai.io',
    rest: 'https://btc.lcd.orai.io/',
    chainId: 'oraibtc-mainnet-1',
    chainName: 'OraiBTC',
    networkType: 'cosmos',
    bip44: {
      coinType: 118
    },
    Icon: BitcoinIcon,
    IconLight: BitcoinIcon,
    bech32Config: defaultBech32Config('oraibtc'),
    feeCurrencies: [OraiBTCToken],
    currencies: [
      {
        coinDenom: 'BTC',
        coinMinimalDenom: 'uoraibtc',
        coinDecimals: 6,
        coinGeckoId: 'bitcoin',
        bridgeTo: ['Oraichain'],
        Icon: BitcoinIcon,
        IconLight: BitcoinIcon
      }
    ]
  },
];

// exclude kawaiverse subnet and other special evm that has different cointype
export const evmChains = chainInfos.filter(
  (c) => c.networkType === 'evm' && c.bip44.coinType === 60 && c.chainId !== '0x1ae6'
);

export const btcChains = chainInfos.filter((c) => c.networkType === 'bitcoin');
