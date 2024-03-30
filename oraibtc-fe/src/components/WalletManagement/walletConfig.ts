import { WalletType as WalletCosmosType } from '@oraichain/oraidex-common/build/constant';
import { ReactComponent as KeplrIcon } from 'assets/icons/keplr-icon.svg';
import { ReactComponent as OwalletIcon } from 'assets/icons/owallet-icon.svg';
import { cosmosNetworksWithIcon, btcNetworksWithIcon } from 'helper';
console.log('🚀 ~ btcNetworksWithIcon:', btcNetworksWithIcon);

export type NetworkType = 'cosmos'| 'bitcoin';
export type WalletType = WalletCosmosType | 'bitcoin';
export type WalletNetwork = {
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
  name: string;
  nameRegistry?: WalletType;
  isActive: boolean;
  suffixName?: string;
};

export type ChainWallet = {
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
  name: string;
  chainName: string;
};

export type WalletProvider = {
  networkType: NetworkType;
  networks: any[];
  wallets: WalletNetwork[];
};

export const cosmosWallets: WalletNetwork[] = [
  {
    icon: OwalletIcon,
    name: 'Owallet',
    nameRegistry: 'owallet',
    isActive: true
  },
  {
    icon: KeplrIcon,
    name: 'Keplr',
    nameRegistry: 'keplr',
    isActive: true
  }
];

export const btcWallets: WalletNetwork[] = [
  {
    icon: OwalletIcon,
    name: 'Owallet',
    nameRegistry: 'owallet',
    isActive: true
  }
];

export const allWallets: WalletNetwork[] = [...cosmosWallets, ...btcWallets];

export const walletProvider: WalletProvider[] = [
  {
    networkType: 'cosmos',
    networks: cosmosNetworksWithIcon,
    wallets: cosmosWallets
  },
  {
    networkType: 'bitcoin',
    networks: btcNetworksWithIcon,
    wallets: btcWallets
  }
];
